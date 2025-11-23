import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NetworkClient } from '@network/NetworkClient';
import type { u2 } from '@network/proto/ecs';
import { spawn, type ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import WebSocket from 'ws';

type WorldSnapshotProto = u2.shared.proto.IWorldSnapshotProto;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '../../../..');
const serverProjectPath = join(repoRoot, 'src', 'server', 'U2.Server.csproj');

const runIntegration = process.env.U2_RUN_INTEGRATION === '1' || process.env.U2_EXTERNAL_SERVER === '1';

(runIntegration ? describe : describe.skip)('M2.3 Network Integration', () => {
  let serverProcess: ChildProcess | null = null;
  let client: NetworkClient | null = null;

  const waitForServer = (timeoutMs: number) =>
    new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`Server startup timeout after ${timeoutMs / 1000}s`)),
        timeoutMs
      );

      let settled = false;
      const ws = new WebSocket('ws://localhost:8080/');
      ws.once('open', () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      });
      ws.once('error', (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(err);
      });
    });

  beforeAll(async () => {
    const useExternal = process.env.U2_EXTERNAL_SERVER === '1';

    if (useExternal) {
      await waitForServer(120000);
      console.warn('✅ Using external server on ws://localhost:8080/');
      return;
    }

    // Start server using dotnet run for cross-platform compatibility
    serverProcess = spawn(
      'dotnet',
      ['run', '--project', serverProjectPath, '--', '--network'],
      {
        cwd: repoRoot,
        stdio: 'pipe',
        env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: '1' }
      }
    );

    // Wait for server to start with proper cleanup on failure
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server startup timeout after 120s'));
        }, 120000);
        
        const checkOutput = (data: Buffer) => {
          const output = data.toString();
          // Check for various readiness signals (resilient to log format changes)
          if (output.includes('WebSocket relay running') || 
              output.includes('WebSocket relay listening') ||
              output.includes('listening on') ||
              output.includes(':8080')) {
            clearTimeout(timeout);
            resolve();
          }
        };

        serverProcess!.stdout?.on('data', checkOutput);
        serverProcess!.stderr?.on('data', checkOutput); // .NET ILogger uses stderr
        
        // Handle spawn errors
        serverProcess!.on('error', (err) => {
          clearTimeout(timeout);
          reject(new Error(`Server spawn failed: ${err.message}`));
        });
      });

      console.warn('✅ Server started');
    } catch (error) {
      // Critical: Kill orphaned process on startup failure
      if (serverProcess) {
        serverProcess.kill('SIGTERM');
        serverProcess = null;
      }
      throw error; // Re-throw to fail the test suite
    }
  }, 90000); // Allow extra time for dotnet run

  afterAll(async () => {
    if (client) {
      client.disconnect();
    }

    if (serverProcess) {
      const pid = serverProcess.pid;
      serverProcess.kill('SIGTERM');
      
      // Wait for process to exit (prevent orphaned processes)
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn(`⚠️ Server process ${pid} did not exit cleanly, force killing`);
          serverProcess?.kill('SIGKILL');
          resolve();
        }, 5000);
        
        serverProcess!.once('exit', (code) => {
          clearTimeout(timeout);
          console.warn(`✅ Server process ${pid} exited with code ${code}`);
          resolve();
        });
      });
      
      serverProcess = null;
    }
  });

  it('should connect to WebSocket relay', async () => {
    client = new NetworkClient({
      serverUrl: 'ws://localhost:8080/',
      playerName: 'TestPlayer',
      version: '0.5.0',
      inputRateHz: 30
    });

    await client.connect();

    const state = client.getConnectionState();
    expect(state.connected).toBe(true);
    expect(state.clientId).toBeGreaterThan(0);
    expect(state.entityId).toBeGreaterThan(0); // Server must assign valid entity ID for client-side prediction

    console.warn('✅ Connected:', { clientId: state.clientId, entityId: state.entityId });
  });

  it('should send player input and receive snapshots', async () => {
    expect(client).toBeTruthy();

    let snapshotReceived = false;
    let lastSnapshot: WorldSnapshotProto | null = null;

    client!.onSnapshot((snapshot) => {
      snapshotReceived = true;
      lastSnapshot = snapshot;
      console.warn('📥 Snapshot:', {
        tick: snapshot.tick,
        entities: snapshot.entities?.length || 0
      });
    });

    // Send input
    const sequenceNumber = client!.sendInput({
      thrust: 0.5,
      strafeX: 0.0,
      strafeY: 0.0,
      yawInput: 0.2,
      brake: false,
      flightAssist: true
    });

    expect(sequenceNumber).toBeGreaterThan(0); // Returns sequence number, not boolean
    console.warn('📤 Input sent with sequence:', sequenceNumber);

    // Wait for snapshot (server broadcasts at 15 Hz = ~66ms interval)
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (snapshotReceived) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 10);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 2000); // 2 second timeout
    });

    expect(snapshotReceived).toBe(true);
    expect(lastSnapshot).toBeTruthy();
    expect(lastSnapshot!.tick).toBeGreaterThan(0);

    console.warn('✅ Integration test passed');
  });

  it('should respect input rate limiting (30 Hz)', () => {
    expect(client).toBeTruthy();

    const sequenceNumbers = [];
    const startTime = performance.now();

    // Try to send 100 inputs immediately
    for (let i = 0; i < 100; i++) {
      const seq = client!.sendInput({
      thrust: 0.5,
      strafeX: 0.0,
      strafeY: 0.0,
      yawInput: 0.0,
      brake: false,
      flightAssist: true
    });
      sequenceNumbers.push({ seq, time: performance.now() - startTime });
    }

    const sentCount = sequenceNumbers.filter(x => x.seq > 0).length;
    
    // At 30 Hz, min interval is 33.33ms
    // In ~0ms, should send only 1-2 inputs max
    expect(sentCount).toBeLessThanOrEqual(3);
    
    console.warn(`✅ Rate limiting: ${sentCount}/100 inputs sent (expected ≤3)`);
  });

  it('should handle disconnection gracefully', () => {
    expect(client).toBeTruthy();

    let disconnected = false;
    client!.onDisconnected(() => {
      disconnected = true;
    });

    client!.disconnect();

    expect(disconnected).toBe(true);
    expect(client!.getConnectionState().connected).toBe(false);

    console.warn('✅ Disconnection handled');
  });
});
