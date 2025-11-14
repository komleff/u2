export type FlightMode = "coupled" | "decoupled";

export type GuidanceMode = "manual" | "autopilot" | "hold-vector";

export interface Vector2 {
  x: number;
  y: number;
}

export interface FrameState {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  heading: number;
  angularVelocity: number;
}

export interface IntegratorInput {
  dt: number;
  thrustVector: Vector2;
  torque: number;
  drag: number;
}

export interface FlightComputerSnapshot {
  frame: FrameState;
  mode: FlightMode;
  guidance: GuidanceMode;
  timestamp: number;
}

export interface HudTelemetry {
  speed: number;
  aoa: number;
  altitude: number;
  warnings: string[];
}
