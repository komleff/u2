import sharedPhysics from "../../../../shared/physics.json";

export interface PhysicsConfig {
  forwardAccel: number; // m/s²
  reverseAccel: number; // m/s²
  strafeAccel: number; // m/s²

  yawAccel: number; // rad/s²
  pitchAccel: number; // rad/s²
  rollAccel: number; // rad/s²

  maxForwardSpeed: number; // m/s
  maxReverseSpeed: number; // m/s
  maxStrafeSpeed: number; // m/s
  maxYawRate: number; // rad/s

  mass: number; // kg
  inertia: number; // kg*m² (approx)
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;

const massKg = sharedPhysics.hull.dry_mass_t * 1000;
const inertiaBox =
  (massKg *
    (sharedPhysics.geometry.length_m * sharedPhysics.geometry.length_m +
      sharedPhysics.geometry.width_m * sharedPhysics.geometry.width_m)) /
  12;

/**
 * Shared physics defaults for the stage-1 fighter (synced with server JSON).
 */
export const DEFAULT_PHYSICS: PhysicsConfig = {
  forwardAccel: sharedPhysics.physics.forward_accel_mps2,
  reverseAccel: sharedPhysics.physics.reverse_accel_mps2,
  strafeAccel: sharedPhysics.physics.strafe_accel_mps2,

  yawAccel: degToRad(sharedPhysics.physics.yaw_accel_dps2),
  pitchAccel: degToRad(sharedPhysics.physics.pitch_accel_dps2 ?? 180.0),
  rollAccel: degToRad(sharedPhysics.physics.roll_accel_dps2 ?? 220.0),

  maxForwardSpeed: sharedPhysics.limits.linear_speed_max_mps.forward,
  maxReverseSpeed: sharedPhysics.limits.linear_speed_max_mps.reverse,
  maxStrafeSpeed: sharedPhysics.limits.linear_speed_max_mps.lateral,
  maxYawRate: degToRad(sharedPhysics.limits.angular_speed_max_dps.yaw),

  mass: massKg,
  inertia: inertiaBox
};
