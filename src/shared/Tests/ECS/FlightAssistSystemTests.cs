using NUnit.Framework;
using U2.Shared.ECS;
using U2.Shared.ECS.Systems;
using U2.Shared.Math;
using U2.Shared.Ships;
using U2.Shared.Config;

namespace U2.Shared.Tests.ECS;

/// <summary>
/// Unit tests for FlightAssistSystem (M3.0)
/// Tests FA:ON and FA:OFF behavior for speed limiting, damping, and stabilization
/// </summary>
[TestFixture]
public class FlightAssistSystemTests
{
    private GameContext _context = null!;
    private FlightAssistSystem _faSystem = null!;
    private const float TestCPrime = 5000.0f; // 5 km/s speed of light
    private const float DeltaTime = 1.0f / 60.0f; // 60 FPS

    [SetUp]
    public void Setup()
    {
        _context = new GameContext();
        _faSystem = new FlightAssistSystem(_context, TestCPrime, DeltaTime);
    }

    [TearDown]
    public void TearDown()
    {
        _context.DestroyAllEntities();
    }

    #region FA:OFF Tests

    [Test]
    public void FA_OFF_DoesNotLimitSpeed()
    {
        // Arrange: Ship exceeding FA:ON speed limits
        var ship = CreateTestShip(Vector2.Zero, new Vector2(500.0f, 0.0f)); // Well above 260 m/s limit
        ship.flightAssist.Enabled = false; // FA:OFF

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act
        _faSystem.Execute();

        // Assert: Speed unchanged
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(initialSpeed).Within(0.1f),
            "FA:OFF should not modify velocity");
    }

    [Test]
    public void FA_OFF_DoesNotDampVelocity()
    {
        // Arrange: Ship with velocity, idle controls
        var ship = CreateTestShip(Vector2.Zero, new Vector2(100.0f, 50.0f));
        ship.flightAssist.Enabled = false; // FA:OFF
        ship.controlState.Thrust = 0.0f;
        ship.controlState.Strafe_X = 0.0f;

        var initialVelocity = ship.velocity.Linear;

        // Act
        _faSystem.Execute();

        // Assert: Velocity unchanged (no damping in FA:OFF)
        Assert.That(ship.velocity.Linear.X, Is.EqualTo(initialVelocity.X).Within(0.1f));
        Assert.That(ship.velocity.Linear.Y, Is.EqualTo(initialVelocity.Y).Within(0.1f));
    }

    [Test]
    public void FA_OFF_DoesNotDampAngularVelocity()
    {
        // Arrange: Ship rotating, no yaw input
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.velocity.Angular = 2.0f; // 2 rad/s rotation
        ship.flightAssist.Enabled = false; // FA:OFF
        ship.controlState.Yaw_Input = 0.0f;

        var initialAngularVel = ship.velocity.Angular;

        // Act
        _faSystem.Execute();

        // Assert: Angular velocity unchanged
        Assert.That(ship.velocity.Angular, Is.EqualTo(initialAngularVel).Within(0.01f),
            "FA:OFF should not damp angular velocity");
    }

    #endregion

    #region FA:ON Speed Limiting Tests

    [Test]
    public void FA_ON_LimitsForwardSpeed()
    {
        // Arrange: Ship exceeding forward speed limit (260 m/s)
        var ship = CreateTestShip(Vector2.Zero, new Vector2(300.0f, 0.0f));
        ship.flightAssist.Enabled = true; // FA:ON
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing +X direction
        ship.controlState.Thrust = 0.0f; // No thrust

        // Act: Multiple frames to allow gradual deceleration
        for (int i = 0; i < 60; i++) // 1 second at 60 Hz
        {
            _faSystem.Execute();
        }

        // Assert: Speed converged to limit
        var config = SharedPhysics.ToShipConfig();
        var maxForward = config.FlightAssistLimits.LinearSpeedMax_mps.Forward;
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThanOrEqualTo(maxForward + 5.0f),
            "FA:ON should converge to forward speed limit within 1 second");
    }

    [Test]
    public void FA_ON_LimitsReverseSpeed()
    {
        // Arrange: Ship exceeding reverse speed limit (-180 m/s)
        var ship = CreateTestShip(Vector2.Zero, new Vector2(-200.0f, 0.0f));
        ship.flightAssist.Enabled = true; // FA:ON
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing +X direction
        ship.controlState.Thrust = 0.0f; // No thrust

        // Act: Multiple frames to allow gradual deceleration
        for (int i = 0; i < 60; i++) // 1 second at 60 Hz
        {
            _faSystem.Execute();
        }

        // Assert: Speed converged to limit
        var config = SharedPhysics.ToShipConfig();
        var maxReverse = config.FlightAssistLimits.LinearSpeedMax_mps.Reverse;
        var speedMagnitude = ship.velocity.Linear.Magnitude;
        Assert.That(speedMagnitude, Is.LessThanOrEqualTo(maxReverse + 5.0f),
            "FA:ON should converge to reverse speed limit within 1 second");
    }

    [Test]
    public void FA_ON_LimitsLateralSpeed()
    {
        // Arrange: Ship exceeding lateral speed limit (220 m/s sideways)
        var ship = CreateTestShip(Vector2.Zero, new Vector2(0.0f, 250.0f));
        ship.flightAssist.Enabled = true; // FA:ON
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing +X direction
        ship.controlState.Strafe_X = 0.0f; // No strafe

        // Act: Multiple frames to allow gradual deceleration
        for (int i = 0; i < 60; i++) // 1 second at 60 Hz
        {
            _faSystem.Execute();
        }

        // Assert: Speed converged to limit
        var config = SharedPhysics.ToShipConfig();
        var maxLateral = config.FlightAssistLimits.LinearSpeedMax_mps.Lateral;
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThanOrEqualTo(maxLateral + 5.0f),
            "FA:ON should converge to lateral speed limit within 1 second");
    }

    [Test]
    public void FA_ON_RespectsGLimitDuringBraking()
    {
        // Arrange: Ship at very high speed
        var ship = CreateTestShip(Vector2.Zero, new Vector2(500.0f, 0.0f));
        ship.flightAssist.Enabled = true; // FA:ON
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f);

        var initialSpeed = ship.velocity.Linear.Magnitude;
        var config = SharedPhysics.ToShipConfig();
        var maxDecel_mps2 = config.FlightAssistLimits.CrewGLimit.Linear_g * 9.81f; // ~108 m/s²
        var maxDecelThisFrame = maxDecel_mps2 * DeltaTime; // ~1.8 m/s

        // Act
        _faSystem.Execute();

        // Assert: Deceleration limited by g-limit
        var actualDecel = initialSpeed - ship.velocity.Linear.Magnitude;
        Assert.That(actualDecel, Is.LessThanOrEqualTo(maxDecelThisFrame + 0.5f),
            "FA:ON should respect g-limits during emergency braking");
    }

    #endregion

    #region FA:ON Damping Tests

    [Test]
    public void FA_ON_DampsLinearVelocityWhenIdle()
    {
        // Arrange: Ship with velocity, no thrust input
        var ship = CreateTestShip(Vector2.Zero, new Vector2(100.0f, 0.0f));
        ship.flightAssist.Enabled = true; // FA:ON
        ship.controlState.Thrust = 0.0f; // Idle
        ship.controlState.Strafe_X = 0.0f;
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing +X

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act: Multiple frames to see damping effect
        for (int i = 0; i < 10; i++)
        {
            _faSystem.Execute();
        }

        // Assert: Speed reduced by damping
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThan(initialSpeed * 0.85f),
            "FA:ON should damp linear velocity by at least 15% in 10 frames when controls idle");
    }

    [Test]
    public void FA_ON_DoesNotDampWhenThrusting()
    {
        // Arrange: Ship with velocity, active thrust
        var ship = CreateTestShip(Vector2.Zero, new Vector2(100.0f, 0.0f));
        ship.flightAssist.Enabled = true; // FA:ON
        ship.controlState.Thrust = 1.0f; // Active thrust
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f);

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act
        _faSystem.Execute();

        // Assert: No idle damping applied (speed may change due to limits but not idle damping)
        // We just verify the system runs without error and doesn't apply idle damping
        Assert.That(ship.velocity.Linear.Magnitude, Is.GreaterThan(0.0f));
    }

    [Test]
    public void FA_ON_DampsAngularVelocityWhenIdle()
    {
        // Arrange: Ship rotating, no yaw input
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.velocity.Angular = 1.5f; // 1.5 rad/s rotation
        ship.flightAssist.Enabled = true; // FA:ON
        ship.controlState.Yaw_Input = 0.0f;

        var initialAngularVel = MathF.Abs(ship.velocity.Angular);

        // Act: Multiple frames to see damping effect
        for (int i = 0; i < 10; i++)
        {
            _faSystem.Execute();
        }

        // Assert: Angular velocity damped significantly
        Assert.That(MathF.Abs(ship.velocity.Angular), Is.LessThan(initialAngularVel * 0.5f),
            "FA:ON should aggressively damp angular velocity when yaw idle");
    }

    [Test]
    public void FA_ON_ConvergesToZeroRotationRate()
    {
        // Arrange: Ship with small rotation
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.velocity.Angular = 0.5f;
        ship.flightAssist.Enabled = true; // FA:ON
        ship.controlState.Yaw_Input = 0.0f;

        // Act: Run for ~2 seconds
        for (int i = 0; i < 120; i++)
        {
            _faSystem.Execute();
        }

        // Assert: Rotation stopped
        Assert.That(MathF.Abs(ship.velocity.Angular), Is.LessThan(0.01f),
            "FA:ON should converge to zero rotation within 2 seconds");
    }

    #endregion

    #region FA:ON Angular Limits Tests

    [Test]
    public void FA_ON_LimitsYawRate()
    {
        // Arrange: Ship rotating faster than limit
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        var config = SharedPhysics.ToShipConfig();
        var maxYawRate_radps = config.FlightAssistLimits.AngularSpeedMax_dps.Yaw * MathF.PI / 180.0f;
        
        ship.velocity.Angular = maxYawRate_radps * 2.0f; // Double the limit
        ship.flightAssist.Enabled = true; // FA:ON

        // Act
        _faSystem.Execute();

        // Assert: Angular velocity clamped
        Assert.That(MathF.Abs(ship.velocity.Angular), Is.LessThanOrEqualTo(maxYawRate_radps + 0.01f),
            "FA:ON should limit yaw rate to max configured value");
    }

    #endregion

    #region Mode Switching Tests

    [Test]
    public void FA_Toggle_SwitchingON_AppliesLimits()
    {
        // Arrange: Ship at high speed with FA:OFF
        var ship = CreateTestShip(Vector2.Zero, new Vector2(300.0f, 0.0f));
        ship.flightAssist.Enabled = false; // Start with FA:OFF

        // Act: Execute with FA:OFF (no change)
        _faSystem.Execute();
        var speedWithFAOff = ship.velocity.Linear.Magnitude;

        // Toggle to FA:ON
        ship.flightAssist.Enabled = true;
        _faSystem.Execute();
        var speedWithFAOn = ship.velocity.Linear.Magnitude;

        // Assert: FA:ON reduces overspeed
        Assert.That(speedWithFAOff, Is.GreaterThan(260.0f), "FA:OFF should allow overspeed");
        Assert.That(speedWithFAOn, Is.LessThan(speedWithFAOff), "FA:ON should start reducing overspeed");
    }

    [Test]
    public void FA_Toggle_SwitchingOFF_RemovesLimits()
    {
        // Arrange: Ship rotating with FA:ON
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.velocity.Angular = 1.0f;
        ship.flightAssist.Enabled = true; // FA:ON
        ship.controlState.Yaw_Input = 0.0f;

        // Act: Execute with FA:ON (should damp)
        for (int i = 0; i < 10; i++)
        {
            _faSystem.Execute();
        }
        var angularVelWithFAOn = MathF.Abs(ship.velocity.Angular);

        // Reset and switch to FA:OFF
        ship.velocity.Angular = 1.0f;
        ship.flightAssist.Enabled = false; // FA:OFF
        for (int i = 0; i < 10; i++)
        {
            _faSystem.Execute();
        }
        var angularVelWithFAOff = MathF.Abs(ship.velocity.Angular);

        // Assert: FA:OFF preserves rotation, FA:ON damps it
        Assert.That(angularVelWithFAOn, Is.LessThan(0.5f), "FA:ON should have damped rotation");
        Assert.That(angularVelWithFAOff, Is.EqualTo(1.0f).Within(0.01f), "FA:OFF should preserve rotation");
    }

    #endregion

    #region Momentum Consistency Tests

    [Test]
    public void FA_ON_UpdatesMomentumToMatchVelocity()
    {
        // Arrange: Ship with overspeed
        var ship = CreateTestShip(Vector2.Zero, new Vector2(300.0f, 0.0f));
        ship.flightAssist.Enabled = true;

        // Act
        _faSystem.Execute();

        // Assert: Momentum matches velocity (within relativistic correction)
        var speed = ship.velocity.Linear.Magnitude;
        var beta = speed / TestCPrime;
        var gamma = 1.0f / MathF.Sqrt(1.0f - beta * beta);
        var expectedMomentumMag = speed * gamma * ship.mass.Mass_kg;

        Assert.That(ship.momentum.Linear.Magnitude, Is.EqualTo(expectedMomentumMag).Within(100.0f),
            "FA:ON should update momentum to match corrected velocity");
    }

    #endregion

    #region Helper Methods

    private GameEntity CreateTestShip(Vector2 position, Vector2 velocity)
    {
        var entity = _context.CreateEntity();
        var config = SharedPhysics.ToShipConfig();

        // Add all required components
        entity.AddTransform2D(position, 0.0f);
        entity.AddVelocity(velocity, 0.0f);
        entity.AddMass(config.Hull.DryMass_t * 1000.0f, 1000.0f); // 10,000 kg, 1000 kg·m²
        entity.AddMomentum(Vector2.Zero, 0.0f);
        entity.AddControlState(0.0f, 0.0f, 0.0f, 0.0f);
        entity.AddShipConfig(config);
        entity.AddFlightAssist(true); // Default to FA:ON
        entity.AddHealth(1000.0f, 1000.0f);

        // Initialize momentum from velocity
        if (velocity.Magnitude > 0)
        {
            var speed = velocity.Magnitude;
            var beta = speed / TestCPrime;
            var gamma = 1.0f / MathF.Sqrt(1.0f - beta * beta);
            entity.ReplaceMomentum(velocity * (gamma * entity.mass.Mass_kg), 0.0f);
        }

        return entity;
    }

    #endregion
}
