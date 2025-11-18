import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NetworkClient } from '../../src/network/NetworkClient';
import type { u2 } from '../../src/network/proto/ecs';
import { spawn, type ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

type WorldSnapshotProto = u2.shared.proto.IWorldSnapshotProto;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('M2.3 Network Integration', () => {
  let serverProcess: ChildProcess | null = null;
  let client: NetworkClient | null = null;

  beforeAll(async () => {
    // Start server
    const serverPath = join(__dirname, '../../src/server/bin/Release/net8.0/U2.Server.exe');
    
    serverProcess = spawn(serverPath, ['--network'], {
      cwd: join(__dirname, '../../src/server/bin/Release/net8.0'),
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server startup timeout')), 10000);
      
      serverProcess!.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('WebSocket relay running')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      serverProcess!.stderr?.on('data', (data) => {
        console.error('[Server Error]', data.toString());
      });
    });

    console.warn('✅ Server started');
  });

  afterAll(() => {
    if (client) {
      client.disconnect();
    }

    if (serverProcess) {
      serverProcess.kill();
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
    expect(state.entityId).toBeGreaterThan(0);

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
    const inputSent = client!.sendInput({
      thrust: 0.5,
      strafeX: 0.0,
      strafeY: 0.0,
      yawInput: 0.2,
      flightAssist: true
    });

    expect(inputSent).toBe(true);
    console.warn('📤 Input sent');

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

    const inputs = [];
    const startTime = performance.now();

    // Try to send 100 inputs immediately
    for (let i = 0; i < 100; i++) {
      const sent = client!.sendInput({
        thrust: 0.5,
        strafeX: 0.0,
        strafeY: 0.0,
        yawInput: 0.0,
        flightAssist: true
      });
      inputs.push({ sent, time: performance.now() - startTime });
    }

    const sentCount = inputs.filter(x => x.sent).length;
    
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
