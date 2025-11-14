export type ControlAction =
  | "thrust-up"
  | "thrust-down"
  | "strafe-left"
  | "strafe-right"
  | "yaw-left"
  | "yaw-right"
  | "mode-toggle"
  | "autopilot-toggle"
  | "rnd-impulse"
  | "hud-toggle";

export const CONTROL_MAP: Record<string, ControlAction> = {
  KeyW: "thrust-up",
  KeyS: "thrust-down",
  KeyA: "strafe-left",
  KeyD: "strafe-right",
  KeyQ: "yaw-left",
  KeyE: "yaw-right",
  KeyC: "mode-toggle",
  KeyR: "rnd-impulse",
  F2: "autopilot-toggle",
  F3: "hud-toggle"
};
