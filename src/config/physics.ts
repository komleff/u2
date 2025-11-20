export interface PhysicsConfig {
  // Linear acceleration (m/s²)
  forwardAccel: number;
  reverseAccel: number;
  strafeAccel: number;

  // Angular acceleration (rad/s²)
  yawAccel: number;

  // FA:ON speed limits (m/s)
  maxForwardSpeed: number;
  maxReverseSpeed: number;
  maxStrafeSpeed: number;

  // FA:ON angular limits (rad/s)
  maxYawRate: number;

  // Mass properties
  mass: number;
  inertia: number;
}

/**
 * Shared physics defaults for the stage-1 fighter (kept in sync with server values).
 */
export const DEFAULT_PHYSICS: PhysicsConfig = {
  // Linear acceleration
  forwardAccel: 90.0, // 90 m/s² forward
  reverseAccel: 67.5, // 67.5 m/s² reverse
  strafeAccel: 85.0, // 85 m/s² lateral

  // Angular acceleration
  yawAccel: 4.189, // 240°/s² = 4.189 rad/s²

  // FA:ON speed limits
  maxForwardSpeed: 260.0, // 260 m/s forward
  maxReverseSpeed: 180.0, // 180 m/s reverse
  maxStrafeSpeed: 220.0, // 220 m/s lateral

  // FA:ON angular limits
  maxYawRate: 1.396, // 80°/s = 1.396 rad/s

  // Mass
  mass: 10000.0, // 10 tons
  inertia: 50000.0 // Approximate for small fighter
};
