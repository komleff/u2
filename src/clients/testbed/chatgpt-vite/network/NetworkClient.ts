import { CLIENT_CONFIG } from '@config/client';
import { u2 } from './proto/ecs.js';

type ClientMessageProto = u2.shared.proto.ClientMessageProto;
type ConnectionRequestProto = u2.shared.proto.IConnectionRequestProto;
type ConnectionAcceptedProto = u2.shared.proto.IConnectionAcceptedProto;
type PlayerInputProto = u2.shared.proto.IPlayerInputProto;
type WorldSnapshotProto = u2.shared.proto.IWorldSnapshotProto;

type TransportKind = "websocket" | "webrtc";

export interface NetworkConfig {
  serverUrl: string;
  playerName: string;
  version: string;
  inputRateHz: number;
  reconnect?: Partial<ReconnectConfig>;
  decodeErrorThreshold?: number;
  transportHint?: TransportKind;
  logger?: (level: "info" | "warn" | "error" | "debug", message: string, context?: unknown) => void;
}

interface ReconnectConfig {
  enabled: boolean;
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
  factor: number;
  maxBackoffMs?: number;
}

export interface ConnectionState {
  clientId: number | null;
  entityId: number | null;
  connected: boolean;
  serverTimeOffset: number;
}

export interface PlayerInput {
  sequenceNumber: number;
  timestamp: number;
  thrust: number;
  strafeX: number;
  strafeY: number;
  yawInput: number;
  brake: boolean;
  flightAssist: boolean;
}

/**
 * Network client for connecting to the U2 game server.
 * Handles WebSocket/UDP communication, message serialization, and connection management.
 */
export class NetworkClient {
  private socket: WebSocket | null = null;
  private config: NetworkConfig;
  private reconnect: ReconnectConfig;
  private connectionState: ConnectionState = {
    clientId: null,
    entityId: null,
    connected: false,
    serverTimeOffset: 0
  };
  private transport: TransportKind;
  
  private inputSequence = 0;
  private lastInputTime = 0;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manualClose = false;
  private decodeErrors = 0;
  private decodeErrorThreshold: number;
  
  // Callbacks
  private onConnectedCallback?: (clientId: number, entityId: number) => void;
  private onDisconnectedCallback?: () => void;
  private onSnapshotCallback?: (snapshot: WorldSnapshotProto) => void;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.reconnect = {
      enabled: true,
      ...CLIENT_CONFIG.network.reconnect,
      factor: CLIENT_CONFIG.network.reconnect.factor ?? 2,
      ...config.reconnect
    };
    this.decodeErrorThreshold =
      config.decodeErrorThreshold ?? CLIENT_CONFIG.network.decodeErrorThreshold;
    this.transport = config.transportHint ?? "websocket";
  }

  /**
   * Connect to the game server
   */
  async connect(): Promise<void> {
    this.manualClose = false;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    let checkConnection: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let settled = false;

    if (this.transport === "webrtc") {
      this.log("warn", "WebRTC transport hinted but not implemented, falling back to WebSocket");
    }

    const cleanup = () => {
      if (checkConnection) {
        clearInterval(checkConnection);
        checkConnection = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.config.serverUrl);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
          this.log("info", "WebSocket connected");
          this.sendConnectionRequest();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onerror = (error) => {
          if (settled) return;
          settled = true;
          cleanup();
          this.log("error", "WebSocket error", error);
          reject(error);
        };

        this.socket.onclose = () => {
          this.log("warn", "WebSocket closed");
          this.handleDisconnect();
          if (!settled) {
            settled = true;
            cleanup();
            reject(new Error("Connection closed"));
          }
          this.scheduleReconnect();
        };

        // Resolve on successful connection acceptance
        checkConnection = setInterval(() => {
          if (this.connectionState.connected) {
            settled = true;
            cleanup();
            resolve();
          }
        }, 100);

        // Timeout after 5 seconds
        timeoutId = setTimeout(() => {
          cleanup();
          if (!this.connectionState.connected) {
            settled = true;
            reject(new Error('Connection timeout'));
          }
        }, 5000);
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    this.manualClose = true;
    this.clearReconnectTimer();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.handleDisconnect();
  }

  /**
   * Send player input to the server
   * Respects the configured input rate (default 30 Hz)
   * @returns {number} sequence number if sent, 0 if rate limited or not connected
   */
  sendInput(input: Omit<PlayerInput, 'sequenceNumber' | 'timestamp'>): number {
    if (!this.connectionState.connected || !this.connectionState.clientId) {
      return 0;
    }

    const now = performance.now();
    const minInterval = 1000 / this.config.inputRateHz;
    
    if (now - this.lastInputTime < minInterval) {
      return 0; // Rate limiting
    }

    this.inputSequence++;
    this.lastInputTime = now;

    const inputProto: PlayerInputProto = {
      clientId: this.connectionState.clientId,
      sequenceNumber: this.inputSequence,
      timestampMs: this.getServerTime(),
      controlState: {
        thrust: input.thrust,
        strafeX: input.strafeX,
        strafeY: input.strafeY,
        yawInput: input.yawInput,
        brake: input.brake
      },
      flightAssist: input.flightAssist
    };

    const clientMessage = u2.shared.proto.ClientMessageProto.create({
      playerInput: inputProto
    });

    this.sendMessage(clientMessage);
    return this.inputSequence; // Return sequence number for prediction
  }

  /**
   * Register callback for connection accepted
   */
  onConnected(callback: (clientId: number, entityId: number) => void): void {
    this.onConnectedCallback = callback;
  }

  /**
   * Register callback for disconnection
   */
  onDisconnected(callback: () => void): void {
    this.onDisconnectedCallback = callback;
  }

  /**
   * Register callback for world snapshot received
   */
  onSnapshot(callback: (snapshot: WorldSnapshotProto) => void): void {
    this.onSnapshotCallback = callback;
  }

  /**
   * Get the current connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Get current server time (client time + offset)
   */
  getServerTime(): number {
    return Date.now() + this.connectionState.serverTimeOffset;
  }

  private sendConnectionRequest(): void {
    const request: ConnectionRequestProto = {
      playerName: this.config.playerName,
      version: this.config.version
    };

    const clientMessage = u2.shared.proto.ClientMessageProto.create({
      connectionRequest: request
    });

    this.sendMessage(clientMessage);
    this.log("debug", "Connection request sent");
  }

  private sendMessage(message: ClientMessageProto): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.log("warn", "Cannot send message: socket not ready");
      return;
    }

    const buffer = u2.shared.proto.ClientMessageProto.encode(message).finish();
    this.socket.send(buffer);
  }

  private handleMessage(data: ArrayBuffer): void {
    try {
      const bytes = new Uint8Array(data);
      const serverMessage = u2.shared.proto.ServerMessageProto.decode(bytes);
      this.decodeErrors = 0;

      if (serverMessage.connectionAccepted) {
        this.handleConnectionAccepted(serverMessage.connectionAccepted);
      } else if (serverMessage.worldSnapshot) {
        this.handleWorldSnapshot(serverMessage.worldSnapshot);
      } else if (serverMessage.disconnect) {
        this.log("warn", "Server disconnected", serverMessage.disconnect.reason);
        this.disconnect();
      }
    } catch (error) {
      this.decodeErrors += 1;
      this.log("error", "Failed to decode message", error);

      if (this.decodeErrors >= this.decodeErrorThreshold) {
        this.log("error", "Too many decode errors, disconnecting for safety", {
          decodeErrors: this.decodeErrors,
          threshold: this.decodeErrorThreshold
        });
        this.disconnect();
      }
    }
  }

  private handleConnectionAccepted(accepted: ConnectionAcceptedProto): void {
    this.connectionState = {
      clientId: accepted.clientId ?? 0,
      entityId: accepted.entityId ?? 0,
      connected: true,
      serverTimeOffset: (accepted.serverTimeMs ?? Date.now()) - Date.now()
    };

    this.log("info", "Connection accepted", {
      clientId: this.connectionState.clientId,
      entityId: this.connectionState.entityId
    });

    if (this.onConnectedCallback) {
      this.onConnectedCallback(
        this.connectionState.clientId!,
        this.connectionState.entityId!
      );
    }
  }

  private handleWorldSnapshot(snapshot: WorldSnapshotProto): void {
    if (this.onSnapshotCallback) {
      this.onSnapshotCallback(snapshot);
    }
  }

  private handleDisconnect(): void {
    this.connectionState = {
      clientId: null,
      entityId: null,
      connected: false,
      serverTimeOffset: 0
    };

    if (this.onDisconnectedCallback) {
      this.onDisconnectedCallback();
    }
  }

  /**
   * Placeholder for WebRTC transport expansion (Stage 2+)
   * Keeps public API compatible while WebSocket remains the default.
   */
  prepareWebRtc(): void {
    this.log("debug", "prepareWebRtc called - not implemented yet");
  }

  private scheduleReconnect(): void {
    if (!this.reconnect.enabled || this.manualClose) {
      return;
    }

    if (this.reconnectAttempts >= this.reconnect.maxRetries) {
      this.log("warn", "Max reconnect attempts reached");
      return;
    }

    const backoff = Math.min(
      this.reconnect.maxBackoffMs ?? this.reconnect.maxDelayMs,
      this.reconnect.baseDelayMs * this.reconnect.factor ** this.reconnectAttempts
    );
    const jitter = Math.random() * this.reconnect.jitterMs;
    const delay = backoff + jitter;

    this.reconnectAttempts += 1;
    this.log("info", `Scheduling reconnect #${this.reconnectAttempts} in ${Math.round(delay)}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        this.log("error", "Reconnect attempt failed", error);
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private log(
    level: "info" | "warn" | "error" | "debug",
    message: string,
    context?: unknown
  ): void {
    if (this.config.logger) {
      this.config.logger(level, message, context);
      return;
    }

    const payload = context !== undefined ? [message, context] : [message];
    if (level === "debug") {
      console.debug("[NetworkClient]", ...payload);
    } else if (level === "info") {
      console.info("[NetworkClient]", ...payload);
    } else if (level === "warn") {
      console.warn("[NetworkClient]", ...payload);
    } else {
      console.error("[NetworkClient]", ...payload);
    }
  }
}
