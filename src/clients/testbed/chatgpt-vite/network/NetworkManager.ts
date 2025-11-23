import { NetworkClient, type NetworkConfig, type PlayerInput } from './NetworkClient';
import { PredictionEngine, type EntityState } from './PredictionEngine';
import { protoToEntityState } from './stateAdapters';
import type { u2 } from './proto/ecs.js';

type WorldSnapshotProto = u2.shared.proto.IWorldSnapshotProto;

export type ConnectionEvent =
  | { status: "connected"; clientId: number; entityId: number }
  | { status: "disconnected" };

export interface WorldUpdateMeta {
  tick: number;
  receivedAt: number;
  lastProcessedSequences?: Map<number, number>;
  raw?: WorldSnapshotProto;
}

export interface NetworkManagerConfig extends NetworkConfig {
  enablePrediction: boolean;
  reconciliationThreshold: number; // meters
  fixedDeltaTime: number; // seconds (should match server tick rate)
}

/**
 * High-level network manager
 * Coordinates client connection, prediction, and reconciliation
 */
export class NetworkManager {
  private client: NetworkClient;
  private prediction: PredictionEngine | null = null;
  private config: NetworkManagerConfig;
  private smoothedState: EntityState | null = null;
  
  private localEntityId: number | null = null;
  private lastSnapshotTick: number = 0;
  
  // Callbacks
  private onStateUpdateCallback?: (state: EntityState) => void;
  private onWorldUpdateCallback?: (entities: Map<number, EntityState>, meta?: WorldUpdateMeta) => void;
  private onConnectionChangeCallback?: (event: ConnectionEvent) => void;

  constructor(config: NetworkManagerConfig) {
    this.config = config;
    this.client = new NetworkClient(config);

    // Set up client callbacks
    this.client.onConnected((clientId, entityId) => {
      this.handleConnected(clientId, entityId);
    });

    this.client.onSnapshot((snapshot) => {
      this.handleSnapshot(snapshot);
    });

    this.client.onDisconnected(() => {
      this.handleDisconnected();
    });
  }

  /**
   * Connect to the server
   */
  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    this.client.disconnect();
  }

  /**
   * Update local player input
   * Applies prediction if enabled and sends to server
   */
  updateInput(
    thrust: number,
    strafeX: number,
    strafeY: number,
    yawInput: number,
    flightAssist: boolean
  ): void {
    if (!this.prediction) {
      return;
    }

    const input: Omit<PlayerInput, 'sequenceNumber' | 'timestamp'> = {
      thrust,
      strafeX,
      strafeY,
      yawInput,
      flightAssist
    };

    // Send to server (with rate limiting)
    const sequenceNumber = this.client.sendInput(input);

    if (sequenceNumber === 0) {
      return; // Rate limited
    }

    // Apply locally for immediate feedback
    if (this.config.enablePrediction) {
      const state = this.prediction.applyInput(
        {
          ...input,
          sequenceNumber, // Real sequence number from client
          timestamp: Date.now()
        },
        this.config.fixedDeltaTime
      );

      this.pushPredictedState(state);
    }
  }

  /**
   * Register callback for local player state updates
   */
  onStateUpdate(callback: (state: EntityState) => void): void {
    this.onStateUpdateCallback = callback;
  }

  /**
   * Register callback for world updates (all entities)
   */
  onWorldUpdate(callback: (entities: Map<number, EntityState>, meta?: WorldUpdateMeta) => void): void {
    this.onWorldUpdateCallback = callback;
  }

  /**
   * Register callback for connection state changes
   */
  onConnectionChange(callback: (event: ConnectionEvent) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Get current connection state
   */
  isConnected(): boolean {
    return this.client.getConnectionState().connected;
  }

  /**
   * Get local entity ID
   */
  getLocalEntityId(): number | null {
    return this.localEntityId;
  }

  /**
   * Get current predicted state (if prediction enabled)
   */
  getPredictedState(): EntityState | null {
    if (this.smoothedState) {
      return this.cloneState(this.smoothedState);
    }
    return this.prediction?.getState() ?? null;
  }

  /**
   * Get estimated round-trip time in milliseconds (M4)
   */
  getRoundTripTime(): number {
    return this.client.getRoundTripTime();
  }

  private pushPredictedState(next: EntityState): void {
    const smoothed = this.smoothState(next);
    if (this.onStateUpdateCallback) {
      this.onStateUpdateCallback(smoothed);
    }
  }

  private smoothState(next: EntityState): EntityState {
    const alpha = 0.25; // easing factor for visual smoothing
    if (!this.smoothedState) {
      this.smoothedState = this.cloneState(next);
      return this.cloneState(this.smoothedState);
    }

    this.smoothedState.position.x += (next.position.x - this.smoothedState.position.x) * alpha;
    this.smoothedState.position.y += (next.position.y - this.smoothedState.position.y) * alpha;
    this.smoothedState.velocity.x += (next.velocity.x - this.smoothedState.velocity.x) * alpha;
    this.smoothedState.velocity.y += (next.velocity.y - this.smoothedState.velocity.y) * alpha;
    this.smoothedState.angularVelocity +=
      (next.angularVelocity - this.smoothedState.angularVelocity) * alpha;
    this.smoothedState.rotation = this.smoothAngle(
      this.smoothedState.rotation,
      next.rotation,
      alpha
    );

    return this.cloneState(this.smoothedState);
  }

  private smoothAngle(current: number, target: number, alpha: number): number {
    let delta = target - current;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    return current + delta * alpha;
  }

  private cloneState(state: EntityState): EntityState {
    return {
      position: { ...state.position },
      rotation: state.rotation,
      velocity: { ...state.velocity },
      angularVelocity: state.angularVelocity
    };
  }

  private handleConnected(clientId: number, entityId: number): void {
    this.localEntityId = entityId;

    // Initialize prediction engine with default state
    const initialState: EntityState = {
      position: { x: 0, y: 0 },
      rotation: 0,
      velocity: { x: 0, y: 0 },
      angularVelocity: 0
    };

    this.prediction = new PredictionEngine(
      initialState,
      undefined,
      this.config.reconciliationThreshold
    );
    this.smoothedState = this.cloneState(initialState);

    this.log("info", "Connected", { clientId, entityId });

    if (this.onConnectionChangeCallback) {
      this.onConnectionChangeCallback({ status: "connected", clientId, entityId });
    }
  }

  private handleSnapshot(snapshot: WorldSnapshotProto): void {
    const tick = snapshot.tick ?? 0;
    
    // Ignore old snapshots
    if (tick <= this.lastSnapshotTick) {
      return;
    }
    this.lastSnapshotTick = tick;

    const entities = new Map<number, EntityState>();
    const lastProcessedSequences = new Map<number, number>();

    // Process all entities in snapshot
    for (const entityProto of snapshot.entities ?? []) {
      const entityId = entityProto.entityId ?? 0;
      const state = protoToEntityState(entityProto);
      entities.set(entityId, state);
      lastProcessedSequences.set(entityId, entityProto.lastProcessedSequence ?? 0);

      // Reconcile local player if prediction is enabled
      if (entityId === this.localEntityId && this.config.enablePrediction && this.prediction) {
        // M2.3: Use server's last processed sequence for reconciliation
        const lastProcessed = entityProto.lastProcessedSequence ?? 0;
        
        const correctedState = this.prediction.reconcile(
          state,
          lastProcessed,
          this.config.fixedDeltaTime
        );

        this.pushPredictedState(correctedState);
      }
    }

    // Notify world update
    if (this.onWorldUpdateCallback) {
      this.onWorldUpdateCallback(entities, {
        tick,
        receivedAt: performance.now(),
        lastProcessedSequences,
        raw: snapshot
      });
    }
  }

  private handleDisconnected(): void {
    this.prediction = null;
    this.smoothedState = null;
    this.localEntityId = null;
    this.lastSnapshotTick = 0;
    this.log("warn", "Disconnected");

    if (this.onConnectionChangeCallback) {
      this.onConnectionChangeCallback({ status: "disconnected" });
    }
  }

  private log(level: "info" | "warn" | "error", message: string, context?: unknown) {
    if (this.config.logger) {
      this.config.logger(level, message, context);
      return;
    }
    const payload = context !== undefined ? [message, context] : [message];
    if (level === "info") console.info("[NetworkManager]", ...payload);
    else if (level === "warn") console.warn("[NetworkManager]", ...payload);
    else console.error("[NetworkManager]", ...payload);
  }
}
