import type {
  FlightComputerSnapshot,
  GuidanceMode,
  Vector2
} from "@types/simulation";
import { SIMULATION_TICK } from "@config/simulation";

const lerp = (start: number, end: number, t: number) =>
  start + (end - start) * t;

export class AutopilotController {
  #guidanceMode: GuidanceMode = "manual";
  #targetVector: Vector2 = { x: 0, y: 1 };

  get mode() {
    return this.#guidanceMode;
  }

  setGuidanceMode(mode: GuidanceMode) {
    this.#guidanceMode = mode;
  }

  setTargetVector(vector: Vector2) {
    this.#targetVector = vector;
  }

  solve(snapshot: FlightComputerSnapshot) {
    if (this.#guidanceMode === "manual") {
      return { thrustVector: { x: 0, y: 0 }, torque: 0 };
    }

    const { frame } = snapshot;
    const targetHeading = Math.atan2(this.#targetVector.y, this.#targetVector.x);
    const headingError = targetHeading - frame.heading;
    const normalized = Math.atan2(Math.sin(headingError), Math.cos(headingError));

    const torque = normalized * 0.5 - frame.angularVelocity * 0.2;
    const thrustMagnitude = lerp(
      0,
      1,
      Math.min(Math.abs(normalized) * 2, 1)
    );

    return {
      thrustVector: {
        x: Math.cos(targetHeading) * thrustMagnitude,
        y: Math.sin(targetHeading) * thrustMagnitude
      },
      torque: torque / SIMULATION_TICK
    };
  }
}
