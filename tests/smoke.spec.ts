import { describe, it, expect } from "vitest";
import { KinematicsIntegrator } from "../src/core/physics/kinematics";

describe("simulation bootstrap", () => {
  it("integrates forward in time", () => {
    const integrator = new KinematicsIntegrator();

    integrator.integrate({
      dt: 0.016,
      thrustVector: { x: 100, y: 0 },
      torque: 0,
      drag: 0.1
    });

    expect(integrator.snapshot.velocity.x).toBeGreaterThan(0);
  });
});
