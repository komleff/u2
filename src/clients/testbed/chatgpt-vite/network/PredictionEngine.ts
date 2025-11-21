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

    // Angular motion
    const angularAccel = this.physics.yawAccel * input.yawInput;
    state.angularVelocity += angularAccel * deltaTime;

    // M3.0: Flight Assist ON/OFF
    if (input.flightAssist) {
      this.applyFlightAssist(state, input, deltaTime);
    }

    // Update position
    state.position.x += state.velocity.x * deltaTime;
    state.position.y += state.velocity.y * deltaTime;

    // Update rotation
    state.rotation += state.angularVelocity * deltaTime;

    // Normalize rotation to [-PI, PI]
    while (state.rotation > Math.PI) state.rotation -= 2 * Math.PI;
    while (state.rotation < -Math.PI) state.rotation += 2 * Math.PI;
  }

  /**
   * Apply Flight Assist limits and damping (M3.0)
   * Matches server-side FlightAssistSystem.cs implementation
   */
  private applyFlightAssist(state: EntityState, input: PlayerInput, deltaTime: number): void {
    const crewGLimit = 11.0; // g (from physics.json limits.crew_g_limit)
    const dampingRate = 2.0; // Matches C# constant

    // 1. Limit linear speed to FA:ON maximum
    const speed = Math.hypot(state.velocity.x, state.velocity.y);

    // Determine max speed based on primary control direction
    let maxSpeed: number;
    if (input.thrust > 0.1) {
      maxSpeed = this.physics.maxForwardSpeed;
    } else if (input.thrust < -0.1) {
      maxSpeed = this.physics.maxReverseSpeed;
    } else if (Math.abs(input.strafeX) > 0.1 || Math.abs(input.strafeY) > 0.1) {
      maxSpeed = this.physics.maxStrafeSpeed;
    } else {
      // Idle: use most restrictive limit
      maxSpeed = Math.min(
        this.physics.maxForwardSpeed,
        Math.min(this.physics.maxReverseSpeed, this.physics.maxStrafeSpeed)
      );
    }

    if (speed > maxSpeed && maxSpeed > 0) {
      // Apply damping to reduce speed towards limit
      const overspeed = speed - maxSpeed;
      const maxDecel = crewGLimit * 9.81; // Convert g to m/s²
      const targetDamping = overspeed / deltaTime; // Damping needed to reach limit in one frame
      const actualDamping = Math.min(targetDamping, maxDecel); // Respect g-limit

      const dampingFactor = Math.max(0, 1.0 - (actualDamping * deltaTime) / speed);
      state.velocity.x *= dampingFactor;
      state.velocity.y *= dampingFactor;
    }

    // 2. Dampen angular velocity when no yaw input (rotation stabilization)
    if (Math.abs(input.yawInput) < 0.01 && Math.abs(state.angularVelocity) > 1e-3) {
      // Get max angular acceleration from ship config
      const maxAngularAccel_radps2 = Math.max(
        this.physics.yawAccel,
        Math.max(this.physics.pitchAccel, this.physics.rollAccel)
      );

      // PD-style damping: reduce rotation with rate limited by max acceleration
      const angularDampingRateCalc =
        (dampingRate * maxAngularAccel_radps2) / Math.max(Math.abs(state.angularVelocity), 1e-3);
      const angularDampingFactor = Math.exp(-angularDampingRateCalc * deltaTime);
      state.angularVelocity *= angularDampingFactor;
    }

    // 3. Apply linear damping when controls are idle (auto-brake)
    const isIdle =
      Math.abs(input.thrust) < 0.01 &&
      Math.abs(input.strafeX) < 0.01 &&
      Math.abs(input.strafeY) < 0.01 &&
      Math.abs(input.yawInput) < 0.01;

    if (isIdle) {
      // Gentle damping at half the max deceleration
      const dampingAccel = crewGLimit * 9.81 * 0.5;
      const linearSpeed = Math.hypot(state.velocity.x, state.velocity.y);

      if (linearSpeed > 1e-3) {
        const linearDampingFactor = Math.exp((-dampingAccel / linearSpeed) * deltaTime);
        state.velocity.x *= linearDampingFactor;
        state.velocity.y *= linearDampingFactor;
      }
    }
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
