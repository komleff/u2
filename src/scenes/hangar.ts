import { KinematicsIntegrator } from "@core/physics/kinematics";
import { AutopilotController } from "@core/navigation/autopilot";
import { HudSystem } from "@systems/hud";
import { makeLogger } from "@utils/logger";
import { SIMULATION_TICK, MAX_DELTA_TIME } from "@config/simulation";
import type {
  FlightComputerSnapshot,
  FlightMode,
  GuidanceMode
} from "@types/simulation";

type InputResolver = (snapshot: FlightComputerSnapshot) => {
  thrustVector: { x: number; y: number };
  torque: number;
};

export class HangarScene {
  readonly #integrator = new KinematicsIntegrator();
  readonly #autopilot = new AutopilotController();
  readonly #hud = new HudSystem();
  readonly #log = makeLogger("HangarScene", "debug");

  #mode: FlightMode = "coupled";
  #guidance: GuidanceMode = "manual";
  #inputResolver: InputResolver = () => ({
    thrustVector: { x: 0, y: 0 },
    torque: 0
  });

  setInputResolver(resolver: InputResolver) {
    this.#inputResolver = resolver;
  }

  toggleMode() {
    this.#mode = this.#mode === "coupled" ? "decoupled" : "coupled";
  }

  toggleAutopilot() {
    this.#guidance = this.#guidance === "manual" ? "autopilot" : "manual";
    this.#autopilot.setGuidanceMode(this.#guidance);
  }

  update(dt: number) {
    const clampedDt = Math.min(dt, MAX_DELTA_TIME);
    const snapshot = this.#snapshot();
    const manualInput = this.#inputResolver(snapshot);
    const autopilotInput = this.#autopilot.solve(snapshot);

    const thrustVector =
      this.#guidance === "manual" ? manualInput.thrustVector : autopilotInput.thrustVector;
    const torque =
      this.#guidance === "manual" ? manualInput.torque : autopilotInput.torque;

    this.#integrator.integrate({
      dt: clampedDt,
      thrustVector,
      torque,
      drag: this.#mode === "coupled" ? 0.25 : 0.05
    });

    const hudTelemetry = this.#hud.update(this.#snapshot());
    this.#log.debug("HUD", hudTelemetry);
    return hudTelemetry;
  }

  #snapshot(): FlightComputerSnapshot {
    return {
      frame: this.#integrator.snapshot,
      mode: this.#mode,
      guidance: this.#guidance,
      timestamp: performance.now()
    };
  }
}
