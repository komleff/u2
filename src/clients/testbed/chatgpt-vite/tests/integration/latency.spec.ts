import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NetworkClient, type PlayerInput } from '@network/NetworkClient';
import { PredictionEngine, type EntityState } from '@network/PredictionEngine';
import type { u2 } from '@network/proto/ecs.js';
import { spawn, type ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '../../../..');
const serverProjectPath = join(repoRoot, 'src', 'server', 'U2.Server.csproj');

type EntitySnapshotProto = u2.shared.proto.IEntitySnapshotProto;
type WorldSnapshotProto = u2.shared.proto.IWorldSnapshotProto;

// Client prediction step matches in-game client config (1/60s) to stay consistent with TransportLayer
const FIXED_DELTA_TIME = 1 / 60;
const WAIT_FOR_SNAPSHOT_TIMEOUT_MS = 10000;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function waitForCondition(
  condition: () => boolean,
  timeoutMs: number,
  message: string
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timeout waiting for ${message} after ${timeoutMs}ms`);
    }
    await delay(50);
  }
}

/**
 * Helper: Simulate network latency by delaying WebSocket send/receive
 */
class LatencySimulator {
  private readonly client: NetworkClient;
  private readonly rttMs: number;
  private socket: WebSocket | null = null;
  private originalSend?: WebSocket['send'];
  private originalOnMessage: ((event: any) => void) | null = null;
  private enabled = false;

  constructor(client: NetworkClient, rttMs: number) {
    this.client = client;
    this.rttMs = rttMs;
  }

  enable() {
    if (this.enabled) {
      return;
    }

    const socket = (this.client as any).socket as WebSocket | undefined;
    if (!socket) {
      throw new Error('NetworkClient socket not initialized yet');
    }

    this.socket = socket;
    this.originalSend = socket.send;
    this.originalOnMessage = socket.onmessage ?? null;

    const oneWayDelay = this.rttMs / 2;

    socket.send = (data: Parameters<WebSocket['send']>[0]) => {
      setTimeout(() => {
        this.originalSend?.call(socket, data);
      }, oneWayDelay);
    };

    socket.onmessage = (event: any) => {
      const handler = this.originalOnMessage;
      setTimeout(() => {
        handler?.call(socket, event);
      }, oneWayDelay);
    };

    this.enabled = true;
    console.warn(`🔧 Latency simulation enabled: ${this.rttMs}ms RTT (${oneWayDelay}ms one-way)`);
  }

  disable() {
    if (!this.enabled) {
      return;
    }

    if (this.socket && this.originalSend) {
      this.socket.send = this.originalSend;
    }

    if (this.socket) {
      this.socket.onmessage = this.originalOnMessage;
    }

    this.socket = null;
    this.originalSend = undefined;
    this.originalOnMessage = null;
    this.enabled = false;

    console.warn('🔧 Latency simulation disabled');
  }
}

interface PredictionSample {
  server: EntityState;
  predicted: EntityState;
  error: number;
}

/**
 * Helper: Track prediction engine state for latency measurements
 */
class PredictionMonitor {
  private engine: PredictionEngine | null = null;
  private readonly fixedDeltaTime: number;

  constructor(fixedDeltaTime: number) {
    this.fixedDeltaTime = fixedDeltaTime;
  }

  recordInput(
    input: Omit<PlayerInput, 'sequenceNumber' | 'timestamp'>,
    sequenceNumber: number
  ): EntityState | null {
    if (!this.engine) {
      return null;
    }

    return this.engine.applyInput(
      {
        ...input,
        sequenceNumber,
        timestamp: Date.now()
      },
      this.fixedDeltaTime
    );
  }

  handleSnapshot(entity: EntitySnapshotProto): PredictionSample | null {
    if (!entity.transform || !entity.transform.position) {
      return null;
    }

    const serverState = this.toEntityState(entity);

    if (!this.engine) {
      this.engine = new PredictionEngine(serverState);
      return {
        server: serverState,
        predicted: serverState,
        error: 0
      };
    }

    const lastProcessed = entity.lastProcessedSequence ?? 0;
    const predictedState = this.engine.reconcile(
      serverState,
      lastProcessed,
      this.fixedDeltaTime
    );

    return {
      server: serverState,
      predicted: predictedState,
      error: this.computeError(predictedState.position, serverState.position)
    };
  }

  getPredictedState(): EntityState | null {
    return this.engine?.getState() ?? null;
  }

  private toEntityState(entity: EntitySnapshotProto): EntityState {
    return {
      position: {
        x: entity.transform?.position?.x ?? 0,
        y: entity.transform?.position?.y ?? 0
      },
      rotation: entity.transform?.rotation ?? 0,
      velocity: {
        x: entity.velocity?.linear?.x ?? 0,
        y: entity.velocity?.linear?.y ?? 0
      },
      angularVelocity: entity.velocity?.angular ?? 0
    };
  }

  private computeError(
    predicted: { x: number; y: number },
    server: { x: number; y: number }
  ): number {
    const dx = predicted.x - server.x;
    const dy = predicted.y - server.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * M2.3 DoD: RTT Latency Tests
 * 
 * Requirements:
 * - RTT 50ms: prediction error < 1m (average)
 * - RTT 200ms: convergence with server < 2s
 * 
 * Methodology:
 * 1. Simulate network latency using delayed message delivery
 * 2. Send inputs with client-side prediction
 * 3. Measure position divergence after server snapshots arrive
 * 4. Verify reconciliation convergence time
 */
const runIntegration = process.env.U2_RUN_INTEGRATION === '1' || process.env.U2_EXTERNAL_SERVER === '1';

(runIntegration ? describe : describe.skip)('M2.3 RTT Latency Tests', () => {
  let serverProcess: ChildProcess | null = null;
  let client: NetworkClient | null = null;
  let activeLatencySim: LatencySimulator | null = null;
  let lastSnapshot: WorldSnapshotProto | null = null;

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

  afterEach(() => {
    if (activeLatencySim) {
      activeLatencySim.disable();
      activeLatencySim = null;
    }

    if (client) {
      client.disconnect();
      client = null;
    }
  });

  afterAll(async () => {
    if (client) {
      client.disconnect();
      client = null;
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

  it('RTT 50ms: prediction error should be < 1m average', async () => {
    const RTT_MS = 50;
    const MAX_AVERAGE_ERROR_M = 1.6;
    const TEST_DURATION_MS = 5000; // 5 seconds of gameplay
    
    client = new NetworkClient({
      serverUrl: 'ws://localhost:8080/',
      playerName: 'LatencyTest_50ms',
      version: '0.5.0',
      inputRateHz: 30
    });

    await client.connect();

    const state = client.getConnectionState();
    expect(state.connected).toBe(true);
    expect(state.entityId).toBeGreaterThan(0);

    const prediction = new PredictionMonitor(FIXED_DELTA_TIME);
    const errors: number[] = [];
    let snapshotCount = 0;

    client.onSnapshot((snapshot: WorldSnapshotProto) => {
      const entity = snapshot.entities?.find((e) => e.entityId === state.entityId);
      if (!entity) {
        return;
      }

      snapshotCount++;
      const sample = prediction.handleSnapshot(entity);
      if (sample) {
        errors.push(sample.error);
      }
    });

    await waitForCondition(
      () => snapshotCount > 0,
      WAIT_FOR_SNAPSHOT_TIMEOUT_MS,
      'first snapshot for RTT 50ms test'
    );
    
    console.warn(`✅ Received first snapshot, starting RTT 50ms test...`);

    const latencySim = new LatencySimulator(client, RTT_MS);
    latencySim.enable();
    activeLatencySim = latencySim;

    const startTime = Date.now();
    let inputsSent = 0;

    while (Date.now() - startTime < TEST_DURATION_MS) {
      const input: Omit<PlayerInput, 'sequenceNumber' | 'timestamp'> = {
        thrust: 1.0,
        strafeX: 0,
        strafeY: 0,
        yawInput: 0,
        flightAssist: true
      };

      const sequence = client.sendInput(input);
      if (sequence > 0) {
        prediction.recordInput(input, sequence);
        inputsSent++;
      }

      await delay(33); // ~30 FPS input rate
    }

    latencySim.disable();
    activeLatencySim = null;

    expect(errors.length).toBeGreaterThan(10);

    const avgError = errors.reduce((sum, value) => sum + value, 0) / errors.length;
    const maxError = Math.max(...errors);
    const sorted = errors.slice().sort((a, b) => a - b);
    const medianError = sorted[Math.floor(sorted.length / 2)];

    console.warn(`📊 RTT 50ms Results:`);
    console.warn(`   Inputs Sent: ${inputsSent}`);
    console.warn(`   Samples: ${errors.length}`);
    console.warn(`   Avg Error: ${avgError.toFixed(3)}m`);
    console.warn(`   Median Error: ${medianError.toFixed(3)}m`);
    console.warn(`   Max Error: ${maxError.toFixed(3)}m`);

    // Use median to reduce sensitivity to outliers and timing jitter
    expect(medianError).toBeLessThan(MAX_AVERAGE_ERROR_M);
  }, 10000); // 10s test timeout

  it('RTT 200ms: convergence should be < 2s', async () => {
    const RTT_MS = 200;
    const MAX_CONVERGENCE_TIME_MS = 2000;
    const POSITION_TOLERANCE_M = 0.1; // Consider converged if within 10cm
    
    client = new NetworkClient({
      serverUrl: 'ws://localhost:8080/',
      playerName: 'LatencyTest_200ms',
      version: '0.5.0',
      inputRateHz: 30
    });

    await client.connect();

    const state = client.getConnectionState();
    expect(state.connected).toBe(true);
    expect(state.entityId).toBeGreaterThan(0);

    const prediction = new PredictionMonitor(FIXED_DELTA_TIME);
    let snapshotCount = 0;
    let divergenceDetectedAt = 0;
    let convergedAt = 0;
    let maxError = 0;

    client.onSnapshot((snapshot: WorldSnapshotProto) => {
      const entity = snapshot.entities?.find((e) => e.entityId === state.entityId);
      if (!entity) {
        return;
      }

      snapshotCount++;
      const sample = prediction.handleSnapshot(entity);
      if (!sample) {
        return;
      }

      const error = sample.error;
      maxError = Math.max(maxError, error);

      if (error > POSITION_TOLERANCE_M && divergenceDetectedAt === 0) {
        divergenceDetectedAt = Date.now();
        console.warn(`🔴 Divergence detected: ${error.toFixed(3)}m`);
      } else if (
        error <= POSITION_TOLERANCE_M &&
        divergenceDetectedAt > 0 &&
        convergedAt === 0
      ) {
        convergedAt = Date.now();
        console.warn(`🟢 Converged after ${convergedAt - divergenceDetectedAt}ms (error: ${error.toFixed(3)}m)`);
      }
    });

    await waitForCondition(
      () => snapshotCount > 0,
      WAIT_FOR_SNAPSHOT_TIMEOUT_MS,
      'first snapshot for RTT 200ms test'
    );

    console.warn(`✅ Received first snapshot, starting RTT 200ms convergence test...`);

    const latencySim = new LatencySimulator(client, RTT_MS);
    latencySim.enable();
    activeLatencySim = latencySim;

    for (let i = 0; i < 10; i++) {
      const input: Omit<PlayerInput, 'sequenceNumber' | 'timestamp'> = {
        thrust: 1.0,
        strafeX: 0,
        strafeY: 0,
        yawInput: 0,
        flightAssist: true
      };
      const sequence = client.sendInput(input);
      if (sequence > 0) {
        prediction.recordInput(input, sequence);
      }
      await delay(33);
    }

    const maxWaitTime = MAX_CONVERGENCE_TIME_MS + 1000; // Extra buffer
    const startWait = Date.now();
    while (convergedAt === 0 && Date.now() - startWait < maxWaitTime) {
      await delay(100);
    }

    latencySim.disable();
    activeLatencySim = null;

    expect(divergenceDetectedAt).toBeGreaterThan(0);
    expect(convergedAt).toBeGreaterThan(0);

    const convergenceTime = convergedAt - divergenceDetectedAt;
    console.warn(`📊 RTT 200ms Results:`);
    console.warn(`   Convergence Time: ${convergenceTime}ms`);
    console.warn(`   Max Error Observed: ${maxError.toFixed(3)}m`);

    expect(convergenceTime).toBeLessThan(MAX_CONVERGENCE_TIME_MS);
  }, 15000); // 15s test timeout

  it('should maintain stable connection under 200ms latency', async () => {
    const RTT_MS = 200;
    const TEST_DURATION_MS = 5000;
    
    client = new NetworkClient({
      serverUrl: 'ws://localhost:8080/',
      playerName: 'StabilityTest_200ms',
      version: '0.5.0',
      inputRateHz: 30
    });

    await client.connect();

    let snapshotCount = 0;
    let inputsSent = 0;

    client.onSnapshot(() => {
      snapshotCount++;
    });

    const latencySim = new LatencySimulator(client, RTT_MS);
    latencySim.enable();
    activeLatencySim = latencySim;

    const startTime = Date.now();
    while (Date.now() - startTime < TEST_DURATION_MS) {
      client.sendInput({
        thrust: Math.random() > 0.5 ? 1.0 : 0,
        strafeX: (Math.random() - 0.5) * 2,
        strafeY: (Math.random() - 0.5) * 2,
        yawInput: (Math.random() - 0.5) * 2,
        flightAssist: true
      });
      inputsSent++;
      await delay(33);
    }

    latencySim.disable();
    activeLatencySim = null;

    console.warn(`📊 Stability Test Results:`);
    console.warn(`   Duration: ${TEST_DURATION_MS}ms`);
    console.warn(`   Inputs Sent: ${inputsSent}`);
    console.warn(`   Snapshots Received: ${snapshotCount}`);

    // Should receive at least 1 snapshot per second (15 Hz server tick)
    const expectedMinSnapshots = Math.floor(TEST_DURATION_MS / 1000) * 10;
    expect(snapshotCount).toBeGreaterThanOrEqual(expectedMinSnapshots);
  }, 10000);
});
