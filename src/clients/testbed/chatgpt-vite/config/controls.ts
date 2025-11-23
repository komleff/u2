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
  | "hud-toggle"
  | "debug-toggle" // M4: Toggle debug overlay (FPS, RTT, detailed metrics)
  | "online-toggle"
  | "flight-assist-toggle";

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
  F3: "debug-toggle", // M4: Changed from hud-toggle to debug-toggle
  F4: "hud-toggle", // M4: Moved from F3 to F4
  KeyO: "online-toggle", // M2.3: Toggle online/offline mode
  KeyZ: "flight-assist-toggle" // M3.0: Toggle Flight Assist ON/OFF
};
