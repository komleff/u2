using Entitas;
using U2.Shared.Math;
using U2.Shared.Ships;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// M3 Flight Assist system.
/// FA:ON = clamp inputs, enforce speed/angle limits with g-based damping.
/// FA:OFF = raw physics (без демпфинга).
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
            GameMatcher.ControlState,
            GameMatcher.FlightAssist,
            GameMatcher.Velocity,
            GameMatcher.ShipConfig
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

            var limits = entity.shipConfig.Config.FlightAssistLimits;
            var velocity = entity.velocity;
            var linear = velocity.Linear;
            var angular = velocity.Angular;

            // Ограничение линейной скорости по осям (2D: X=lat, Y=fwd/rev)
            linear.X = Clamp(linear.X, -limits.LinearSpeedMax_mps.Lateral, limits.LinearSpeedMax_mps.Lateral);
            linear.Y = Clamp(linear.Y, -limits.LinearSpeedMax_mps.Reverse, limits.LinearSpeedMax_mps.Forward);

            // Дэмпинг при превышении общего лимита скорости (учитывает G-limit)
            var speed = MathF.Sqrt(linear.X * linear.X + linear.Y * linear.Y);
            var maxSpeed = MaxLinearLimit(limits.LinearSpeedMax_mps);
            if (speed > maxSpeed && speed > 0.01f)
            {
                var damping = SpeedDamping(speed, maxSpeed, limits.CrewGLimit.Linear_g);
                linear *= damping;
            }

            // Ограничение угловой скорости (в 2D используем yaw)
            var maxYawRad = DegToRad(limits.AngularSpeedMax_dps.Yaw);
            if (maxYawRad > 0.0f && MathF.Abs(angular) > maxYawRad)
            {
                var damping = SpeedDamping(MathF.Abs(angular), maxYawRad, limits.CrewGLimit.Linear_g);
                angular = MathF.Sign(angular) * MathF.Abs(angular) * damping;
            }

            // Лёгкий дэмпинг дрейфа при отсутствии ввода
            if (IsIdle(clampedThrust, clampedStrafeX, clampedStrafeY))
            {
                linear *= 0.98f;
            }

            entity.ReplaceVelocity(linear, angular);
        }
    }

    private static float MaxLinearLimit(LinearSpeedMax limits)
    {
        return MathF.Max(MathF.Max(limits.Forward, limits.Reverse), limits.Lateral);
    }

    private float SpeedDamping(float value, float limit, float maxAccel_g)
    {
        var overspeed = value - limit;
        var maxDecel = maxAccel_g * 9.81f;
        var dampingRate = MathF.Min(overspeed / _deltaTime, maxDecel) / value;
        return MathF.Exp(-dampingRate * _deltaTime);
    }

    private static float DegToRad(float degrees) => degrees * (MathF.PI / 180f);

    private static bool IsIdle(float thrust, float strafeX, float strafeY)
    {
        return MathF.Abs(thrust) < 0.01f &&
               MathF.Abs(strafeX) < 0.01f &&
               MathF.Abs(strafeY) < 0.01f;
    }

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
