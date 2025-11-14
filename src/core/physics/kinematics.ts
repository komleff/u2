import { PHYSICS_COEFFICIENTS } from "@config/simulation";
import type { FrameState, IntegratorInput, Vector2 } from "@types/simulation";

const ZERO_VECTOR: Vector2 = { x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export class KinematicsIntegrator {
  #state: FrameState = {
    position: { ...ZERO_VECTOR },
    velocity: { ...ZERO_VECTOR },
    acceleration: { ...ZERO_VECTOR },
    heading: 0,
    angularVelocity: 0
  };

  get snapshot(): FrameState {
    return structuredClone(this.#state);
  }

  integrate(input: IntegratorInput) {
    const { dt, thrustVector, torque, drag } = input;

    const thrust = clamp(
      Math.hypot(thrustVector.x, thrustVector.y),
      0,
      PHYSICS_COEFFICIENTS.thrust
    );

    const thrustDir =
      thrust === 0
        ? ZERO_VECTOR
        : {
            x: thrustVector.x / thrust,
            y: thrustVector.y / thrust
          };

    const accel = {
      x: thrustDir.x * thrust - this.#state.velocity.x * drag,
      y: thrustDir.y * thrust - this.#state.velocity.y * drag
    };

    this.#state.acceleration = accel;
    this.#state.velocity = {
      x: this.#state.velocity.x + accel.x * dt,
      y: this.#state.velocity.y + accel.y * dt
    };

    this.#state.position = {
      x: this.#state.position.x + this.#state.velocity.x * dt,
      y: this.#state.position.y + this.#state.velocity.y * dt
    };

    // rotational axis
    const angularAcceleration =
      clamp(torque, -PHYSICS_COEFFICIENTS.torque, PHYSICS_COEFFICIENTS.torque) -
      this.#state.angularVelocity * PHYSICS_COEFFICIENTS.angularDrag;

    this.#state.angularVelocity += angularAcceleration * dt;
    this.#state.heading += this.#state.angularVelocity * dt;
  }

  seed(state: Partial<FrameState>) {
    this.#state = { ...this.#state, ...state };
  }
}
