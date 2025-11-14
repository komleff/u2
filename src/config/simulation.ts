export const SIMULATION_TICK = 1 / 120;
export const MAX_DELTA_TIME = 1 / 15;

export const PHYSICS_COEFFICIENTS = {
  drag: 0.12,
  angularDrag: 0.05,
  thrust: 18_000,
  torque: 1_200
};

export const ARENA = {
  width: 120_000,
  height: 120_000,
  safeAltitude: 1_500
};

export const HUD_WARNINGS = {
  stall: 20,
  overspeed: 12_000,
  gLimit: 9
};
