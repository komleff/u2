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
    const brake = input.brake ?? false;

    // Calculate thrust force based on input direction
    let thrustForceX = 0;
    let thrustForceY = 0;

    // Copy inputs so brake can override them
    let thrustInput = input.thrust;
    let strafeXInput = input.strafeX;
    let yawInput = input.yawInput;

    if (brake) {
      const cosRot = Math.cos(state.rotation);
      const sinRot = Math.sin(state.rotation);
      const localVelX = state.velocity.x * cosRot + state.velocity.y * sinRot;
      const localVelY = -state.velocity.x * sinRot + state.velocity.y * cosRot;

      thrustInput =
        localVelX > 0
          ? -Math.min(1, Math.abs(localVelX) / (this.physics.reverseAccel * deltaTime))
          : Math.min(1, Math.abs(localVelX) / (this.physics.forwardAccel * deltaTime));

      strafeXInput =
        localVelY > 0
          ? -Math.min(1, Math.abs(localVelY) / (this.physics.strafeAccel * deltaTime))
          : Math.min(1, Math.abs(localVelY) / (this.physics.strafeAccel * deltaTime));

      yawInput =
        state.angularVelocity !== 0
          ? -Math.sign(state.angularVelocity) *
            Math.min(1, Math.abs(state.angularVelocity) / (this.physics.yawAccel * deltaTime))
          : 0;
    }

    // Forward/reverse thrust
    if (thrustInput > 0) {
      const angle = state.rotation;
      const accel = this.physics.forwardAccel * thrustInput;
      thrustForceX += Math.cos(angle) * accel;
      thrustForceY += Math.sin(angle) * accel;
    } else if (thrustInput < 0) {
      const angle = state.rotation;
      const accel = this.physics.reverseAccel * Math.abs(thrustInput);
      thrustForceX -= Math.cos(angle) * accel;
      thrustForceY -= Math.sin(angle) * accel;
    }

    // Strafe (lateral thrust perpendicular to heading)
    if (strafeXInput !== 0 || input.strafeY !== 0) {
      const angle = state.rotation;
      const perpAngle = angle + Math.PI / 2;

      // X strafe (right/left)
      if (strafeXInput !== 0) {
        const accel = this.physics.strafeAccel * strafeXInput;
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
    if (input.flightAssist || brake) {
      // Transform velocity to ship-local space
      const cosRot = Math.cos(state.rotation);
      const sinRot = Math.sin(state.rotation);

      const localVelX = state.velocity.x * cosRot + state.velocity.y * sinRot;
      const localVelY = -state.velocity.x * sinRot + state.velocity.y * cosRot;

      // Apply speed limits in local space
      let clampedForward = localVelX;
      let clampedLateral = localVelY;

      if (localVelX > 0) {
        clampedForward = Math.min(localVelX, this.physics.maxForwardSpeed);
      } else {
        clampedForward = Math.max(localVelX, -this.physics.maxReverseSpeed);
      }

      clampedLateral = Math.max(
        -this.physics.maxStrafeSpeed,
        Math.min(localVelY, this.physics.maxStrafeSpeed)
      );

      // Soft deceleration for speed limits (G-limited)
      const maxDecel = this.physics.crewGLimit * 9.81;
      const maxChange = maxDecel * deltaTime;

      if (Math.abs(clampedForward - localVelX) > 0.01) {
        const desiredChange = clampedForward - localVelX;
        if (Math.abs(desiredChange) > maxChange) {
          clampedForward = localVelX + Math.sign(desiredChange) * maxChange;
        }
      }

      if (Math.abs(clampedLateral - localVelY) > 0.01) {
        const desiredChange = clampedLateral - localVelY;
        if (Math.abs(desiredChange) > maxChange) {
          clampedLateral = localVelY + Math.sign(desiredChange) * maxChange;
        }
      }

      // Apply damping if no thrust input (Braking)
      if (thrustInput === 0 && strafeXInput === 0 && input.strafeY === 0) {
         // Active Braking: Apply thrusters to stop (limited by G-force)
         
         // 1. Longitudinal Braking
         if (Math.abs(clampedForward) > 0.01) {
             const isMovingForward = clampedForward > 0;
             // If moving forward, we use reverse thrusters to brake
             const thrusterLimit = isMovingForward ? this.physics.reverseAccel : this.physics.forwardAccel;
             const brakingAccel = Math.min(thrusterLimit, maxDecel);
             
             const deltaV = brakingAccel * deltaTime;
             
             if (Math.abs(clampedForward) > deltaV) {
                 clampedForward -= Math.sign(clampedForward) * deltaV;
             } else {
                 clampedForward = 0;
             }
         }

         // 2. Lateral Braking
         if (Math.abs(clampedLateral) > 0.01) {
             const thrusterLimit = this.physics.strafeAccel;
             const brakingAccel = Math.min(thrusterLimit, maxDecel);
             
             const deltaV = brakingAccel * deltaTime;
             
             if (Math.abs(clampedLateral) > deltaV) {
                 clampedLateral -= Math.sign(clampedLateral) * deltaV;
             } else {
                 clampedLateral = 0;
             }
         }
      } else {
         // If only partial input, damp the unused axes? 
         // The server logic damps ALL axes if ALL inputs are idle.
         // If any input is active, it relies on the speed limits to keep things in check.
         // However, for better feel, we might want to damp lateral if only thrusting forward.
         // But let's stick to server logic: "IsControlIdle" check.
         // Wait, server logic: if (IsControlIdle) ApplyLinearDamping.
         // So if I'm thrusting forward, I don't get lateral damping?
         // That means I drift sideways forever while flying forward?
         // Let's check server code again.
         // Yes: if (IsControlIdle(entity.controlState)) ApplyLinearDamping(entity, limits);
         // This implies that if I hold W, I will drift sideways if I had lateral momentum.
         // That seems... odd for FA:ON. Usually FA:ON cancels all drift.
         // But I must match server logic.
      }

      // Transform back to world space
      state.velocity.x = clampedForward * cosRot - clampedLateral * sinRot;
      state.velocity.y = clampedForward * sinRot + clampedLateral * cosRot;
    }

    // Update position
    state.position.x += state.velocity.x * deltaTime;
    state.position.y += state.velocity.y * deltaTime;

    // Angular motion
    const angularAccel = this.physics.yawAccel * yawInput;
    state.angularVelocity += angularAccel * deltaTime;

    // Flight Assist: angular velocity limiting and damping
    if (input.flightAssist) {
      // 1. Clamp to max rate
      state.angularVelocity = Math.max(
        -this.physics.maxYawRate,
        Math.min(state.angularVelocity, this.physics.maxYawRate)
      );

      // 2. Damping when no input
      if (yawInput === 0) {
        // Damping rate proportional to angular acceleration (fast response)
        const dampingRate = 2.0 * this.physics.yawAccel;
        const dampingFactor = Math.exp(-dampingRate * deltaTime);
        state.angularVelocity *= dampingFactor;
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
