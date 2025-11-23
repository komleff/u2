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
  flightAssist?: boolean; // M3.0: FA:ON/OFF indicator
  // M4.0: Extended telemetry
  acceleration?: number; // m/s² (magnitude)
  accelerationG?: number; // g-force (acceleration / 9.81)
  heading?: number; // radians (rotation)
  headingDeg?: number; // degrees (rotation * 180/PI)
  angularVelocity?: number; // rad/s
  angularVelocityDps?: number; // degrees/s
  fps?: number; // frames per second
  rtt?: number; // round-trip time in milliseconds
}
