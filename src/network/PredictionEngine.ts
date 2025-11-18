import type { Vector2 } from '@types/simulation';
import type { PlayerInput } from './NetworkClient';

/**
 * Entity state for prediction and reconciliation
 */
export interface EntityState {
  position: Vector2;
  rotation: number;
  velocity: Vector2;
  angularVelocity: number;
}

/**
 * Input with associated state for replay
 */
interface InputRecord {
  input: PlayerInput;
  state: EntityState;
}

/**
 * Physics parameters matching server configuration
 */
interface PhysicsConfig {
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
 * Default ship configuration (matches server default fighter)
 */
const DEFAULT_PHYSICS: PhysicsConfig = {
  // Linear acceleration
  forwardAccel: 90.0,      // 90 m/s² forward
  reverseAccel: 67.5,      // 67.5 m/s² reverse
  strafeAccel: 85.0,       // 85 m/s² lateral
  
  // Angular acceleration
  yawAccel: 4.189,         // 240°/s² = 4.189 rad/s²
  
  // FA:ON speed limits
  maxForwardSpeed: 260.0,  // 260 m/s forward
  maxReverseSpeed: 180.0,  // 180 m/s reverse
  maxStrafeSpeed: 220.0,   // 220 m/s lateral
  
  // FA:ON angular limits
  maxYawRate: 1.396,       // 80°/s = 1.396 rad/s
  
  // Mass
  mass: 10000.0,           // 10 tons
  inertia: 50000.0         // Approximate for small fighter
};

/**
 * Client-side prediction engine
 * Simulates physics locally and maintains input history for reconciliation
 */
export class PredictionEngine {
  private predictedState: EntityState;
  private inputHistory: InputRecord[] = [];
  private physics: PhysicsConfig;
  private maxHistorySize = 120; // 2 seconds at 60 Hz
  
  constructor(initialState: EntityState, physics: PhysicsConfig = DEFAULT_PHYSICS) {
    this.predictedState = { ...initialState };
    this.physics = physics;
  }

  /**
   * Apply input locally and store for replay
   */
  applyInput(input: PlayerInput, deltaTime: number): EntityState {
    // Store input in history
    this.inputHistory.push({
      input: { ...input },
      state: { ...this.predictedState }
    });

    // Trim history to max size
    if (this.inputHistory.length > this.maxHistorySize) {
      this.inputHistory.shift();
    }

    // Apply physics simulation
    this.simulatePhysics(input, deltaTime);

    return { ...this.predictedState };
  }

  /**
   * Get current predicted state
   */
  getState(): EntityState {
    return { ...this.predictedState };
  }

  /**
   * Reconcile with authoritative server state
   * Returns the corrected state after replay
   */
  reconcile(
    serverState: EntityState,
    lastProcessedSequence: number,
    deltaTime: number
  ): EntityState {
    // Find the input that matches the server's last processed sequence
    const replayFromIndex = this.inputHistory.findIndex(
      record => record.input.sequenceNumber > lastProcessedSequence
    );

    if (replayFromIndex === -1) {
      // All our inputs have been processed, just accept server state
      this.predictedState = { ...serverState };
      this.inputHistory = [];
      return this.predictedState;
    }

    // Calculate prediction error
    const positionError = Math.sqrt(
      Math.pow(this.predictedState.position.x - serverState.position.x, 2) +
      Math.pow(this.predictedState.position.y - serverState.position.y, 2)
    );

    const rotationError = Math.abs(this.predictedState.rotation - serverState.rotation);

    // Only reconcile if error exceeds threshold (1 meter or 5 degrees)
    const needsReconciliation = positionError > 1.0 || rotationError > 0.087; // 5° in radians

    if (!needsReconciliation) {
      // Trim processed inputs from history
      this.inputHistory = this.inputHistory.slice(replayFromIndex);
      return this.predictedState;
    }

    console.warn('[Prediction] Reconciling:', {
      positionError: positionError.toFixed(2),
      rotationError: (rotationError * 180 / Math.PI).toFixed(2) + '°',
      inputsToReplay: this.inputHistory.length - replayFromIndex
    });

    // Rewind to server state
    this.predictedState = { ...serverState };

    // Replay unprocessed inputs
    const inputsToReplay = this.inputHistory.slice(replayFromIndex);
    for (const record of inputsToReplay) {
      this.simulatePhysics(record.input, deltaTime);
    }

    // Update history
    this.inputHistory = inputsToReplay;

    return this.predictedState;
  }

  /**
   * Simulate physics for one time step
   * Matches server-side physics implementation
   */
  private simulatePhysics(input: PlayerInput, deltaTime: number): void {
    const state = this.predictedState;

    // Calculate thrust force based on input direction
    let thrustForceX = 0;
    let thrustForceY = 0;

    // Forward/reverse thrust
    if (input.thrust > 0) {
      const angle = state.rotation;
      const accel = this.physics.forwardAccel * input.thrust;
      thrustForceX += Math.cos(angle) * accel;
      thrustForceY += Math.sin(angle) * accel;
    } else if (input.thrust < 0) {
      const angle = state.rotation;
      const accel = this.physics.reverseAccel * Math.abs(input.thrust);
      thrustForceX -= Math.cos(angle) * accel;
      thrustForceY -= Math.sin(angle) * accel;
    }

    // Strafe (lateral thrust perpendicular to heading)
    if (input.strafeX !== 0 || input.strafeY !== 0) {
      const angle = state.rotation;
      const perpAngle = angle + Math.PI / 2;
      
      // X strafe (right/left)
      if (input.strafeX !== 0) {
        const accel = this.physics.strafeAccel * input.strafeX;
        thrustForceX += Math.cos(perpAngle) * accel;
        thrustForceY += Math.sin(perpAngle) * accel;
      }
      
      // Y strafe (up/down in ship space - vertical thrusters)
      if (input.strafeY !== 0) {
        const vertAngle = angle;
        const accel = this.physics.strafeAccel * input.strafeY;
        thrustForceX += Math.cos(vertAngle) * accel;
        thrustForceY += Math.sin(vertAngle) * accel;
      }
    }

    // Apply acceleration
    const accelX = thrustForceX;
    const accelY = thrustForceY;

    // Update velocity
    state.velocity.x += accelX * deltaTime;
    state.velocity.y += accelY * deltaTime;

    // Flight Assist: velocity damping and speed limiting
    if (input.flightAssist) {
      // Transform velocity to ship-local space
      const cosRot = Math.cos(state.rotation);
      const sinRot = Math.sin(state.rotation);
      
      const localVelX = state.velocity.x * cosRot + state.velocity.y * sinRot;
      const localVelY = -state.velocity.x * sinRot + state.velocity.y * cosRot;

      // Apply speed limits in local space
      const forwardSpeed = localVelX;
      const lateralSpeed = localVelY;

      let clampedForward = forwardSpeed;
      let clampedLateral = lateralSpeed;

      if (forwardSpeed > 0) {
        clampedForward = Math.min(forwardSpeed, this.physics.maxForwardSpeed);
      } else {
        clampedForward = Math.max(forwardSpeed, -this.physics.maxReverseSpeed);
      }

      clampedLateral = Math.max(
        -this.physics.maxStrafeSpeed,
        Math.min(lateralSpeed, this.physics.maxStrafeSpeed)
      );

      // Apply damping if no thrust input
      const dampingFactor = 0.9; // Exponential decay per second
      const dampingThisFrame = Math.pow(dampingFactor, deltaTime);

      if (input.thrust === 0) {
        clampedForward *= dampingThisFrame;
      }
      if (input.strafeX === 0 && input.strafeY === 0) {
        clampedLateral *= dampingThisFrame;
      }

      // Transform back to world space
      state.velocity.x = clampedForward * cosRot - clampedLateral * sinRot;
      state.velocity.y = clampedForward * sinRot + clampedLateral * cosRot;
    }

    // Update position
    state.position.x += state.velocity.x * deltaTime;
    state.position.y += state.velocity.y * deltaTime;

    // Angular motion
    const angularAccel = this.physics.yawAccel * input.yawInput;
    state.angularVelocity += angularAccel * deltaTime;

    // Flight Assist: angular velocity limiting and damping
    if (input.flightAssist) {
      state.angularVelocity = Math.max(
        -this.physics.maxYawRate,
        Math.min(state.angularVelocity, this.physics.maxYawRate)
      );

      if (input.yawInput === 0) {
        const angularDamping = 0.9;
        state.angularVelocity *= Math.pow(angularDamping, deltaTime);
      }
    }

    // Update rotation
    state.rotation += state.angularVelocity * deltaTime;

    // Normalize rotation to [-π, π]
    while (state.rotation > Math.PI) state.rotation -= 2 * Math.PI;
    while (state.rotation < -Math.PI) state.rotation += 2 * Math.PI;
  }

  /**
   * Clear input history (useful when restarting prediction)
   */
  clearHistory(): void {
    this.inputHistory = [];
  }

  /**
   * Get number of inputs in history
   */
  getHistorySize(): number {
    return this.inputHistory.length;
  }
}
