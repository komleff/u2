using Entitas;
using U2.Shared.Math;
using U2.Shared.Physics;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Physics integration system with relativistic corrections
/// Implements M1: Relativistic physics with γ-factor
/// </summary>
public class PhysicsSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private readonly float _speedOfLight_mps;
    private readonly float _deltaTime;
    private readonly float _maxVelocityRatio = 0.99f; // |v| < 0.99c'

    public PhysicsSystem(GameContext context, float speedOfLight_mps, float deltaTime = 1.0f / 60.0f)
    {
        _context = context;
        _speedOfLight_mps = speedOfLight_mps;
        _deltaTime = deltaTime;
    }

    public void Execute()
    {
        var entities = _context.GetEntities(GameMatcher.AllOf(
            GameMatcher.Transform2D,
            GameMatcher.Velocity,
            GameMatcher.Momentum,
            GameMatcher.Mass,
            GameMatcher.ControlState,
            GameMatcher.ShipConfig
        ));

        // Process entities in parallel for better performance with many entities
        if (entities.Length > 50)
        {
            System.Threading.Tasks.Parallel.For(0, entities.Length, i =>
            {
                var entity = entities[i];
                // Skip destroyed ships
                if (entity.hasHealth && entity.health.Current_HP <= 0)
                    return;

                IntegratePhysics(entity);
            });
        }
        else
        {
            // For small numbers, sequential is faster (no threading overhead)
            foreach (var entity in entities)
            {
                // Skip destroyed ships
                if (entity.hasHealth && entity.health.Current_HP <= 0)
                {
                    continue;
                }

                IntegratePhysics(entity);
            }
        }
    }

    private void IntegratePhysics(GameEntity entity)
    {
        var control = entity.controlState;
        var shipConfig = entity.shipConfig.Config;
        var mass = entity.mass;
        var momentum = entity.momentum;
        var velocity = entity.velocity;
        var transform = entity.transform2D;

        // Step 0: Sync momentum from velocity if momentum is zero but velocity is not
        // This handles cases where velocity is set directly (e.g., in tests)
        if (momentum.Linear.SqrMagnitude < 1e-6f && velocity.Linear.SqrMagnitude > 1e-6f)
        {
            var initialSpeed = velocity.Linear.Magnitude;
            var beta = RelativisticMath.CalculateBeta(initialSpeed, _speedOfLight_mps);
            var gamma = RelativisticMath.Gamma(beta);
            momentum.Linear = velocity.Linear * (gamma * mass.Mass_kg);
        }
        
        if (MathF.Abs(momentum.Angular) < 1e-6f && MathF.Abs(velocity.Angular) > 1e-6f)
        {
            momentum.Angular = velocity.Angular * mass.Inertia_kgm2;
        }

        // Step 1: Calculate forces from control inputs
        var force = CalculateForce(control, shipConfig, transform.Rotation);
        float torque = CalculateTorque(control, shipConfig);

        // Step 2: Integrate linear momentum: p += F⋅dt
        momentum.Linear += force * _deltaTime;

        // Step 3: Integrate angular momentum: L += τ⋅dt
        momentum.Angular += torque * _deltaTime;

        // Step 4: Convert linear momentum to velocity with relativistic correction
        // v = p / (γm)
        // We need to solve iteratively since γ depends on v
        velocity.Linear = MomentumToVelocity(momentum.Linear, mass.Mass_kg, _speedOfLight_mps);

        // Step 5: Clamp velocity to |v| < 0.99c'
        var speed = velocity.Linear.Magnitude;
        var maxSpeed = _speedOfLight_mps * _maxVelocityRatio;
        if (speed > maxSpeed)
        {
            velocity.Linear = velocity.Linear.Normalized * maxSpeed;
            // Also clamp momentum to match clamped velocity
            var beta = RelativisticMath.CalculateBeta(maxSpeed, _speedOfLight_mps);
            var gamma = RelativisticMath.Gamma(beta);
            momentum.Linear = velocity.Linear * (gamma * mass.Mass_kg);
        }

        // Step 6: Convert angular momentum to angular velocity
        // ω = L / I (non-relativistic for rotation)
        if (mass.Inertia_kgm2 > 0.0f)
        {
            velocity.Angular = momentum.Angular / mass.Inertia_kgm2;
        }

        // Step 7: Integrate position: x += v⋅dt
        transform.Position += velocity.Linear * _deltaTime;

        // Step 8: Integrate rotation: θ += ω⋅dt
        var newRotation = transform.Rotation + (velocity.Angular * _deltaTime);

        // Normalize rotation to [-π, π]
        newRotation = NormalizeAngle(newRotation);

        // Update components
        entity.ReplaceMomentum(momentum.Linear, momentum.Angular);
        entity.ReplaceVelocity(velocity.Linear, velocity.Angular);
        entity.ReplaceTransform2D(transform.Position, newRotation);
    }

    /// <summary>
    /// Calculate force from control inputs and ship configuration
    /// </summary>
    private Vector2 CalculateForce(Components.ControlStateComponent control, Ships.ShipConfig shipConfig, float rotation)
    {
        var physics = shipConfig.Physics;
        var mass_kg = shipConfig.Hull.DryMass_t * 1000.0f; // tonnes to kg

        // Linear force (forward/reverse)
        float forwardAccel = control.Thrust > 0
            ? physics.LinearAcceleration_mps2.Forward
            : MathF.Abs(physics.LinearAcceleration_mps2.Reverse);
        float thrustForce = control.Thrust * forwardAccel * mass_kg;

        // Strafe force (lateral)
        float strafeForce = control.Strafe_X * physics.StrafeAcceleration_mps2.Lateral * mass_kg;

        // Transform from local ship coordinates to world coordinates
        // Forward is along the rotation direction, strafe is perpendicular
        float cos = MathF.Cos(rotation);
        float sin = MathF.Sin(rotation);

        // Forward force in world coordinates (rotated by ship orientation)
        Vector2 forwardForceWorld = new Vector2(sin * thrustForce, cos * thrustForce);
        
        // Strafe force perpendicular to forward (rotated 90 degrees)
        Vector2 strafeForceWorld = new Vector2(cos * strafeForce, -sin * strafeForce);

        return forwardForceWorld + strafeForceWorld;
    }

    /// <summary>
    /// Calculate torque from yaw input and ship configuration
    /// </summary>
    private float CalculateTorque(Components.ControlStateComponent control, Ships.ShipConfig shipConfig)
    {
        var physics = shipConfig.Physics;
        var inertia_kgm2 = shipConfig.Hull.DryMass_t * 1000.0f * 
                           (shipConfig.Geometry.Length_m * shipConfig.Geometry.Length_m + 
                            shipConfig.Geometry.Width_m * shipConfig.Geometry.Width_m) / 12.0f;

        // Yaw torque (deg/s² to rad/s²)
        float yawAccel_rads2 = physics.AngularAcceleration_dps2.Yaw * MathF.PI / 180.0f;
        float torque = control.Yaw_Input * yawAccel_rads2 * inertia_kgm2;

        return torque;
    }

    /// <summary>
    /// Convert momentum to velocity using relativistic correction
    /// Solves: p = γmv for v
    /// Using Newton-Raphson iteration
    /// </summary>
    private Vector2 MomentumToVelocity(Vector2 momentum, float mass_kg, float c_prime)
    {
        if (momentum.SqrMagnitude < 1e-6f)
        {
            return Vector2.Zero;
        }

        // Initial guess: non-relativistic v = p/m
        float v_guess = momentum.Magnitude / mass_kg;

        // Newton-Raphson iteration to solve: p = γmv
        // f(v) = γ(v)mv - p = 0
        for (int i = 0; i < 5; i++)
        {
            float beta = RelativisticMath.CalculateBeta(v_guess, c_prime);
            float gamma = RelativisticMath.Gamma(beta);

            // Current error
            float p_calculated = gamma * mass_kg * v_guess;
            float error = p_calculated - momentum.Magnitude;

            if (MathF.Abs(error) < 1e-3f)
            {
                break; // Converged
            }

            // Derivative: d(γmv)/dv ≈ γm(1 + β²γ²)
            float derivative = gamma * mass_kg * (1.0f + beta * beta * gamma * gamma);

            // Newton step
            v_guess -= error / derivative;

            // Clamp to reasonable range
            v_guess = MathF.Max(0.0f, MathF.Min(v_guess, c_prime * 0.99f));
        }

        // Return velocity in same direction as momentum
        return momentum.Normalized * v_guess;
    }

    /// <summary>
    /// Normalize angle to [-π, π]
    /// </summary>
    private float NormalizeAngle(float angle)
    {
        while (angle > MathF.PI) angle -= 2.0f * MathF.PI;
        while (angle < -MathF.PI) angle += 2.0f * MathF.PI;
        return angle;
    }
}
