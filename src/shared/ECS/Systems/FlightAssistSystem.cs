using Entitas;
using U2.Shared.Math;
using U2.Shared.Ships;
using U2.Shared.Physics;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// M3 Flight Assist system.
/// FA:ON = clamp inputs, enforce speed/angle limits with g-based damping.
/// FA:OFF = raw physics (без демпфинга).
/// </summary>
public class FlightAssistSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private readonly float _speedOfLight_mps;
    private readonly float _deltaTime;

    public FlightAssistSystem(GameContext context, float speedOfLight_mps = 5000.0f, float deltaTime = 1.0f / 60.0f)
    {
        _context = context;
        _speedOfLight_mps = speedOfLight_mps;
        _deltaTime = deltaTime;
    }

    public void Execute()
    {
        var entities = _context.GetEntities(GameMatcher.AllOf(
            GameMatcher.ControlState,
            GameMatcher.FlightAssist,
            GameMatcher.Velocity,
            GameMatcher.Momentum,
            GameMatcher.Mass,
            GameMatcher.ShipConfig,
            GameMatcher.Transform2D
        ));

        foreach (var entity in entities)
        {
            // Clamp входных значений (всегда, даже при FA:OFF)
            var control = entity.controlState;
            var clampedThrust = Clamp01(control.Thrust);
            var clampedStrafeX = Clamp01(control.Strafe_X);
            var clampedStrafeY = Clamp01(control.Strafe_Y);
            var clampedYaw = Clamp01(control.Yaw_Input);
            entity.ReplaceControlState(clampedThrust, clampedStrafeX, clampedStrafeY, clampedYaw);

            if (!entity.flightAssist.Enabled)
            {
                continue; // FA:OFF → без демпфинга; PhysicsSystem обрабатывает движение
            }

            // FA:ON - apply stabilization and limits
            var limits = entity.shipConfig.Config.FlightAssistLimits;
            
            // Step 1: Apply linear speed limits in ship-local space
            ApplyLinearSpeedLimits(entity, limits);

            // Step 2: Apply angular velocity damping (auto-stabilization)
            ApplyAngularDamping(entity);

            // Step 3: Apply linear velocity damping when idle
            if (IsControlIdle(entity.controlState))
            {
                ApplyLinearDamping(entity, limits);
            }
        }
    }

    /// <summary>
    /// Sync momentum to match the modified velocity.
    /// Required because PhysicsSystem integrates momentum, not velocity.
    /// </summary>
    private void SyncMomentum(GameEntity entity)
    {
        var velocity = entity.velocity;
        var mass = entity.mass;
        
        // Linear Momentum: p = γmv
        var speed = velocity.Linear.Magnitude;
        var beta = RelativisticMath.CalculateBeta(speed, _speedOfLight_mps);
        var gamma = RelativisticMath.Gamma(beta);
        var linearMomentum = velocity.Linear * (gamma * mass.Mass_kg);

        // Angular Momentum: L = Iω (non-relativistic rotation)
        var angularMomentum = velocity.Angular * mass.Inertia_kgm2;

        entity.ReplaceMomentum(linearMomentum, angularMomentum);
    }

    /// <summary>
    /// Limit linear speed to FA:ON maximums in ship-local space
    /// Applies soft deceleration limited by G-limits
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
        SyncMomentum(entity);
    }

    /// <summary>
    /// Apply damping to angular velocity (auto-stabilization) and enforce speed limits
    /// </summary>
    private void ApplyAngularDamping(GameEntity entity)
    {
        var velocity = entity.velocity;
        var control = entity.controlState;
        var limits = entity.shipConfig.Config.FlightAssistLimits;
        
        // Step 1: Apply angular speed limits (clamp to AngularSpeedMax)
        var maxAngularSpeed_rps = limits.AngularSpeedMax_dps.Yaw * MathF.PI / 180.0f;
        var clampedAngular = velocity.Angular;
        
        if (MathF.Abs(clampedAngular) > maxAngularSpeed_rps)
        {
            clampedAngular = MathF.Sign(clampedAngular) * maxAngularSpeed_rps;
        }
        
        // Step 2: Apply soft deceleration if speed was limited (within g-limits)
        if (MathF.Abs(clampedAngular - velocity.Angular) > 0.001f)
        {
            var config = entity.shipConfig.Config;
            var maxAngularAccel = config.Physics.AngularAcceleration_dps2.Yaw * MathF.PI / 180.0f;
            var maxDecel = limits.CrewGLimit.Linear_g * 9.81f;
            var desiredChange = clampedAngular - velocity.Angular;
            var maxChange = (maxDecel / 0.5f) * _deltaTime; // Scale to angular domain
            
            if (MathF.Abs(desiredChange) > maxChange)
            {
                clampedAngular = velocity.Angular + MathF.Sign(desiredChange) * maxChange;
            }
        }

        // Step 3: Damp when not actively yawing
        if (MathF.Abs(control.Yaw_Input) < 0.01f)
        {
            var config = entity.shipConfig.Config;
            var angularAccel = config.Physics.AngularAcceleration_dps2.Yaw * MathF.PI / 180.0f;
            
            // Damping rate proportional to angular acceleration
            var dampingRate = 2.0f * angularAccel;

            // Exponential decay
            var dampingFactor = MathF.Exp(-dampingRate * _deltaTime);

            clampedAngular = clampedAngular * dampingFactor;
        }

        entity.ReplaceVelocity(velocity.Linear, clampedAngular);
        SyncMomentum(entity);
    }

    /// <summary>
    /// Apply active braking to linear velocity when idle
    /// Uses thrusters to stop the ship, limited by G-force
    /// </summary>
    private void ApplyLinearDamping(GameEntity entity, Ships.FlightAssistLimits limits)
    {
        var velocity = entity.velocity;
        var transform = entity.transform2D;
        var config = entity.shipConfig.Config.Physics;

        // Transform velocity to ship-local space
        var rotation = transform.Rotation;
        var cos = MathF.Cos(rotation);
        var sin = MathF.Sin(rotation);

        // Local velocity components (forward = +X, lateral = +Y)
        var localVelX = velocity.Linear.X * cos + velocity.Linear.Y * sin;
        var localVelY = -velocity.Linear.X * sin + velocity.Linear.Y * cos;

        var maxDecel = limits.CrewGLimit.Linear_g * 9.81f; // m/s²

        // 1. Longitudinal Braking (Forward/Reverse)
        if (MathF.Abs(localVelX) > 0.01f)
        {
            bool isMovingForward = localVelX > 0;
            // Use Reverse thrusters to stop forward motion, Forward thrusters to stop reverse motion
            var reverseAccel = MathF.Abs(config.LinearAcceleration_mps2.Reverse);
            var thrusterAccel = isMovingForward ? reverseAccel : config.LinearAcceleration_mps2.Forward;
            
            // Limit braking by G-force
            var brakingAccel = MathF.Min(thrusterAccel, maxDecel);
            var deltaV = brakingAccel * _deltaTime;

            if (MathF.Abs(localVelX) > deltaV)
            {
                localVelX -= MathF.Sign(localVelX) * deltaV;
            }
            else
            {
                localVelX = 0;
            }
        }

        // 2. Lateral Braking (Strafe)
        if (MathF.Abs(localVelY) > 0.01f)
        {
            var thrusterAccel = config.StrafeAcceleration_mps2.Lateral;
            
            // Limit braking by G-force
            var brakingAccel = MathF.Min(thrusterAccel, maxDecel);
            var deltaV = brakingAccel * _deltaTime;

            if (MathF.Abs(localVelY) > deltaV)
            {
                localVelY -= MathF.Sign(localVelY) * deltaV;
            }
            else
            {
                localVelY = 0;
            }
        }

        // Transform back to world space
        var newVelX = localVelX * cos - localVelY * sin;
        var newVelY = localVelX * sin + localVelY * cos;

        entity.ReplaceVelocity(new Vector2(newVelX, newVelY), velocity.Angular);
        SyncMomentum(entity);
    }

    /// <summary>
    /// Check if controls are in idle state (no input)
    /// </summary>
    private static bool IsControlIdle(Components.ControlStateComponent control)
    {
        return MathF.Abs(control.Thrust) < 0.01f &&
               MathF.Abs(control.Strafe_X) < 0.01f &&
               MathF.Abs(control.Yaw_Input) < 0.01f;
    }

    private static float DegToRad(float degrees) => degrees * (MathF.PI / 180f);

    private static float Clamp01(float value)
    {
        if (value > 1f) return 1f;
        if (value < -1f) return -1f;
        return value;
    }

    private static float Clamp(float value, float min, float max)
    {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }
}
