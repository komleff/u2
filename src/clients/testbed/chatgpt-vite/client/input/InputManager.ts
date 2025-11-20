import { CONTROL_MAP, type ControlAction } from "@config/controls";
import { CLIENT_CONFIG } from "@config/client";

export interface InputManagerOptions {
  yawSensitivity?: number;
  flightAssist?: boolean;
}

export type InputToggles = {
  online?: boolean;
  hud?: boolean;
  mode?: boolean;
  autopilot?: boolean;
  impulse?: boolean;
};

export type CommandFrame = {
  thrust: number;
  strafeX: number;
  strafeY: number;
  yaw: number;
  flightAssist: boolean;
  timestamp: number;
  toggles: InputToggles;
};

/**
 * Collects keyboard and pointer input and exposes a normalized command frame.
 * Designed to feed future buffering/prediction stages without leaking DOM details.
 */
export class InputManager {
  private readonly pressed = new Set<ControlAction>();
  private readonly toggles = new Set<ControlAction>();
  private yawAccumulator = 0;

  // Flight assist defaults to ON to match server-side baseline
  private flightAssist: boolean;
  private readonly yawSensitivity: number;
  private readonly eventSource: Pick<Window, "addEventListener" | "removeEventListener">;
  private readonly pointerTarget: HTMLElement | { addEventListener: (_: string, __: (_: MouseEvent) => void) => void; removeEventListener?: (_: string, __: (_: MouseEvent) => void) => void };

  private keyDownHandler = (event: KeyboardEvent) => {
    const action = CONTROL_MAP[event.code];
    if (!action) return;

    event.preventDefault();
    this.handleAction(action, true);
  };

  private keyUpHandler = (event: KeyboardEvent) => {
    const action = CONTROL_MAP[event.code];
    if (!action) return;

    event.preventDefault();
    this.handleAction(action, false);
  };

  private pointerHandler = (event: MouseEvent) => {
    // Horizontal movement drives yaw; vertical reserved for later HUD interactions
    this.yawAccumulator += event.movementX * this.yawSensitivity;
  };

  constructor(
    target: HTMLElement = document.body,
    eventSource: Pick<Window, "addEventListener" | "removeEventListener"> = window,
    options: InputManagerOptions = {}
  ) {
    this.pointerTarget = target;
    this.eventSource = eventSource;
    this.yawSensitivity = options.yawSensitivity ?? CLIENT_CONFIG.input.yawSensitivity;
    this.flightAssist = options.flightAssist ?? true;

    this.eventSource.addEventListener("keydown", this.keyDownHandler);
    this.eventSource.addEventListener("keyup", this.keyUpHandler);
    this.pointerTarget.addEventListener("mousemove", this.pointerHandler);
  }

  dispose() {
    this.eventSource.removeEventListener("keydown", this.keyDownHandler);
    this.eventSource.removeEventListener("keyup", this.keyUpHandler);
    this.pointerTarget.removeEventListener?.("mousemove", this.pointerHandler);
  }

  poll(): CommandFrame {
    const toggles = this.consumeToggles();

    const thrust = Number(this.pressed.has("thrust-up")) - Number(this.pressed.has("thrust-down"));
    const strafeX =
      Number(this.pressed.has("strafe-right")) - Number(this.pressed.has("strafe-left"));

    // Future hover/vertical thrusters; kept for API stability
    const strafeY = 0;

    const yawFromKeys =
      Number(this.pressed.has("yaw-right")) - Number(this.pressed.has("yaw-left"));

    const yawInput = yawFromKeys + this.consumeYaw();

    return {
      thrust,
      strafeX,
      strafeY,
      yaw: yawInput,
      flightAssist: this.flightAssist,
      timestamp: performance.now(),
      toggles
    };
  }

  private handleAction(action: ControlAction, isPressed: boolean) {
    // Toggle actions are edge-triggered
    if (
      ["mode-toggle", "autopilot-toggle", "hud-toggle", "online-toggle", "rnd-impulse"].includes(
        action
      )
    ) {
      if (isPressed) {
        this.toggles.add(action);
      }
      return;
    }

    if (isPressed) {
      this.pressed.add(action);
    } else {
      this.pressed.delete(action);
    }
  }

  private consumeYaw(): number {
    const yaw = this.yawAccumulator;
    this.yawAccumulator = 0;
    return yaw;
  }

  private consumeToggles(): InputToggles {
    const toggles: InputToggles = {};

    if (this.toggles.delete("online-toggle")) toggles.online = true;
    if (this.toggles.delete("hud-toggle")) toggles.hud = true;
    if (this.toggles.delete("mode-toggle")) toggles.mode = true;
    if (this.toggles.delete("autopilot-toggle")) toggles.autopilot = true;
    if (this.toggles.delete("rnd-impulse")) toggles.impulse = true;

    return toggles;
  }
}
