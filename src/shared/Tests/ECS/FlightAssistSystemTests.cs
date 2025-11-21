using NUnit.Framework;
using U2.Shared.ECS;
using U2.Shared.ECS.Systems;
using U2.Shared.Math;
using U2.Shared.Ships;
using U2.Shared.Config;

namespace U2.Shared.Tests.ECS;

/// <summary>
/// Tests for M3.0 Flight Assist system
/// </summary>
[TestFixture]
public class FlightAssistSystemTests
{
    private GameContext _context = null!;
    private FlightAssistSystem _system = null!;
    private const float DeltaTime = 1.0f / 60.0f; // 60 FPS

    [SetUp]
    public void Setup()
    {
        _context = new GameContext();
        _system = new FlightAssistSystem(_context, DeltaTime);
    }

    [TearDown]
    public void TearDown()
    {
        _context.DestroyAllEntities();
    }

    [Test]
    public void Execute_FA_OFF_DoesNotModifyVelocity()
    {
        // Arrange: Ship with FA:OFF exceeding speed limit
        var config = SharedPhysics.ToShipConfig();
        var ship = CreateTestShip(config, Vector2.Zero, Vector2.Right * 300.0f); // Exceeds forward limit (260 m/s)
        ship.ReplaceFlightAssist(false); // FA:OFF
        
        var initialVelocity = ship.velocity.Linear;
        var initialSpeed = initialVelocity.Magnitude;

        // Act
        _system.Execute();

        // Assert: FA:OFF should not limit or dampen velocity
        Assert.That(ship.velocity.Linear.X, Is.EqualTo(initialVelocity.X).Within(0.01f));
        Assert.That(ship.velocity.Linear.Y, Is.EqualTo(initialVelocity.Y).Within(0.01f));
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(initialSpeed).Within(0.01f));
    }

    [Test]
    public void Execute_FA_ON_LimitsLinearSpeed()
    {
        // Arrange: Ship with FA:ON exceeding forward speed limit
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward; // 260 m/s
        var ship = CreateTestShip(config, Vector2.Zero, Vector2.Right * 300.0f); // Exceeds limit
        ship.ReplaceFlightAssist(true); // FA:ON
        ship.controlState.Thrust = 1.0f; // Forward thrust

        // Act: Execute multiple frames to allow damping
        for (int i = 0; i < 120; i++) // 2 seconds at 60 FPS
        {
            _system.Execute();
        }

        // Assert: Speed should be reduced to or below limit
        var finalSpeed = ship.velocity.Linear.Magnitude;
        Assert.That(finalSpeed, Is.LessThanOrEqualTo(maxSpeed * 1.01f)); // Allow 1% tolerance
    }

    [Test]
    public void Execute_FA_ON_DampensAngularVelocity()
    {
        // Arrange: Ship with FA:ON and high angular velocity
        var config = SharedPhysics.ToShipConfig();
        var ship = CreateTestShip(config, Vector2.Zero, Vector2.Zero);
        ship.ReplaceFlightAssist(true); // FA:ON
        ship.ReplaceVelocity(Vector2.Zero, 2.0f); // 2 rad/s angular velocity
        ship.controlState.Yaw_Input = 0.0f; // No yaw input

        var initialAngularVel = ship.velocity.Angular;

        // Act: Execute multiple frames
        for (int i = 0; i < 60; i++) // 1 second at 60 FPS
        {
            _system.Execute();
        }

        // Assert: Angular velocity should be significantly reduced
        var finalAngularVel = ship.velocity.Angular;
        Assert.That(MathF.Abs(finalAngularVel), Is.LessThan(MathF.Abs(initialAngularVel) * 0.5f));
    }

    [Test]
    public void Execute_FA_ON_AppliesDampingOnIdle()
    {
        // Arrange: Ship with FA:ON, moving but no control input
        var config = SharedPhysics.ToShipConfig();
        var ship = CreateTestShip(config, Vector2.Zero, Vector2.Right * 100.0f);
        ship.ReplaceFlightAssist(true); // FA:ON
        ship.controlState.Thrust = 0.0f; // Idle
        ship.controlState.Strafe_X = 0.0f;
        ship.controlState.Yaw_Input = 0.0f;

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act: Execute multiple frames
        for (int i = 0; i < 60; i++) // 1 second at 60 FPS
        {
            _system.Execute();
        }

        // Assert: Speed should be reduced (auto-brake)
        var finalSpeed = ship.velocity.Linear.Magnitude;
        Assert.That(finalSpeed, Is.LessThan(initialSpeed * 0.9f)); // At least 10% reduction
    }

    [Test]
    public void Execute_FA_ON_ToFA_OFF_StopsApplyingLimits()
    {
        // Arrange: Ship with FA:ON, then switch to FA:OFF
        var config = SharedPhysics.ToShipConfig();
        var ship = CreateTestShip(config, Vector2.Zero, Vector2.Right * 100.0f);
        ship.ReplaceFlightAssist(true); // FA:ON
        ship.controlState.Thrust = 0.0f; // Idle to trigger damping

        // Act: FA:ON for 30 frames
        for (int i = 0; i < 30; i++)
        {
            _system.Execute();
        }
        var speedAfterFA_ON = ship.velocity.Linear.Magnitude;

        // Switch to FA:OFF
        ship.ReplaceFlightAssist(false);
        
        // Act: FA:OFF for 30 frames
        for (int i = 0; i < 30; i++)
        {
            _system.Execute();
        }
        var speedAfterFA_OFF = ship.velocity.Linear.Magnitude;

        // Assert: Speed should not decrease further with FA:OFF (no damping)
        Assert.That(speedAfterFA_OFF, Is.GreaterThanOrEqualTo(speedAfterFA_ON * 0.99f)); // Allow minor float precision
    }

    [Test]
    public void Execute_FA_ON_RespectsCrewGLimit()
    {
        // Arrange: Ship with FA:ON, far exceeding speed limit
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward;
        var ship = CreateTestShip(config, Vector2.Zero, Vector2.Right * 500.0f); // Way over limit
        ship.ReplaceFlightAssist(true);
        ship.controlState.Thrust = 1.0f;

        var initialSpeed = ship.velocity.Linear.Magnitude;
        var crewGLimit = config.FlightAssistLimits.CrewGLimit.Linear_g;
        var maxDecel_mps2 = crewGLimit * 9.81f;

        // Act: Single frame
        _system.Execute();

        // Assert: Deceleration should not exceed crew g-limit
        var finalSpeed = ship.velocity.Linear.Magnitude;
        var actualDecel = (initialSpeed - finalSpeed) / DeltaTime;
        Assert.That(actualDecel, Is.LessThanOrEqualTo(maxDecel_mps2 * 1.01f)); // Allow 1% tolerance
    }

    [Test]
    public void Execute_FA_ON_StrafingUsesLateralLimit()
    {
        // Arrange: Ship with FA:ON, strafing beyond lateral limit
        var config = SharedPhysics.ToShipConfig();
        var lateralLimit = config.FlightAssistLimits.LinearSpeedMax_mps.Lateral; // 220 m/s
        var ship = CreateTestShip(config, Vector2.Zero, Vector2.Up * 250.0f); // Exceeds lateral limit
        ship.ReplaceFlightAssist(true);
        ship.controlState.Strafe_X = 1.0f; // Strafing
        ship.controlState.Thrust = 0.0f; // No forward thrust

        // Act: Execute multiple frames
        for (int i = 0; i < 120; i++)
        {
            _system.Execute();
        }

        // Assert: Speed should be reduced to lateral limit
        var finalSpeed = ship.velocity.Linear.Magnitude;
        Assert.That(finalSpeed, Is.LessThanOrEqualTo(lateralLimit * 1.01f));
    }

    [Test]
    public void Execute_FA_ON_NoLimitsBelowMaxSpeed()
    {
        // Arrange: Ship with FA:ON, velocity below limits
        var config = SharedPhysics.ToShipConfig();
        var ship = CreateTestShip(config, Vector2.Zero, Vector2.Right * 50.0f); // Well below 260 m/s
        ship.ReplaceFlightAssist(true);
        ship.controlState.Thrust = 0.0f; // Idle

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act: Single frame
        _system.Execute();

        // Assert: Speed should only have gentle damping applied (not clamped)
        var finalSpeed = ship.velocity.Linear.Magnitude;
        var speedChange = initialSpeed - finalSpeed;
        Assert.That(speedChange, Is.GreaterThanOrEqualTo(0)); // Should decrease
        Assert.That(speedChange, Is.LessThan(initialSpeed * 0.1f)); // But not more than 10% in one frame
    }

    /// <summary>
    /// Helper to create a test ship with required components
    /// </summary>
    private GameEntity CreateTestShip(ShipConfig config, Vector2 position, Vector2 velocity)
    {
        var entity = _context.CreateEntity();
        
        // Transform
        entity.AddTransform2D(position, 0.0f);
        
        // Velocity
        entity.AddVelocity(velocity, 0.0f);
        
        // Mass
        var mass_kg = config.Hull.DryMass_t * 1000.0f;
        var inertia_kgm2 = mass_kg * (config.Geometry.Length_m * config.Geometry.Length_m + 
                                      config.Geometry.Width_m * config.Geometry.Width_m) / 12.0f;
        entity.AddMass(mass_kg, inertia_kgm2);
        
        // Momentum (initialize from velocity)
        entity.AddMomentum(velocity * mass_kg, 0.0f);
        
        // Ship config
        entity.AddShipConfig(config);
        
        // Control state (default idle)
        entity.AddControlState(0.0f, 0.0f, 0.0f, 0.0f);
        
        // Flight assist (default ON)
        entity.AddFlightAssist(true);
        
        return entity;
    }
}
