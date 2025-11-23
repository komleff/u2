using Entitas;
using U2.Shared.Math;
using U2.Shared.Ships;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Flight Assist: корректирует ввод в рамках ТТХ и g-limit, не телепортирует скорость.
/// FA:ON ограничивает ввод и добавляет автотягу/торможение; FA:OFF передает ввод как есть.
/// Brake (SPACE) гасит линейные/угловые скорости, используя реальные thruster/torque.
/// </summary>
public class FlightAssistSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private readonly float _deltaTime;

    public FlightAssistSystem(GameContext context, float speedOfLight_mps = 5000.0f, float deltaTime = 1.0f / 60.0f)
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
            GameMatcher.ShipConfig,
            GameMatcher.Transform2D
        ));

        foreach (var entity in entities)
        {
            var control = entity.controlState;

            // Clamp raw input
            var thrustInput = Clamp01(control.Thrust);
            var strafeXInput = Clamp01(control.Strafe_X);
            var strafeYInput = Clamp01(control.Strafe_Y);
            var yawInput = Clamp01(control.Yaw_Input);
            var brakeActive = control.Brake;

            var config = entity.shipConfig.Config;
            var limits = config.FlightAssistLimits;
            var physics = config.Physics;

            // Transform velocity to ship-local space
            var rotation = entity.transform2D.Rotation;
            var cos = MathF.Cos(rotation);
            var sin = MathF.Sin(rotation);
            var localVelX = entity.velocity.Linear.X * cos + entity.velocity.Linear.Y * sin;
            var localVelY = -entity.velocity.Linear.X * sin + entity.velocity.Linear.Y * cos;

            // If FA is off and brake is not active, pass input through (clamped to [-1,1])
            if (!entity.flightAssist.Enabled && !brakeActive)
            {
                entity.ReplaceControlState(thrustInput, strafeXInput, strafeYInput, yawInput, brakeActive);
                continue;
            }

            // Available accelerations (respect g-limit)
            var gLimitAccel = limits.CrewGLimit.Linear_g * 9.81f;
            var forwardAccel = physics.LinearAcceleration_mps2.Forward;
            var reverseAccel = MathF.Abs(physics.LinearAcceleration_mps2.Reverse);
            var strafeAccel = physics.StrafeAcceleration_mps2.Lateral;

            var maxForwardInput = forwardAccel > 0 ? MathF.Min(1f, gLimitAccel / forwardAccel) : 0f;
            var maxReverseInput = reverseAccel > 0 ? MathF.Min(1f, gLimitAccel / reverseAccel) : 0f;
            var maxStrafeInput = strafeAccel > 0 ? MathF.Min(1f, gLimitAccel / strafeAccel) : 0f;

            thrustInput = thrustInput > 0
                ? MathF.Min(thrustInput, maxForwardInput)
                : MathF.Max(thrustInput, -maxReverseInput);
            strafeXInput = MathF.Max(-maxStrafeInput, MathF.Min(strafeXInput, maxStrafeInput));

            var angularAccel = physics.AngularAcceleration_dps2.Yaw * MathF.PI / 180.0f;
            var maxYawRate = limits.AngularSpeedMax_dps.Yaw * MathF.PI / 180.0f;

            if (brakeActive)
            {
                // Full brake: drive speeds toward zero within thrust/torque limits
                thrustInput = ComputeBrakeInput(localVelX, forwardAccel, reverseAccel, maxForwardInput, maxReverseInput);
                strafeXInput = ComputeBrakeInput(localVelY, strafeAccel, strafeAccel, maxStrafeInput, maxStrafeInput);
                yawInput = ComputeYawDamping(entity.velocity.Angular, angularAccel, true);
            }
            else
            {
                // FA: enforce speed limits and damp when idle (no user input)
                var isIdle = IsControlIdle(control);

                thrustInput = ApplyAxisAssist(
                    localVelX,
                    limits.LinearSpeedMax_mps.Forward,
                    limits.LinearSpeedMax_mps.Reverse,
                    thrustInput,
                    forwardAccel,
                    reverseAccel,
                    maxForwardInput,
                    maxReverseInput,
                    isIdle);

                strafeXInput = ApplyAxisAssist(
                    localVelY,
                    limits.LinearSpeedMax_mps.Lateral,
                    limits.LinearSpeedMax_mps.Lateral,
                    strafeXInput,
                    strafeAccel,
                    strafeAccel,
                    maxStrafeInput,
                    maxStrafeInput,
                    isIdle);

                yawInput = ApplyYawAssist(entity.velocity.Angular, yawInput, angularAccel, maxYawRate);
            }

            entity.ReplaceControlState(thrustInput, strafeXInput, strafeYInput, yawInput, brakeActive);
        }
    }

    private float ApplyAxisAssist(
        float velocity,
        float posLimit,
        float negLimit,
        float userInput,
        float posAccel,
        float negAccel,
        float maxPosInput,
        float maxNegInput,
        bool dampWhenIdle)
    {
        const float epsilon = 0.01f;

        // Above forward limit -> brake with reverse thrusters
        if (velocity > posLimit + epsilon && negAccel > 0)
        {
            return -ComputeDecelInput(velocity - posLimit, negAccel, maxNegInput);
        }

        // Above reverse limit -> brake with forward thrusters
        if (velocity < -negLimit - epsilon && posAccel > 0)
        {
            return ComputeDecelInput((-negLimit) - velocity, posAccel, maxPosInput);
        }

        // Idle damping: gently drive toward zero using available thrust
        if (dampWhenIdle && MathF.Abs(velocity) > epsilon)
        {
            if (velocity > 0 && negAccel > 0)
            {
                return -ComputeDecelInput(velocity, negAccel, maxNegInput);
            }
            if (velocity < 0 && posAccel > 0)
            {
                return ComputeDecelInput(-velocity, posAccel, maxPosInput);
            }
        }

        // Within limits, return user intent (already clamped to max inputs)
        return userInput;
    }

    private float ComputeBrakeInput(float velocity, float posAccel, float negAccel, float maxPosInput, float maxNegInput)
    {
        const float epsilon = 0.01f;
        if (MathF.Abs(velocity) < epsilon)
        {
            return 0f;
        }

        if (velocity > 0 && negAccel > 0)
        {
            return -ComputeDecelInput(velocity, negAccel, maxNegInput);
        }

        if (velocity < 0 && posAccel > 0)
        {
            return ComputeDecelInput(-velocity, posAccel, maxPosInput);
        }

        return 0f;
    }

    private float ComputeDecelInput(float deltaSpeed, float accel, float maxInput)
    {
        if (accel <= 0 || maxInput <= 0) return 0f;
        var desiredAccel = deltaSpeed / _deltaTime;
        var input = desiredAccel / accel;
        return MathF.Min(maxInput, MathF.Max(0f, input));
    }

    private float ApplyYawAssist(float angularVelocity, float userYaw, float angularAccel, float maxYawRate)
    {
        const float epsilon = 0.001f;

        var yaw = Clamp01(userYaw);

        // Enforce max yaw rate
        if (MathF.Abs(angularVelocity) > maxYawRate + epsilon)
        {
            return -ComputeYawCorrection(MathF.Abs(angularVelocity) - maxYawRate, angularVelocity, angularAccel);
        }

        // No user yaw -> auto-damp
        if (MathF.Abs(userYaw) < 0.01f)
        {
            return ComputeYawDamping(angularVelocity, angularAccel, false);
        }

        return yaw;
    }

    private float ComputeYawCorrection(float deltaRate, float currentAngular, float angularAccel)
    {
        if (angularAccel <= 0) return 0f;
        var desiredAccel = deltaRate / _deltaTime;
        var input = desiredAccel / angularAccel;
        input = MathF.Min(1f, MathF.Max(0f, input));
        return -MathF.Sign(currentAngular) * input;
    }

    private float ComputeYawDamping(float angularVelocity, float angularAccel, bool forceBrake)
    {
        if (angularAccel <= 0) return 0f;
        if (!forceBrake && MathF.Abs(angularVelocity) < 0.001f) return 0f;

        var desiredAccel = MathF.Abs(angularVelocity) / _deltaTime;
        var input = desiredAccel / angularAccel;
        input = MathF.Min(1f, MathF.Max(0f, input));
        return -MathF.Sign(angularVelocity) * input;
    }

    private static bool IsControlIdle(Components.ControlStateComponent control)
    {
        return MathF.Abs(control.Thrust) < 0.01f &&
               MathF.Abs(control.Strafe_X) < 0.01f &&
               MathF.Abs(control.Yaw_Input) < 0.01f;
    }

    private static float Clamp01(float value)
    {
        if (value > 1f) return 1f;
        if (value < -1f) return -1f;
        return value;
    }
}
