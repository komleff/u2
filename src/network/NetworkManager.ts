import { NetworkClient, type NetworkConfig, type PlayerInput } from './NetworkClient';
import { PredictionEngine, type EntityState } from './PredictionEngine';
import type { u2 } from './proto/ecs.js';

type WorldSnapshotProto = u2.shared.proto.IWorldSnapshotProto;
type EntitySnapshotProto = u2.shared.proto.IEntitySnapshotProto;

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
  
  private localEntityId: number | null = null;
  private lastSnapshotTick: number = 0;
  
  // Callbacks
  private onStateUpdateCallback?: (state: EntityState) => void;
  private onWorldUpdateCallback?: (entities: Map<number, EntityState>) => void;

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
    const sent = this.client.sendInput(input);

    if (!sent) {
      return; // Rate limited
    }

    // Apply locally for immediate feedback
    if (this.config.enablePrediction) {
      const state = this.prediction.applyInput(
        {
          ...input,
          sequenceNumber: 0, // Will be filled by client
          timestamp: Date.now()
        },
        this.config.fixedDeltaTime
      );

      if (this.onStateUpdateCallback) {
        this.onStateUpdateCallback(state);
      }
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
  onWorldUpdate(callback: (entities: Map<number, EntityState>) => void): void {
    this.onWorldUpdateCallback = callback;
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
    return this.prediction?.getState() ?? null;
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

    this.prediction = new PredictionEngine(initialState);

    console.warn('[NetworkManager] Connected:', { clientId, entityId });
  }

  private handleSnapshot(snapshot: WorldSnapshotProto): void {
    const tick = snapshot.tick ?? 0;
    
    // Ignore old snapshots
    if (tick <= this.lastSnapshotTick) {
      return;
    }
    this.lastSnapshotTick = tick;

    const entities = new Map<number, EntityState>();

    // Process all entities in snapshot
    for (const entityProto of snapshot.entities ?? []) {
      const entityId = entityProto.entityId ?? 0;
      const state = this.protoToState(entityProto);
      entities.set(entityId, state);

      // Reconcile local player if prediction is enabled
      if (entityId === this.localEntityId && this.config.enablePrediction && this.prediction) {
        // Server doesn't send sequence number yet, so we use a simple reconciliation
        // In a full implementation, server would include lastProcessedInputSequence
        const correctedState = this.prediction.reconcile(
          state,
          0, // lastProcessedSequence - would need server support
          this.config.fixedDeltaTime
        );

        if (this.onStateUpdateCallback) {
          this.onStateUpdateCallback(correctedState);
        }
      }
    }

    // Notify world update
    if (this.onWorldUpdateCallback) {
      this.onWorldUpdateCallback(entities);
    }
  }

  private handleDisconnected(): void {
    this.prediction = null;
    this.localEntityId = null;
    this.lastSnapshotTick = 0;
    console.warn('[NetworkManager] Disconnected');
  }

  private protoToState(proto: EntitySnapshotProto): EntityState {
    return {
      position: {
        x: proto.transform?.position?.x ?? 0,
        y: proto.transform?.position?.y ?? 0
      },
      rotation: proto.transform?.rotation ?? 0,
      velocity: {
        x: proto.velocity?.linear?.x ?? 0,
        y: proto.velocity?.linear?.y ?? 0
      },
      angularVelocity: proto.velocity?.angular ?? 0
    };
  }
}
