using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Flight Assist system - M3.0 implementation
/// FA:ON = enforce speed/g-limits, damping
/// FA:OFF = raw control pass-through
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
            GameMatcher.ShipConfig,
            GameMatcher.ControlState
        ));

        foreach (var entity in entities)
        {
            // FA:OFF - do nothing, PhysicsSystem handles raw controls
            if (!entity.flightAssist.Enabled)
            {
                continue;
            }

            // FA:ON - apply stabilization and limits
            ApplyFlightAssist(entity);
        }
    }

    private void ApplyFlightAssist(GameEntity entity)
    {
        var config = entity.shipConfig.Config;
        var limits = config.FlightAssistLimits;
        var velocity = entity.velocity;
        var control = entity.controlState;

        // Step 1: Apply linear speed limits in ship-local space
        ApplyLinearSpeedLimits(entity, limits);

        // Step 2: Apply angular velocity damping (auto-stabilization)
        ApplyAngularDamping(entity, config);

        // Step 3: Apply linear velocity damping when idle
        if (IsControlIdle(control))
        {
            ApplyLinearDamping(entity, limits);
        }
    }

    /// <summary>
    /// Limit linear speed to FA:ON maximums in ship-local space
    /// </summary>
    private void ApplyLinearSpeedLimits(GameEntity entity, Ships.FlightAssistLimits limits)
    {
        var velocity = entity.velocity;
        var transform = entity.transform2D;

        // Transform velocity to ship-local space
        var rotation = transform.Rotation;
        var cos = MathF.Cos(rotation);
        var sin = MathF.Sin(rotation);

        // Local velocity components (forward = +X in local, lateral = +Y in local)
        var localVelX = velocity.Linear.X * cos + velocity.Linear.Y * sin;
        var localVelY = -velocity.Linear.X * sin + velocity.Linear.Y * cos;

        // Apply speed limits
        var clampedForward = localVelX;
        var clampedLateral = localVelY;

        // Forward/reverse limits
        if (localVelX > 0)
        {
            clampedForward = MathF.Min(localVelX, limits.LinearSpeedMax_mps.Forward);
        }
        else
        {
            clampedForward = MathF.Max(localVelX, -limits.LinearSpeedMax_mps.Reverse);
        }

        // Lateral limits (symmetric)
        clampedLateral = MathF.Max(-limits.LinearSpeedMax_mps.Lateral, 
                                   MathF.Min(localVelY, limits.LinearSpeedMax_mps.Lateral));

        // If speed was clamped, apply gentle deceleration (within g-limits)
        if (MathF.Abs(clampedForward - localVelX) > 0.01f)
        {
            var maxDecel = limits.CrewGLimit.Linear_g * 9.81f; // m/s²
            var desiredChange = clampedForward - localVelX;
            var maxChange = maxDecel * _deltaTime;
            
            if (MathF.Abs(desiredChange) > maxChange)
            {
                clampedForward = localVelX + MathF.Sign(desiredChange) * maxChange;
            }
        }

        if (MathF.Abs(clampedLateral - localVelY) > 0.01f)
        {
            var maxDecel = limits.CrewGLimit.Linear_g * 9.81f;
            var desiredChange = clampedLateral - localVelY;
            var maxChange = maxDecel * _deltaTime;
            
            if (MathF.Abs(desiredChange) > maxChange)
            {
                clampedLateral = localVelY + MathF.Sign(desiredChange) * maxChange;
            }
        }

        // Transform back to world space
        var newVelX = clampedForward * cos - clampedLateral * sin;
        var newVelY = clampedForward * sin + clampedLateral * cos;

        entity.ReplaceVelocity(new Vector2(newVelX, newVelY), velocity.Angular);
    }

    /// <summary>
    /// Apply damping to angular velocity (auto-stabilization)
    /// Uses PD-controller to smoothly bring rotation to zero
    /// </summary>
    private void ApplyAngularDamping(GameEntity entity, Ships.ShipConfig config)
    {
        var velocity = entity.velocity;
        var control = entity.controlState;
        
        // Only damp if not actively yawing
        if (MathF.Abs(control.Yaw_Input) < 0.01f)
        {
            var angularAccel = config.Physics.AngularAcceleration_dps2.Yaw * MathF.PI / 180.0f; // deg/s² to rad/s²
            
            // Damping rate proportional to angular acceleration
            // Higher damping for faster-turning ships
            var dampingRate = 2.0f * angularAccel;
            
            // Exponential decay: ω_new = ω * exp(-k * dt)
            var dampingFactor = MathF.Exp(-dampingRate * _deltaTime);
            
            var newAngularVel = velocity.Angular * dampingFactor;
            entity.ReplaceVelocity(velocity.Linear, newAngularVel);
        }
    }

    /// <summary>
    /// Apply damping to linear velocity when idle (gentle braking)
    /// </summary>
    private void ApplyLinearDamping(GameEntity entity, Ships.FlightAssistLimits limits)
    {
        var velocity = entity.velocity;
        
        // Gentle damping: half of max deceleration
        var dampingAccel = limits.CrewGLimit.Linear_g * 9.81f * 0.5f; // m/s²
        var dampingRate = dampingAccel / (velocity.Linear.Magnitude + 0.1f); // Avoid division by zero
        
        // Exponential decay
        var dampingFactor = MathF.Exp(-dampingRate * _deltaTime);
        
        var newLinearVel = velocity.Linear * dampingFactor;
        entity.ReplaceVelocity(newLinearVel, velocity.Angular);
    }

    /// <summary>
    /// Check if controls are in idle state (no input)
    /// </summary>
    private bool IsControlIdle(Components.ControlStateComponent control)
    {
        return MathF.Abs(control.Thrust) < 0.01f &&
               MathF.Abs(control.Strafe_X) < 0.01f &&
               MathF.Abs(control.Yaw_Input) < 0.01f;
    }
}
