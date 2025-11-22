using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Flight Assist system - M3.0 implementation
/// FA:ON = enforce speed/g-limits, damping
/// FA:OFF = raw control pass-through
/// 
/// Execution order: PhysicsSystem → FlightAssistSystem
/// This system modifies velocities AFTER physics integration (post-processing)
/// </summary>
public class FlightAssistSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private readonly float _deltaTime;
    private const float DampingRate = 0.9f; // Exponential decay factor per second

    public FlightAssistSystem(GameContext context, float deltaTime = 1.0f / 60.0f)
    {
        _context = context;
        _deltaTime = deltaTime;
    }

    public void Execute()
    {
        // Process all entities with FlightAssist, Velocity, and ShipConfig
        var entities = _context.GetEntities(GameMatcher.AllOf(
            GameMatcher.FlightAssist,
            GameMatcher.Velocity,
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

            // Only apply FA logic if FA:ON
            if (entity.flightAssist.Enabled)
            {
                ApplyFlightAssist(entity);
            }
            // FA:OFF: Do nothing - let raw physics control the ship
        }
    }

    private void ApplyFlightAssist(GameEntity entity)
    {
        var shipConfig = entity.shipConfig.Config;
        var limits = shipConfig.FlightAssistLimits;
        var velocity = entity.velocity;
        var control = entity.controlState;
        var transform = entity.transform2D;

        // 1. Apply speed limiting in ship-local coordinates
        ApplySpeedLimits(ref velocity, limits, transform.Rotation);

        // 2. Apply angular velocity damping (auto-stabilize rotation)
        ApplyAngularDamping(ref velocity, limits, control);

        // 3. Apply linear velocity damping when controls are idle
        ApplyLinearDamping(ref velocity, control, transform.Rotation);

        // Update the entity's velocity component
        entity.ReplaceVelocity(velocity.Linear, velocity.Angular);
    }

    /// <summary>
    /// Limit linear speed to FA:ON maximums in ship-local coordinates
    /// </summary>
    private void ApplySpeedLimits(ref Components.VelocityComponent velocity, Ships.FlightAssistLimits limits, float rotation)
    {
        // Transform velocity to ship-local space
        float cos = MathF.Cos(rotation);
        float sin = MathF.Sin(rotation);

        // Local velocity: forward (X) and lateral (Y)
        float localVelX = velocity.Linear.X * cos + velocity.Linear.Y * sin;
        float localVelY = -velocity.Linear.X * sin + velocity.Linear.Y * cos;

        // Apply forward/reverse limits
        if (localVelX > 0)
        {
            localVelX = MathF.Min(localVelX, limits.LinearSpeedMax_mps.Forward);
        }
        else
        {
            localVelX = MathF.Max(localVelX, -limits.LinearSpeedMax_mps.Reverse);
        }

        // Apply lateral limits
        localVelY = MathF.Max(-limits.LinearSpeedMax_mps.Lateral, 
                             MathF.Min(localVelY, limits.LinearSpeedMax_mps.Lateral));

        // Transform back to world space
        velocity.Linear = new Vector2(
            localVelX * cos - localVelY * sin,
            localVelX * sin + localVelY * cos
        );
    }

    /// <summary>
    /// Apply damping to angular velocity (auto-stabilize rotation)
    /// </summary>
    private void ApplyAngularDamping(ref Components.VelocityComponent velocity, Ships.FlightAssistLimits limits, Components.ControlStateComponent control)
    {
        // Limit angular velocity to maximum
        float maxYawRate_radps = limits.AngularSpeedMax_dps.Yaw * MathF.PI / 180.0f;
        velocity.Angular = MathF.Max(-maxYawRate_radps, MathF.Min(velocity.Angular, maxYawRate_radps));

        // Apply damping when no yaw input (auto-stabilize)
        if (MathF.Abs(control.Yaw_Input) < 0.01f)
        {
            float dampingThisFrame = MathF.Pow(DampingRate, _deltaTime);
            velocity.Angular *= dampingThisFrame;
        }
    }

    /// <summary>
    /// Apply damping to linear velocity when controls are idle (auto-stop)
    /// Uses selective damping: each axis (forward/lateral) is dampened independently
    /// </summary>
    private void ApplyLinearDamping(ref Components.VelocityComponent velocity, Components.ControlStateComponent control, float rotation)
    {
        // Check which controls are idle
        bool thrustIdle = MathF.Abs(control.Thrust) < 0.01f;
        bool strafeIdle = MathF.Abs(control.Strafe_X) < 0.01f;

        // Optimization: if BOTH controls are active, skip damping entirely
        // (Selective damping will still occur if only one control is active)
        if (!thrustIdle && !strafeIdle)
        {
            return; // Both controls active - no damping needed
        }

        // Transform to local coordinates to apply selective damping
        float cos = MathF.Cos(rotation);
        float sin = MathF.Sin(rotation);

        float localVelX = velocity.Linear.X * cos + velocity.Linear.Y * sin;
        float localVelY = -velocity.Linear.X * sin + velocity.Linear.Y * cos;

        float dampingThisFrame = MathF.Pow(DampingRate, _deltaTime);

        // Apply damping to forward/reverse if thrust is idle
        if (thrustIdle)
        {
            localVelX *= dampingThisFrame;
        }

        // Apply damping to lateral if strafe is idle
        if (strafeIdle)
        {
            localVelY *= dampingThisFrame;
        }

        // Transform back to world space
        velocity.Linear = new Vector2(
            localVelX * cos - localVelY * sin,
            localVelX * sin + localVelY * cos
        );
    }
}
