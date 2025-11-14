import type { FlightComputerSnapshot, HudTelemetry } from "@types/simulation";
import { HUD_WARNINGS } from "@config/simulation";

export class HudSystem {
  #telemetry: HudTelemetry = {
    speed: 0,
    aoa: 0,
    altitude: 0,
    warnings: []
  };

  update(snapshot: FlightComputerSnapshot) {
    const { frame } = snapshot;
    const speed = Math.hypot(frame.velocity.x, frame.velocity.y);
    const aoa = frame.heading - Math.atan2(frame.velocity.y, frame.velocity.x);

    const warnings: string[] = [];
    if (speed <= HUD_WARNINGS.stall) warnings.push("STALL RISK");
    if (speed >= HUD_WARNINGS.overspeed) warnings.push("OVERSPEED");
    if (Math.abs(frame.angularVelocity) >= HUD_WARNINGS.gLimit) {
      warnings.push("G-LIMIT");
    }

    this.#telemetry = {
      speed,
      aoa,
      altitude: frame.position.y,
      warnings
    };

    return this.#telemetry;
  }

  get telemetry() {
    return this.#telemetry;
  }
}
