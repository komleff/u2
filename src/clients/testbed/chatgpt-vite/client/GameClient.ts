import { SIMULATION_TICK } from "@config/simulation";
import { CLIENT_CONFIG } from "@config/client";
import { InputManager } from "./input/InputManager";
import { TransportLayer, type TransportStatus } from "./net/TransportLayer";
import { SnapshotRenderer } from "./render/SnapshotRenderer";
import { SnapshotStore } from "./world/SnapshotStore";
import type { CommandFrame } from "./input/InputManager";
import type { EntityState } from "@network/PredictionEngine";

export interface GameClientOptions {
  serverUrl: string;
  playerName?: string;
  version?: string;
  onModeChange?: (mode: "coupled" | "decoupled") => void;
  onAutopilotToggle?: (enabled: boolean) => void;
  onImpulse?: () => void;
  onHudToggle?: (visible: boolean) => void;
}

export class GameClient {
  private readonly canvas: HTMLCanvasElement;
  private readonly root: HTMLElement;
  private readonly renderer: SnapshotRenderer;
  private readonly input: InputManager;
  private readonly snapshotStore = new SnapshotStore();
  private readonly transport: TransportLayer;
  private readonly options: GameClientOptions;

  private hudVisible = true;
  private predictedState: EntityState | null = null;
  private status: TransportStatus;
  private online = false;
  private mode: "coupled" | "decoupled" = "coupled";
  private autopilot = false;

  constructor(root: HTMLElement, options: GameClientOptions) {
    this.root = root;
    this.options = options;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "u2-scene";
    this.root.appendChild(this.canvas);

    this.renderer = new SnapshotRenderer(this.canvas);
    this.input = new InputManager(this.root, window, {
      yawSensitivity: CLIENT_CONFIG.input.yawSensitivity
    });

    this.status = {
      connected: false,
      connecting: false,
      attempts: 0,
      lastChange: performance.now()
    };

    this.transport = new TransportLayer(
      {
        serverUrl: options.serverUrl,
        playerName: options.playerName ?? "FlightTest",
        version: options.version ?? "0.5.0",
        inputRateHz: CLIENT_CONFIG.network.inputRateHz,
        enablePrediction: true,
        reconciliationThreshold: CLIENT_CONFIG.network.reconciliationThreshold,
        fixedDeltaTime: Math.max(SIMULATION_TICK, CLIENT_CONFIG.network.fixedDeltaTime), // clamp to server tick budget
        decodeErrorThreshold: CLIENT_CONFIG.network.decodeErrorThreshold,
        reconnect: CLIENT_CONFIG.network.reconnect,
        transportBackoff: CLIENT_CONFIG.network.reconnect
      },
      {
        onWorld: (entities, meta) => this.snapshotStore.ingest(entities, meta),
        onLocalState: (state) => {
          this.predictedState = state;
        },
        onConnection: () => {
          this.predictedState = null;
        },
        onStatus: (status) => {
          this.status = status;
        }
      }
    );
  }

  start() {
    this.toggleOnline(true);
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop() {
    const frame = this.input.poll();
    this.handleToggles(frame);

    if (this.online) {
      this.transport.sendInput(frame);
    }

    const view = this.snapshotStore.frame(this.transport.getLocalEntityId());
    this.renderer.render(view, this.status, this.transport.getLocalEntityId(), this.predictedState, this.hudVisible);

    requestAnimationFrame(() => this.loop());
  }

  private handleToggles(frame: CommandFrame) {
    if (frame.toggles.online) {
      this.toggleOnline();
    }

    if (frame.toggles.hud) {
      this.hudVisible = !this.hudVisible;
      this.options.onHudToggle?.(this.hudVisible);
    }

    if (frame.toggles.mode) {
      this.mode = this.mode === "coupled" ? "decoupled" : "coupled";
      this.options.onModeChange?.(this.mode);
    }

    if (frame.toggles.autopilot) {
      this.autopilot = !this.autopilot;
      this.options.onAutopilotToggle?.(this.autopilot);
    }

    if (frame.toggles.impulse) {
      this.options.onImpulse?.();
    }
  }

  private toggleOnline(force?: boolean) {
    this.online = force ? true : !this.online;
    if (this.online) {
      this.transport.start();
    } else {
      this.transport.stop();
    }
  }
}
