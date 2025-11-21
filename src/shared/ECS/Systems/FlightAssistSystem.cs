using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Flight Assist system (M3.0)
/// FA:ON = enforce speed/g-limits, damping, stabilization
/// FA:OFF = raw control pass-through (no modifications)
/// </summary>
public class FlightAssistSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private readonly float _deltaTime;
    private const float DampingRate = 2.0f; // Damping coefficient for FA:ON

    public FlightAssistSystem(GameContext context, float deltaTime = 1.0f / 60.0f)
    {
        _context = context;
        _deltaTime = deltaTime;
    }

    public void Execute()
    {
        var entities = _context.GetEntities(GameMatcher.AllOf(
            GameMatcher.FlightAssist,
            GameMatcher.Velocity,
            GameMatcher.ShipConfig,
            GameMatcher.ControlState
        ));

        foreach (var entity in entities)
        {
            // FA:OFF - skip processing, let physics handle raw inputs
            if (!entity.flightAssist.Enabled)
            {
                continue;
            }

            // FA:ON - apply limits and stabilization
            ApplyFlightAssist(entity);
        }
    }

    private void ApplyFlightAssist(GameEntity entity)
    {
        var config = entity.shipConfig.Config;
        var limits = config.FlightAssistLimits;
        var velocity = entity.velocity;
        var control = entity.controlState;

        // 1. Limit linear speed to FA:ON maximum
        var speed = velocity.Linear.Magnitude;
        
        // Determine max speed based on primary control direction
        var maxSpeed = GetMaxSpeedForDirection(control, limits);
        
        if (speed > maxSpeed && maxSpeed > 0)
        {
            // Apply damping to reduce speed towards limit
            var overspeed = speed - maxSpeed;
            var maxDecel = limits.CrewGLimit.Linear_g * 9.81f; // Convert g to m/s²
            var targetDamping = overspeed / _deltaTime; // Damping needed to reach limit in one frame
            var actualDamping = MathF.Min(targetDamping, maxDecel); // Respect g-limit
            
            var dampingFactor = MathF.Max(0, 1.0f - (actualDamping * _deltaTime / speed));
            velocity.Linear *= dampingFactor;
        }

        // 2. Dampen angular velocity (rotation stabilization)
        if (MathF.Abs(velocity.Angular) > 1e-3f)
        {
            // Get max angular acceleration from ship config
            var angularAccel = config.Physics.AngularAcceleration_dps2;
            var maxAngularAccel_radps2 = MathF.Max(
                angularAccel.Yaw,
                MathF.Max(angularAccel.Pitch, angularAccel.Roll)
            ) * MathF.PI / 180.0f; // Convert deg/s² to rad/s²

            // PD-style damping: reduce rotation with rate limited by max acceleration
            var dampingRate = DampingRate * maxAngularAccel_radps2 / MathF.Max(MathF.Abs(velocity.Angular), 1e-3f);
            var angularDampingFactor = MathF.Exp(-dampingRate * _deltaTime);
            velocity.Angular *= angularDampingFactor;
        }

        // 3. Apply linear damping when controls are idle (auto-brake)
        if (IsControlIdle(control))
        {
            // Gentle damping at half the max deceleration
            var dampingAccel = limits.CrewGLimit.Linear_g * 9.81f * 0.5f;
            var linearSpeed = velocity.Linear.Magnitude;
            
            if (linearSpeed > 1e-3f)
            {
                var dampingFactor = MathF.Exp(-(dampingAccel / linearSpeed) * _deltaTime);
                velocity.Linear *= dampingFactor;
            }
        }

        // Update velocity component
        entity.ReplaceVelocity(velocity.Linear, velocity.Angular);
    }

    /// <summary>
    /// Determine max speed based on primary thrust direction
    /// </summary>
    private float GetMaxSpeedForDirection(Components.ControlStateComponent control, Ships.FlightAssistLimits limits)
    {
        // If thrusting forward, use forward limit
        if (control.Thrust > 0.1f)
        {
            return limits.LinearSpeedMax_mps.Forward;
        }
        // If reversing, use reverse limit
        else if (control.Thrust < -0.1f)
        {
            return limits.LinearSpeedMax_mps.Reverse;
        }
        // If strafing, use lateral limit
        else if (MathF.Abs(control.Strafe_X) > 0.1f)
        {
            return limits.LinearSpeedMax_mps.Lateral;
        }
        
        // If idle, use the most restrictive limit for general speed limiting
        return MathF.Min(
            limits.LinearSpeedMax_mps.Forward,
            MathF.Min(limits.LinearSpeedMax_mps.Reverse, limits.LinearSpeedMax_mps.Lateral)
        );
    }

    /// <summary>
    /// Check if control inputs are effectively idle (near zero)
    /// </summary>
    private bool IsControlIdle(Components.ControlStateComponent control)
    {
        const float threshold = 0.01f;
        return MathF.Abs(control.Thrust) < threshold &&
               MathF.Abs(control.Strafe_X) < threshold &&
               MathF.Abs(control.Yaw_Input) < threshold;
    }
}
