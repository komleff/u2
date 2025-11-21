using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Flight Assist system for M3.0
/// FA:ON = enforce speed/g-limits, damping, stabilization
/// FA:OFF = raw control pass-through (no intervention)
/// 
/// This system runs AFTER PhysicsSystem to apply post-physics corrections.
/// It modifies velocity and momentum to enforce flight assist constraints.
/// </summary>
public class FlightAssistSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private readonly float _deltaTime;
    private readonly float _speedOfLight_mps;

    public FlightAssistSystem(GameContext context, float speedOfLight_mps = 5000.0f, float deltaTime = 1.0f / 60.0f)
    {
        _context = context;
        _deltaTime = deltaTime;
        _speedOfLight_mps = speedOfLight_mps;
    }

    public void Execute()
    {
        var entities = _context.GetEntities(GameMatcher.AllOf(
            GameMatcher.FlightAssist,
            GameMatcher.Velocity,
            GameMatcher.Momentum,
            GameMatcher.Mass,
            GameMatcher.ShipConfig,
            GameMatcher.ControlState,
            GameMatcher.Transform2D
        ));

        foreach (var entity in entities)
        {
            // Skip destroyed ships
            if (entity.hasHealth && entity.health.Current_HP <= 0)
            {
                continue;
            }

            // Only apply corrections if FA:ON
            if (entity.flightAssist.Enabled)
            {
                ApplyFlightAssist(entity);
            }
            // FA:OFF: Do nothing - let physics run free
        }
    }

    private void ApplyFlightAssist(GameEntity entity)
    {
        var config = entity.shipConfig.Config;
        var limits = config.FlightAssistLimits;
        var velocity = entity.velocity;
        var momentum = entity.momentum;
        var mass = entity.mass;
        var control = entity.controlState;
        var rotation = entity.transform2D.Rotation;

        // Step 1: Transform velocity to ship-local space for directional limiting
        var cosRot = MathF.Cos(rotation);
        var sinRot = MathF.Sin(rotation);

        var localVelX = velocity.Linear.X * cosRot + velocity.Linear.Y * sinRot;   // Forward/reverse
        var localVelY = -velocity.Linear.X * sinRot + velocity.Linear.Y * cosRot;  // Lateral

        // Step 2: Apply directional speed limits
        float maxForward = limits.LinearSpeedMax_mps.Forward;
        float maxReverse = limits.LinearSpeedMax_mps.Reverse;
        float maxLateral = limits.LinearSpeedMax_mps.Lateral;
        float maxDecel_mps2 = limits.CrewGLimit.Linear_g * 9.81f;

        // Check if we're currently overspeeding BEFORE clamping
        bool isOverspeedingX = localVelX > maxForward || localVelX < -maxReverse;
        bool isOverspeedingY = MathF.Abs(localVelY) > maxLateral;

        localVelX = ClampWithSmoothing(localVelX, maxForward, -maxReverse, maxDecel_mps2);
        localVelY = ClampWithSmoothing(localVelY, maxLateral, -maxLateral, maxDecel_mps2);

        // Step 3: Apply linear damping when controls are idle (autopilot slowdown)
        // BUT only if we're not already in emergency braking mode
        bool isLinearIdle = MathF.Abs(control.Thrust) < 0.01f && MathF.Abs(control.Strafe_X) < 0.01f;
        if (isLinearIdle && !isOverspeedingX && !isOverspeedingY)
        {
            // Exponential decay: v_new = v * exp(-λ * dt)
            // where λ (decay rate) is chosen for comfortable deceleration
            // λ = 1.0 gives ~18% reduction in 10 frames (@ 60Hz)
            float decayRate = 1.0f; // Per second
            float dampingFactor = MathF.Exp(-decayRate * _deltaTime);
            localVelX *= dampingFactor;
            localVelY *= dampingFactor;
        }

        // Step 4: Transform back to world space
        velocity.Linear = new Vector2(
            localVelX * cosRot - localVelY * sinRot,
            localVelX * sinRot + localVelY * cosRot
        );

        // Step 5: Angular velocity limiting and damping (PD controller)
        float maxYawRate_radps = limits.AngularSpeedMax_dps.Yaw * MathF.PI / 180.0f;
        
        // Clamp angular velocity
        velocity.Angular = MathF.Max(-maxYawRate_radps, MathF.Min(velocity.Angular, maxYawRate_radps));

        // Apply angular damping when yaw control is idle
        bool isAngularIdle = MathF.Abs(control.Yaw_Input) < 0.01f;
        if (isAngularIdle)
        {
            // Aggressive damping for rotation (target: zero rotation rate)
            // PD controller: damping proportional to max angular acceleration
            float maxAngularAccel_radps2 = config.Physics.AngularAcceleration_dps2.Yaw * MathF.PI / 180.0f;
            
            // Critical damping coefficient: 2 * sqrt(k * I) where k is "spring constant"
            // We use damping rate = 2 * maxAngularAccel for fast stabilization
            float angularDampingRate = 2.0f * maxAngularAccel_radps2;
            float angularDampingFactor = MathF.Exp(-angularDampingRate * _deltaTime);
            velocity.Angular *= angularDampingFactor;
        }

        // Step 6: Update momentum to match corrected velocity
        // Recalculate momentum from velocity (reverse of PhysicsSystem logic)
        var speed = velocity.Linear.Magnitude;
        if (speed > 0)
        {
            var beta = MathF.Min(speed / _speedOfLight_mps, 0.99f);
            var gamma = 1.0f / MathF.Sqrt(1.0f - beta * beta);
            momentum.Linear = velocity.Linear * (gamma * mass.Mass_kg);
        }
        else
        {
            momentum.Linear = Vector2.Zero;
        }

        if (mass.Inertia_kgm2 > 0)
        {
            momentum.Angular = velocity.Angular * mass.Inertia_kgm2;
        }

        // Step 7: Update entity components
        entity.ReplaceVelocity(velocity.Linear, velocity.Angular);
        entity.ReplaceMomentum(momentum.Linear, momentum.Angular);
    }

    /// <summary>
    /// Clamp speed with smooth deceleration respecting g-limits
    /// Returns clamped value with exponential damping near limit
    /// </summary>
    private float ClampWithSmoothing(float speed, float maxPositive, float maxNegative, float maxDecel_mps2)
    {
        if (speed > maxPositive)
        {
            // Overspeed: apply emergency braking within g-limits
            float overspeed = speed - maxPositive;
            float decelThisFrame = MathF.Min(overspeed, maxDecel_mps2 * _deltaTime);
            return speed - decelThisFrame;
        }
        else if (speed < maxNegative)
        {
            // Overspeed in reverse: apply emergency braking within g-limits
            float overspeed = MathF.Abs(speed - maxNegative);
            float decelThisFrame = MathF.Min(overspeed, maxDecel_mps2 * _deltaTime);
            return speed + decelThisFrame;
        }

        return speed;
    }
}
