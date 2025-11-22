using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// M3.0 Flight Assist system.
/// FA:ON = speed limits + angular damping + linear damping when idle.
/// FA:OFF = raw physics (no limits or damping).
/// </summary>
public class FlightAssistSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private readonly float _deltaTime;

    public FlightAssistSystem(GameContext context, float deltaTime)
    {
        _context = context;
        _deltaTime = deltaTime;
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
            if (entity.flightAssist.Enabled)
            {
                ApplyFA_ON(entity);
            }
            // FA:OFF = no action, PhysicsSystem applies forces directly
        }
    }

    private void ApplyFA_ON(GameEntity entity)
    {
        var config = entity.shipConfig.Config;
        var limits = config.FlightAssistLimits;
        var velocity = entity.velocity;

        // 1. Linear speed limiting with G-limit respect
        var linearVel = velocity.Linear;
        var speed = linearVel.Magnitude;
        var maxSpeed = limits.LinearSpeedMax_mps.Forward; // For 2D, use forward speed limit

        if (speed > maxSpeed && speed > 0.01f)
        {
            var damping = CalculateSpeedDamping(speed, maxSpeed, limits.CrewGLimit.Linear_g);
            linearVel *= damping;
        }

        // 2. Angular velocity damping (rotation stabilization)
        var angularVel = velocity.Angular;
        if (MathF.Abs(angularVel) > 0.001f)
        {
            var angularDamping = CalculateAngularDamping(
                angularVel,
                config.Physics.AngularAcceleration_dps2.Yaw // Use yaw for 2D rotation
            );
            angularVel *= angularDamping;
        }

        // 3. Linear damping when controls are idle
        if (entity.hasControlState && IsControlIdle(entity))
        {
            var linearDamping = CalculateLinearDamping(limits.CrewGLimit.Linear_g);
            linearVel *= linearDamping;
        }

        entity.ReplaceVelocity(linearVel, angularVel);
    }

    /// <summary>
    /// Calculate damping factor to slow down when exceeding speed limit.
    /// Respects G-limit: braking force limited to CrewGLimit.Linear_g.
    /// </summary>
    private float CalculateSpeedDamping(float currentSpeed, float maxSpeed, float gLimit_g)
    {
        var excessSpeed = currentSpeed - maxSpeed;
        var maxDecel_mps2 = gLimit_g * 9.81f; // Convert G to m/s²
        var maxDecelThisTick = maxDecel_mps2 * _deltaTime;

        // Clamp decel to avoid overshoot
        var actualDecel = MathF.Min(excessSpeed, maxDecelThisTick);
        var newSpeed = currentSpeed - actualDecel;

        return newSpeed / currentSpeed; // Damping factor < 1.0
    }

    /// <summary>
    /// Calculate angular damping factor to stabilize rotation.
    /// Uses ship's angular acceleration to determine damping strength.
    /// </summary>
    private float CalculateAngularDamping(float angularVel_radps, float angularAccel_dps2)
    {
        var angularAccel_radps2 = angularAccel_dps2 * MathF.PI / 180f;
        var maxDampingThisTick = angularAccel_radps2 * _deltaTime;
        var absAngularVel = MathF.Abs(angularVel_radps);

        if (absAngularVel < maxDampingThisTick)
        {
            return 0f; // Full stop
        }

        var newAngularVel = absAngularVel - maxDampingThisTick;
        return newAngularVel / absAngularVel; // Damping factor < 1.0
    }

    /// <summary>
    /// Calculate linear damping when controls are idle (drift reduction).
    /// </summary>
    private float CalculateLinearDamping(float gLimit_g)
    {
        var dampingAccel_mps2 = gLimit_g * 9.81f * 0.5f; // 50% of G-limit for gentle damping
        var dampingThisTick = dampingAccel_mps2 * _deltaTime;

        // Simple exponential damping approximation
        return 1f - MathF.Min(dampingThisTick / 10f, 0.1f); // Max 10% reduction per tick
    }

    private static bool IsControlIdle(GameEntity entity)
    {
        var control = entity.controlState;
        return MathF.Abs(control.Thrust) < 0.01f &&
               MathF.Abs(control.Strafe_X) < 0.01f &&
               MathF.Abs(control.Strafe_Y) < 0.01f;
    }
}
