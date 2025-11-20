import { describe, it, expect } from "vitest";
import sharedPhysics from "../../../../shared/physics.json";
import { DEFAULT_PHYSICS } from "@config/physics";

describe("shared physics sync", () => {
  it("pulls values from shared physics.json", () => {
    expect(DEFAULT_PHYSICS.forwardAccel).toBeCloseTo(sharedPhysics.physics.forward_accel_mps2, 5);
    expect(DEFAULT_PHYSICS.reverseAccel).toBeCloseTo(sharedPhysics.physics.reverse_accel_mps2, 5);
    expect(DEFAULT_PHYSICS.strafeAccel).toBeCloseTo(sharedPhysics.physics.strafe_accel_mps2, 5);
    expect(DEFAULT_PHYSICS.maxForwardSpeed).toBeCloseTo(sharedPhysics.limits.linear_speed_max_mps.forward, 5);
    expect(DEFAULT_PHYSICS.maxReverseSpeed).toBeCloseTo(sharedPhysics.limits.linear_speed_max_mps.reverse, 5);
    expect(DEFAULT_PHYSICS.maxStrafeSpeed).toBeCloseTo(sharedPhysics.limits.linear_speed_max_mps.lateral, 5);
  });

  it("converts angular values to radians", () => {
    const degToRad = (deg: number) => (deg * Math.PI) / 180;
    expect(DEFAULT_PHYSICS.yawAccel).toBeCloseTo(degToRad(sharedPhysics.physics.yaw_accel_dps2), 5);
    expect(DEFAULT_PHYSICS.maxYawRate).toBeCloseTo(degToRad(sharedPhysics.limits.angular_speed_max_dps.yaw), 5);
  });
});
