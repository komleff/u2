import { DEFAULT_PHYSICS, type PhysicsConfig } from "@config/physics";
import type { Vector2 } from "@types/simulation";
import type { PlayerInput } from "./NetworkClient";

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
 * Client-side prediction engine
 * Simulates physics locally and maintains input history for reconciliation
 */
export class PredictionEngine {
  private predictedState: EntityState;
  private inputHistory: InputRecord[] = [];
  private physics: PhysicsConfig;
  private maxHistorySize = 120; // 2 seconds at 60 Hz
  private reconciliationThreshold: number;
  private readonly rotationThreshold = 0.087; // 5 deg in radians

  constructor(
    initialState: EntityState,
    physics: PhysicsConfig = DEFAULT_PHYSICS,
    reconciliationThreshold = 1.0
  ) {
    this.predictedState = this.cloneState(initialState);
    this.physics = physics;
    this.reconciliationThreshold = reconciliationThreshold;
  }

  /**
   * Apply input locally and store for replay
   */
  applyInput(input: PlayerInput, deltaTime: number): EntityState {
    // Store input in history
    this.inputHistory.push({
      input: { ...input },
      state: this.cloneState(this.predictedState)
    });

    // Trim history to max size
    if (this.inputHistory.length > this.maxHistorySize) {
      this.inputHistory.shift();
    }

    // Apply physics simulation
    this.simulatePhysics(input, deltaTime);

    return this.cloneState(this.predictedState);
  }

  /**
   * Get current predicted state
   */
  getState(): EntityState {
    return this.cloneState(this.predictedState);
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
      (record) => record.input.sequenceNumber > lastProcessedSequence
    );

    if (replayFromIndex === -1) {
      // All our inputs have been processed, just accept server state
      this.predictedState = this.cloneState(serverState);
      this.inputHistory = [];
      return this.cloneState(this.predictedState);
    }

    // Calculate prediction error
    const positionError = Math.hypot(
      this.predictedState.position.x - serverState.position.x,
      this.predictedState.position.y - serverState.position.y
    );

    const rotationError = Math.abs(this.predictedState.rotation - serverState.rotation);

    // Only reconcile if error exceeds threshold (configurable meters or 5 degrees)
    const needsReconciliation =
      positionError > this.reconciliationThreshold || rotationError > this.rotationThreshold;

    if (!needsReconciliation) {
      // Trim processed inputs from history
      this.inputHistory = this.inputHistory.slice(replayFromIndex);
      return this.cloneState(this.predictedState);
    }

    console.warn("[Prediction] Reconciling:", {
      positionError: positionError.toFixed(2),
      rotationErrorDeg: ((rotationError * 180) / Math.PI).toFixed(2),
      inputsToReplay: this.inputHistory.length - replayFromIndex
    });

    // Rewind to server state
    this.predictedState = this.cloneState(serverState);

    // Replay unprocessed inputs
    const inputsToReplay = this.inputHistory.slice(replayFromIndex);
    for (const record of inputsToReplay) {
      this.simulatePhysics(record.input, deltaTime);
    }

    // Update history
    this.inputHistory = inputsToReplay;

    return this.cloneState(this.predictedState);
  }

  private cloneState(state: EntityState): EntityState {
    return {
      position: { ...state.position },
      rotation: state.rotation,
      velocity: { ...state.velocity },
      angularVelocity: state.angularVelocity
    };
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

      // Apply speed limits with g-limited braking (matching server)
      const maxForward = this.physics.maxForwardSpeed;
      const maxReverse = this.physics.maxReverseSpeed;
      const maxLateral = this.physics.maxStrafeSpeed;
      const maxDecel_mps2 = 11.0 * 9.81; // crew g-limit: 11g

      let clampedForward = localVelX;
      let clampedLateral = localVelY;

      // Check for overspeed BEFORE clamping (for idle damping logic)
      const isOverspeedingX = localVelX > maxForward || localVelX < -maxReverse;
      const isOverspeedingY = Math.abs(localVelY) > maxLateral;

      // Apply gradual g-limited braking if overspeeding
      if (localVelX > maxForward) {
        const overspeed = localVelX - maxForward;
        const decelThisFrame = Math.min(overspeed, maxDecel_mps2 * deltaTime);
        clampedForward = localVelX - decelThisFrame;
      } else if (localVelX < -maxReverse) {
        const overspeed = Math.abs(localVelX + maxReverse);
        const decelThisFrame = Math.min(overspeed, maxDecel_mps2 * deltaTime);
        clampedForward = localVelX + decelThisFrame;
      }

      if (Math.abs(localVelY) > maxLateral) {
        const overspeed = Math.abs(localVelY) - maxLateral;
        const decelThisFrame = Math.min(overspeed, maxDecel_mps2 * deltaTime);
        clampedLateral = localVelY > 0 
          ? localVelY - decelThisFrame 
          : localVelY + decelThisFrame;
      }

      // Apply idle damping ONLY if not overspeeding (matching server)
      const isLinearIdle = input.thrust === 0 && input.strafeX === 0 && input.strafeY === 0;
      if (isLinearIdle && !isOverspeedingX && !isOverspeedingY) {
        // Exponential decay matching server: v_new = v * exp(-λ * dt)
        const decayRate = 1.0; // per second (matches server)
        const dampingFactor = Math.exp(-decayRate * deltaTime);
        clampedForward *= dampingFactor;
        clampedLateral *= dampingFactor;
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
      const maxYawRate_radps = this.physics.maxYawRate;
      
      // Clamp angular velocity
      state.angularVelocity = Math.max(
        -maxYawRate_radps,
        Math.min(state.angularVelocity, maxYawRate_radps)
      );

      // Apply angular damping when yaw control is idle (matching server)
      if (input.yawInput === 0) {
        // Critical damping for fast stabilization (matches server)
        const maxAngularAccel_radps2 = this.physics.yawAccel; // Already in rad/s²
        const angularDampingRate = 2.0 * maxAngularAccel_radps2;
        const angularDampingFactor = Math.exp(-angularDampingRate * deltaTime);
        state.angularVelocity *= angularDampingFactor;
      }
    }

    // Update rotation
    state.rotation += state.angularVelocity * deltaTime;

    // Normalize rotation to [-PI, PI]
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
