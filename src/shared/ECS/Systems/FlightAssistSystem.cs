using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Flight Assist system for M3.0
/// FA:ON = enforce speed/g-limits, damping
/// FA:OFF = raw control pass-through (no modifications)
/// </summary>
public class FlightAssistSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private const float DampingFactor = 0.85f; // Exponential damping coefficient

    public FlightAssistSystem(GameContext context)
    {
        _context = context;
    }

    public void Execute()
    {
        var entities = _context.GetEntities(GameMatcher.AllOf(
            GameMatcher.FlightAssist,
            GameMatcher.Velocity,
            GameMatcher.ShipConfig
        ));

        foreach (var entity in entities)
        {
            // FA:OFF - do nothing (raw physics)
            if (!entity.flightAssist.Enabled)
            {
                continue;
            }

            // FA:ON - apply stabilization and limits
            ApplyFlightAssist(entity);
        }
    }

    /// <summary>
    /// Apply Flight Assist stabilization when FA:ON
    /// </summary>
    private void ApplyFlightAssist(GameEntity entity)
    {
        var config = entity.shipConfig.Config;
        var limits = config.FlightAssistLimits;
        var velocity = entity.velocity;

        // 1. Apply linear speed limits
        ApplyLinearSpeedLimits(ref velocity, limits);

        // 2. Apply angular damping (stabilize rotation)
        ApplyAngularDamping(ref velocity);

        // 3. Apply linear damping when controls are idle
        if (entity.hasControlState && IsControlIdle(entity.controlState))
        {
            ApplyLinearDamping(ref velocity);
        }

        // Update velocity component
        entity.ReplaceVelocity(velocity.Linear, velocity.Angular);
    }

    /// <summary>
    /// Limit linear speed to FA:ON maximum speed
    /// </summary>
    private void ApplyLinearSpeedLimits(ref Components.VelocityComponent velocity, Ships.FlightAssistLimits limits)
    {
        var speed = velocity.Linear.Magnitude;
        
        // Use the maximum of all directional limits as the overall speed cap
        var maxSpeed = MathF.Max(
            MathF.Max(limits.LinearSpeedMax_mps.Forward, limits.LinearSpeedMax_mps.Reverse),
            MathF.Max(limits.LinearSpeedMax_mps.Lateral, limits.LinearSpeedMax_mps.Vertical)
        );

        if (speed > maxSpeed)
        {
            // Clamp speed to maximum, preserving direction
            velocity.Linear = velocity.Linear.Normalized * maxSpeed;
        }
    }

    /// <summary>
    /// Apply damping to angular velocity to stabilize rotation
    /// </summary>
    private void ApplyAngularDamping(ref Components.VelocityComponent velocity)
    {
        // Exponential decay: ω_new = ω * damping_factor
        velocity.Angular *= DampingFactor;
        
        // Zero out very small angular velocities to prevent drift
        if (MathF.Abs(velocity.Angular) < 0.001f)
        {
            velocity.Angular = 0.0f;
        }
    }

    /// <summary>
    /// Apply damping to linear velocity when controls are idle
    /// </summary>
    private void ApplyLinearDamping(ref Components.VelocityComponent velocity)
    {
        // Exponential decay: v_new = v * damping_factor
        velocity.Linear *= DampingFactor;
        
        // Zero out very small velocities to prevent drift
        if (velocity.Linear.SqrMagnitude < 0.01f)
        {
            velocity.Linear = Vector2.Zero;
        }
    }

    /// <summary>
    /// Check if control inputs are idle (near zero)
    /// </summary>
    private bool IsControlIdle(Components.ControlStateComponent control)
    {
        return MathF.Abs(control.Thrust) < 0.01f &&
               MathF.Abs(control.Strafe_X) < 0.01f &&
               MathF.Abs(control.Yaw_Input) < 0.01f;
    }
}
