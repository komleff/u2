using NUnit.Framework;
using U2.Shared.ECS;
using U2.Shared.ECS.Systems;
using U2.Shared.Math;
using U2.Shared.Ships;
using U2.Shared.Config;

namespace U2.Shared.Tests.ECS;

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
    public void Execute_FA_OFF_DoesNotLimitSpeed()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: false);
        
        // Set velocity above FA limits
        var excessiveSpeed = Vector2.Right * 500.0f; // > 260 m/s forward limit
        ship.ReplaceVelocity(excessiveSpeed, 0.0f);

        // Act
        _system.Execute();

        // Assert - FA:OFF should NOT clamp velocity
        Assert.That(ship.velocity.Linear.X, Is.EqualTo(500.0f).Within(0.1f));
    }

    [Test]
    public void Execute_FA_ON_LimitsForwardSpeed()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing right (0 rad)
        
        // Set velocity above FA forward limit (260 m/s)
        ship.ReplaceVelocity(Vector2.Right * 500.0f, 0.0f);

        // Act
        _system.Execute();

        // Assert - velocity should be clamped to 260 m/s (with some damping applied)
        Assert.That(ship.velocity.Linear.X, Is.EqualTo(260.0f).Within(1.0f));
        Assert.That(ship.velocity.Linear.X, Is.LessThan(261.0f)); // Should not exceed limit
    }

    [Test]
    public void Execute_FA_ON_LimitsReverseSpeed()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing right
        
        // Set velocity above FA reverse limit (180 m/s)
        ship.ReplaceVelocity(Vector2.Right * -300.0f, 0.0f);

        // Act
        _system.Execute();

        // Assert - velocity should be clamped to -180 m/s (with some damping applied)
        Assert.That(ship.velocity.Linear.X, Is.EqualTo(-180.0f).Within(1.0f));
        Assert.That(ship.velocity.Linear.X, Is.GreaterThan(-181.0f)); // Should not exceed limit
    }

    [Test]
    public void Execute_FA_ON_LimitsLateralSpeed()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing right
        
        // Set lateral velocity above FA limit (220 m/s)
        ship.ReplaceVelocity(Vector2.Up * 300.0f, 0.0f);

        // Act
        _system.Execute();

        // Assert - velocity should be clamped to 220 m/s (with some damping applied)
        Assert.That(ship.velocity.Linear.Y, Is.EqualTo(220.0f).Within(1.0f));
        Assert.That(ship.velocity.Linear.Y, Is.LessThan(221.0f)); // Should not exceed limit
    }

    [Test]
    public void Execute_FA_ON_DampensAngularVelocity_WhenNoYawInput()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceVelocity(Vector2.Zero, 2.0f); // 2 rad/s angular velocity
        ship.controlState.Yaw_Input = 0.0f; // No yaw input

        var initialAngularVel = ship.velocity.Angular;

        // Act
        _system.Execute();

        // Assert - angular velocity should be dampened
        Assert.That(ship.velocity.Angular, Is.LessThan(initialAngularVel));
        Assert.That(ship.velocity.Angular, Is.GreaterThan(0.0f)); // But not instantly zero
    }

    [Test]
    public void Execute_FA_ON_DoesNotDampenAngularVelocity_WhenYawActive()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceVelocity(Vector2.Zero, 1.0f); // 1 rad/s angular velocity
        ship.controlState.Yaw_Input = 0.5f; // Active yaw input

        var initialAngularVel = ship.velocity.Angular;

        // Act
        _system.Execute();

        // Assert - angular velocity should NOT be dampened when yaw is active
        Assert.That(ship.velocity.Angular, Is.EqualTo(initialAngularVel).Within(0.01f));
    }

    [Test]
    public void Execute_FA_ON_LimitsAngularVelocity()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        
        // Set angular velocity above max yaw rate (80 deg/s = 1.396 rad/s)
        ship.ReplaceVelocity(Vector2.Zero, 5.0f); // 5 rad/s

        // Act
        _system.Execute();

        // Assert - angular velocity should be clamped to max yaw rate
        float maxYawRate_radps = 80.0f * MathF.PI / 180.0f; // 1.396 rad/s
        Assert.That(ship.velocity.Angular, Is.EqualTo(maxYawRate_radps).Within(0.01f));
    }

    [Test]
    public void Execute_FA_ON_DampensLinearVelocity_WhenThrustIdle()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing right
        ship.ReplaceVelocity(Vector2.Right * 100.0f, 0.0f);
        ship.controlState.Thrust = 0.0f; // Idle thrust
        ship.controlState.Strafe_X = 0.0f; // Idle strafe

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act
        _system.Execute();

        // Assert - linear velocity should be dampened
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThan(initialSpeed));
    }

    [Test]
    public void Execute_FA_ON_DoesNotDampenLinearVelocity_WhenThrustActive()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing right
        ship.ReplaceVelocity(Vector2.Right * 100.0f, 0.0f);
        ship.controlState.Thrust = 0.5f; // Active thrust

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act
        _system.Execute();

        // Assert - linear velocity should NOT be dampened when thrust is active
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(initialSpeed).Within(0.1f));
    }

    [Test]
    public void Execute_FA_ON_DampensOnlyIdleAxes()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceTransform2D(Vector2.Zero, 0.0f); // Facing right
        
        // Moving forward and laterally
        ship.ReplaceVelocity(new Vector2(100.0f, 50.0f), 0.0f);
        
        ship.controlState.Thrust = 0.5f; // Active forward thrust
        ship.controlState.Strafe_X = 0.0f; // Idle strafe

        var initialForwardSpeed = ship.velocity.Linear.X;
        var initialLateralSpeed = ship.velocity.Linear.Y;

        // Act
        _system.Execute();

        // Assert - only lateral velocity should be dampened
        Assert.That(ship.velocity.Linear.X, Is.EqualTo(initialForwardSpeed).Within(0.1f)); // Forward unchanged
        Assert.That(ship.velocity.Linear.Y, Is.LessThan(initialLateralSpeed)); // Lateral dampened
    }

    [Test]
    public void Execute_FA_ON_ToFA_OFF_ToFA_ON_TransitionWorks()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.ReplaceVelocity(Vector2.Right * 500.0f, 0.0f);

        // Act 1: FA:ON - should clamp (with damping)
        _system.Execute();
        Assert.That(ship.velocity.Linear.X, Is.LessThan(261.0f));
        Assert.That(ship.velocity.Linear.X, Is.GreaterThan(258.0f));

        // Act 2: Switch to FA:OFF
        ship.ReplaceFlightAssist(false);
        ship.ReplaceVelocity(Vector2.Right * 500.0f, 0.0f);
        _system.Execute();
        Assert.That(ship.velocity.Linear.X, Is.EqualTo(500.0f).Within(0.1f)); // No clamping

        // Act 3: Switch back to FA:ON
        ship.ReplaceFlightAssist(true);
        _system.Execute();
        Assert.That(ship.velocity.Linear.X, Is.LessThan(261.0f)); // Clamping restored
        Assert.That(ship.velocity.Linear.X, Is.GreaterThan(258.0f));
    }

    [Test]
    public void Execute_FA_ON_WorksWithRotatedShip()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        
        // Ship facing up (90 degrees = PI/2 radians)
        ship.ReplaceTransform2D(Vector2.Zero, MathF.PI / 2.0f);
        
        // Velocity in ship's forward direction (up in world space)
        ship.ReplaceVelocity(Vector2.Up * 500.0f, 0.0f);

        // Act
        _system.Execute();

        // Assert - should clamp to forward limit in ship-local space
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(260.0f).Within(1.0f));
        Assert.That(ship.velocity.Linear.Y, Is.GreaterThan(0.0f)); // Should still be moving up
    }

    [Test]
    public void Execute_SkipsDestroyedShips()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true);
        ship.AddHealth(0.0f, 1000.0f); // Add health component first
        ship.ReplaceVelocity(Vector2.Right * 500.0f, 0.0f);

        // Act
        _system.Execute();

        // Assert - destroyed ships should be skipped (velocity unchanged)
        Assert.That(ship.velocity.Linear.X, Is.EqualTo(500.0f).Within(0.1f));
    }

    [Test]
    public void Execute_MultipleShips_ProcessedCorrectly()
    {
        // Arrange
        var ship1 = CreateTestShip(flightAssistEnabled: true);
        ship1.ReplaceVelocity(Vector2.Right * 500.0f, 0.0f);

        var ship2 = CreateTestShip(flightAssistEnabled: false);
        ship2.ReplaceVelocity(Vector2.Right * 500.0f, 0.0f);

        // Act
        _system.Execute();

        // Assert
        Assert.That(ship1.velocity.Linear.X, Is.LessThan(261.0f)); // FA:ON clamped (with damping)
        Assert.That(ship1.velocity.Linear.X, Is.GreaterThan(258.0f));
        Assert.That(ship2.velocity.Linear.X, Is.EqualTo(500.0f).Within(0.1f)); // FA:OFF unchanged
    }

    private GameEntity CreateTestShip(bool flightAssistEnabled = true)
    {
        var entity = _context.CreateEntity();
        var config = SharedPhysics.ToShipConfig();

        entity.AddShipConfig(config);
        entity.AddTransform2D(Vector2.Zero, 0.0f);
        entity.AddVelocity(Vector2.Zero, 0.0f);
        entity.AddMass(config.Hull.DryMass_t * 1000.0f, 1000.0f);
        entity.AddControlState(0.0f, 0.0f, 0.0f, 0.0f);
        entity.AddFlightAssist(flightAssistEnabled);

        return entity;
    }
}
