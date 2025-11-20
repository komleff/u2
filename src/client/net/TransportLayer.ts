import { NetworkManager, type NetworkManagerConfig, type ConnectionEvent, type WorldUpdateMeta } from "@network/NetworkManager";
import type { EntityState } from "@network/PredictionEngine";
import type { CommandFrame } from "../input/InputManager";

export interface TransportStatus {
  connected: boolean;
  connecting: boolean;
  lastChange: number;
  attempts: number;
  lastError?: string;
}

export interface TransportCallbacks {
  onWorld: (entities: Map<number, EntityState>, meta?: WorldUpdateMeta) => void;
  onLocalState?: (state: EntityState) => void;
  onConnection?: (event: ConnectionEvent) => void;
  onStatus?: (status: TransportStatus) => void;
}

export class TransportLayer {
  private manager: NetworkManager | null = null;
  private desiredOnline = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private suppressReconnectCallbacks = false;
  private status: TransportStatus = {
    connected: false,
    connecting: false,
    attempts: 0,
    lastChange: performance.now()
  };

  constructor(
    private readonly config: NetworkManagerConfig,
    private readonly callbacks: TransportCallbacks
  ) {}

  start() {
    this.desiredOnline = true;
    if (!this.status.connected && !this.status.connecting) {
      this.tryConnect();
    }
  }

  stop() {
    this.desiredOnline = false;
    this.clearReconnect();
    this.disposeManager();

    this.status = {
      connected: false,
      connecting: false,
      attempts: this.attempts,
      lastChange: performance.now(),
      lastError: this.status.lastError
    };
    this.emitStatus();
  }

  sendInput(frame: CommandFrame) {
    if (!this.manager || !this.status.connected) return;

    this.manager.updateInput(
      frame.thrust,
      frame.strafeX,
      frame.strafeY,
      frame.yaw,
      frame.flightAssist
    );
  }

  getStatus(): TransportStatus {
    return { ...this.status };
  }

  getLocalEntityId(): number | null {
    return this.manager?.getLocalEntityId() ?? null;
  }

  getPredictedState(): EntityState | null {
    return this.manager?.getPredictedState() ?? null;
  }

  private tryConnect() {
    this.clearReconnect();
    this.disposeManager();
    this.status = {
      ...this.status,
      connecting: true,
      lastChange: performance.now()
    };
    this.emitStatus();

    this.manager = new NetworkManager(this.config);
    this.manager.onStateUpdate((state) => {
      this.callbacks.onLocalState?.(state);
    });

    this.manager.onWorldUpdate((entities, meta) => {
      this.callbacks.onWorld(entities, meta);
    });

    this.manager.onConnectionChange((event) => {
      if (this.suppressReconnectCallbacks) return;
      this.callbacks.onConnection?.(event);

      if (event.status === "connected") {
        this.status = {
          connected: true,
          connecting: false,
          attempts: this.attempts,
          lastChange: performance.now()
        };
        this.attempts = 0;
        this.emitStatus();
      } else {
        this.status = {
          connected: false,
          connecting: false,
          attempts: this.attempts,
          lastChange: performance.now()
        };
        this.emitStatus();
        this.scheduleReconnect();
      }
    });

    this.manager
      .connect()
      .catch((error) => {
        this.status = {
          connected: false,
          connecting: false,
          attempts: this.attempts,
          lastError: error?.message ?? "connect failed",
          lastChange: performance.now()
        };
        this.emitStatus();
        this.scheduleReconnect();
      });
  }

  private scheduleReconnect() {
    if (!this.desiredOnline) return;

    const delay = Math.min(5000, 500 * Math.pow(1.6, this.attempts));
    this.attempts += 1;

    this.clearReconnect();
    this.status = {
      ...this.status,
      connecting: true,
      lastChange: performance.now()
    };
    this.emitStatus();

    this.reconnectTimer = setTimeout(() => {
      this.tryConnect();
    }, delay);
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private disposeManager() {
    if (this.manager) {
      this.suppressReconnectCallbacks = true;
      this.manager.disconnect();
      this.suppressReconnectCallbacks = false;
      this.manager = null;
    }
  }

  private emitStatus() {
    this.callbacks.onStatus?.({ ...this.status });
  }
}
