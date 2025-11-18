import { u2 } from './proto/ecs.js';

type ClientMessageProto = u2.shared.proto.ClientMessageProto;
type ConnectionRequestProto = u2.shared.proto.IConnectionRequestProto;
type ConnectionAcceptedProto = u2.shared.proto.IConnectionAcceptedProto;
type PlayerInputProto = u2.shared.proto.IPlayerInputProto;
type WorldSnapshotProto = u2.shared.proto.IWorldSnapshotProto;

export interface NetworkConfig {
  serverUrl: string;
  playerName: string;
  version: string;
  inputRateHz: number;
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
  flightAssist: boolean;
}

/**
 * Network client for connecting to the U2 game server.
 * Handles WebSocket/UDP communication, message serialization, and connection management.
 */
export class NetworkClient {
  private socket: WebSocket | null = null;
  private config: NetworkConfig;
  private connectionState: ConnectionState = {
    clientId: null,
    entityId: null,
    connected: false,
    serverTimeOffset: 0
  };
  
  private inputSequence = 0;
  private lastInputTime = 0;
  
  // Callbacks
  private onConnectedCallback?: (clientId: number, entityId: number) => void;
  private onDisconnectedCallback?: () => void;
  private onSnapshotCallback?: (snapshot: WorldSnapshotProto) => void;

  constructor(config: NetworkConfig) {
    this.config = config;
  }

  /**
   * Connect to the game server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.config.serverUrl);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
          console.warn('[NetworkClient] WebSocket connected');
          this.sendConnectionRequest();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onerror = (error) => {
          console.error('[NetworkClient] WebSocket error:', error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.warn('[NetworkClient] WebSocket closed');
          this.handleDisconnect();
        };

        // Resolve on successful connection acceptance
        const checkConnection = setInterval(() => {
          if (this.connectionState.connected) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkConnection);
          if (!this.connectionState.connected) {
            reject(new Error('Connection timeout'));
          }
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.handleDisconnect();
  }

  /**
   * Send player input to the server
   * Respects the configured input rate (default 30 Hz)
   */
  sendInput(input: Omit<PlayerInput, 'sequenceNumber' | 'timestamp'>): boolean {
    if (!this.connectionState.connected || !this.connectionState.clientId) {
      return false;
    }

    const now = performance.now();
    const minInterval = 1000 / this.config.inputRateHz;
    
    if (now - this.lastInputTime < minInterval) {
      return false; // Rate limiting
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
        yawInput: input.yawInput
      },
      flightAssist: input.flightAssist
    };

    const clientMessage = u2.shared.proto.ClientMessageProto.create({
      playerInput: inputProto
    });

    this.sendMessage(clientMessage);
    return true;
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
    console.warn('[NetworkClient] Connection request sent');
  }

  private sendMessage(message: ClientMessageProto): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[NetworkClient] Cannot send message: socket not ready');
      return;
    }

    const buffer = u2.shared.proto.ClientMessageProto.encode(message).finish();
    this.socket.send(buffer);
  }

  private handleMessage(data: ArrayBuffer): void {
    try {
      const bytes = new Uint8Array(data);
      const serverMessage = u2.shared.proto.ServerMessageProto.decode(bytes);

      if (serverMessage.connectionAccepted) {
        this.handleConnectionAccepted(serverMessage.connectionAccepted);
      } else if (serverMessage.worldSnapshot) {
        this.handleWorldSnapshot(serverMessage.worldSnapshot);
      } else if (serverMessage.disconnect) {
        console.warn('[NetworkClient] Server disconnected:', serverMessage.disconnect.reason);
        this.disconnect();
      }
    } catch (error) {
      console.error('[NetworkClient] Failed to decode message:', error);
    }
  }

  private handleConnectionAccepted(accepted: ConnectionAcceptedProto): void {
    this.connectionState = {
      clientId: accepted.clientId ?? 0,
      entityId: accepted.entityId ?? 0,
      connected: true,
      serverTimeOffset: (accepted.serverTimeMs ?? Date.now()) - Date.now()
    };

    console.warn('[NetworkClient] Connection accepted:', {
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
}
