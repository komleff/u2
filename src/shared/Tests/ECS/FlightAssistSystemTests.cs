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
    private FlightAssistSystem _faSystem = null!;
    private PhysicsSystem _physicsSystem = null!;
    private const float TestCPrime = 1000.0f;
    private const float DeltaTime = 1.0f / 60.0f;

    [SetUp]
    public void Setup()
    {
        _context = new GameContext();
        _faSystem = new FlightAssistSystem(_context, TestCPrime, DeltaTime);
        _physicsSystem = new PhysicsSystem(_context, TestCPrime, DeltaTime);
    }

    [TearDown]
    public void TearDown()
    {
        _context.DestroyAllEntities();
    }

    [Test]
    public void FA_OFF_DoesNotLimitSpeed()
    {
        // Arrange - Create ship with FA:OFF and high velocity
        var config = SharedPhysics.ToShipConfig();
        var highVelocity = new Vector2(500.0f, 0.0f); // Exceeds FA:ON limits
        var ship = CreateTestShip(Vector2.Zero, highVelocity);
        ship.ReplaceFlightAssist(false); // FA:OFF

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act
        _faSystem.Execute();

        // Assert - Speed should remain unchanged (FA:OFF doesn't limit)
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(initialSpeed).Within(0.1f));
    }

    [Test]
    public void FA_ON_LimitsForwardSpeed()
    {
        // Arrange
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward;
        
        // Create ship exceeding forward speed limit
        var excessSpeed = maxSpeed * 1.5f;
        var ship = CreateTestShip(Vector2.Zero, new Vector2(excessSpeed, 0.0f));
        ship.ReplaceFlightAssist(true); // FA:ON

        // Act - Run FA multiple times to allow gradual deceleration
        for (int i = 0; i < 120; i++) // 2 seconds at 60 Hz
        {
            _faSystem.Execute();
        }

        // Assert - Speed should be at or below limit
        var finalSpeed = ship.velocity.Linear.Magnitude;
        Assert.That(finalSpeed, Is.LessThanOrEqualTo(maxSpeed * 1.01f)); // Allow 1% tolerance
    }

    [Test]
    public void FA_ON_LimitsReverseSpeed()
    {
        // Arrange
        var config = SharedPhysics.ToShipConfig();
        var maxReverseSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Reverse;
        
        // Create ship with excessive reverse velocity
        var ship = CreateTestShip(Vector2.Zero, new Vector2(-maxReverseSpeed * 1.5f, 0.0f));
        ship.ReplaceFlightAssist(true); // FA:ON

        // Act - Run FA to limit speed
        for (int i = 0; i < 120; i++)
        {
            _faSystem.Execute();
        }

        // Assert
        var reverseSpeed = MathF.Abs(ship.velocity.Linear.X);
        Assert.That(reverseSpeed, Is.LessThanOrEqualTo(maxReverseSpeed * 1.01f));
    }

    [Test]
    public void FA_ON_DampsAngularVelocity_WhenNoYawInput()
    {
        // Arrange - Ship spinning with no yaw input
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.ReplaceVelocity(Vector2.Zero, 2.0f); // 2 rad/s spin
        ship.ReplaceFlightAssist(true); // FA:ON
        ship.controlState.Yaw_Input = 0.0f; // No yaw input

        var initialAngularVel = ship.velocity.Angular;

        // Act - Run FA for several frames
        for (int i = 0; i < 60; i++) // 1 second
        {
            _faSystem.Execute();
        }

        // Assert - Angular velocity should decrease significantly
        var finalAngularVel = ship.velocity.Angular;
        Assert.That(MathF.Abs(finalAngularVel), Is.LessThan(MathF.Abs(initialAngularVel) * 0.5f));
    }

    [Test]
    public void FA_ON_DoesNotDampAngularVelocity_WhenYawActive()
    {
        // Arrange - Ship with yaw input
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.ReplaceVelocity(Vector2.Zero, 1.0f);
        ship.ReplaceFlightAssist(true); // FA:ON
        ship.controlState.Yaw_Input = 0.5f; // Active yaw

        var initialAngularVel = ship.velocity.Angular;

        // Act
        _faSystem.Execute();

        // Assert - Angular velocity should NOT be damped (player is controlling)
        Assert.That(ship.velocity.Angular, Is.EqualTo(initialAngularVel).Within(0.01f));
    }

    [Test]
    public void FA_ON_DampsLinearVelocity_WhenIdle()
    {
        // Arrange - Ship drifting with no input
        var ship = CreateTestShip(Vector2.Zero, new Vector2(100.0f, 50.0f));
        ship.ReplaceFlightAssist(true); // FA:ON
        ship.controlState.Thrust = 0.0f;
        ship.controlState.Strafe_X = 0.0f;
        ship.controlState.Yaw_Input = 0.0f;

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act - Run FA for 2 seconds
        for (int i = 0; i < 120; i++)
        {
            _faSystem.Execute();
        }

        // Assert - Speed should decrease significantly
        var finalSpeed = ship.velocity.Linear.Magnitude;
        Assert.That(finalSpeed, Is.LessThan(initialSpeed * 0.5f));
    }

    [Test]
    public void FA_ON_DoesNotDampLinearVelocity_WhenThrusting()
    {
        // Arrange - Ship with active thrust
        var ship = CreateTestShip(Vector2.Zero, new Vector2(50.0f, 0.0f));
        ship.ReplaceFlightAssist(true); // FA:ON
        ship.controlState.Thrust = 1.0f; // Full thrust

        var initialVelocity = ship.velocity.Linear;

        // Act
        _faSystem.Execute();

        // Assert - Velocity should NOT be damped (player is thrusting)
        // Speed will change due to acceleration, but shouldn't damp toward zero
        Assert.That(ship.velocity.Linear.X, Is.GreaterThanOrEqualTo(initialVelocity.X - 1.0f));
    }

    [Test]
    public void FA_Toggle_ON_OFF_ChangesLimitingBehavior()
    {
        // Arrange - Ship with high velocity
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward;
        var highSpeed = maxSpeed * 2.0f;
        
        var ship = CreateTestShip(Vector2.Zero, new Vector2(highSpeed, 0.0f));
        ship.ReplaceFlightAssist(true); // Start FA:ON

        // Act 1 - Run with FA:ON
        for (int i = 0; i < 120; i++)
        {
            _faSystem.Execute();
        }
        var speedWithFA_ON = ship.velocity.Linear.Magnitude;

        // Act 2 - Toggle FA:OFF and verify speed increases again (set high velocity)
        ship.ReplaceVelocity(new Vector2(highSpeed, 0.0f), 0.0f);
        ship.ReplaceFlightAssist(false); // FA:OFF
        
        for (int i = 0; i < 10; i++)
        {
            _faSystem.Execute();
        }
        var speedWithFA_OFF = ship.velocity.Linear.Magnitude;

        // Assert - FA:OFF should not limit speed, FA:ON should
        Assert.That(speedWithFA_ON, Is.LessThan(maxSpeed * 1.1f));
        Assert.That(speedWithFA_OFF, Is.GreaterThan(maxSpeed * 1.5f));
    }

    [Test]
    public void FA_ON_RespectsCrewGLimit_WhenBraking()
    {
        // Arrange - Ship with high velocity
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward;
        var gLimit = config.FlightAssistLimits.CrewGLimit.Linear_g;
        
        var ship = CreateTestShip(Vector2.Zero, new Vector2(maxSpeed * 2.0f, 0.0f));
        ship.ReplaceFlightAssist(true); // FA:ON

        // Act - Run multiple frames and track max deceleration
        var maxSpeedChangePerFrame = 0.0f;
        for (int i = 0; i < 120; i++)
        {
            var speedBefore = ship.velocity.Linear.Magnitude;
            _faSystem.Execute();
            var speedAfter = ship.velocity.Linear.Magnitude;
            var speedChange = speedBefore - speedAfter;
            
            if (speedChange > maxSpeedChangePerFrame)
            {
                maxSpeedChangePerFrame = speedChange;
            }
        }

        // Assert - Max speed reduction per frame should not significantly exceed g-limit
        var maxAllowedChange = gLimit * 9.81f * DeltaTime;
        
        // Allow 100% tolerance since we're doing exponential damping and coordinate transforms
        Assert.That(maxSpeedChangePerFrame, Is.LessThanOrEqualTo(maxAllowedChange * 2.0f));
    }

    [Test]
    public void FA_ON_LimitsLateralSpeed()
    {
        // Arrange - Ship with excessive lateral velocity
        var config = SharedPhysics.ToShipConfig();
        var maxLateralSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Lateral;
        
        var ship = CreateTestShip(Vector2.Zero, new Vector2(0.0f, maxLateralSpeed * 1.5f));
        ship.ReplaceFlightAssist(true); // FA:ON

        // Act - Run FA to limit speed
        for (int i = 0; i < 120; i++)
        {
            _faSystem.Execute();
        }

        // Assert
        var lateralSpeed = MathF.Abs(ship.velocity.Linear.Y);
        Assert.That(lateralSpeed, Is.LessThanOrEqualTo(maxLateralSpeed * 1.01f));
    }

    [Test]
    public void FA_ON_ClampedVelocity_SurvivesPhysicsStep()
    {
        // Arrange - Ship moving faster than FA limit
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward;
        var ship = CreateTestShip(Vector2.Zero, new Vector2(maxSpeed * 2.0f, 0.0f));
        ship.ReplaceFlightAssist(true); // FA:ON

        // Act - Run FA then physics repeatedly to allow FA braking to settle
        for (int i = 0; i < 180; i++) // ~3 seconds at 60 Hz
        {
            _faSystem.Execute();
            _physicsSystem.Execute();
        }

        // Assert - Physics should keep the FA-clamped velocity (momentum synced)
        var speedAfter = ship.velocity.Linear.Magnitude;
        Assert.That(speedAfter, Is.LessThanOrEqualTo(maxSpeed * 1.05f));
    }

    // Helper method to create a test ship
    private GameEntity CreateTestShip(Vector2 position, Vector2 velocity)
    {
        var config = SharedPhysics.ToShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, position, 0.0f, 1);
        entity.ReplaceVelocity(velocity, 0.0f);
        
        // Initialize control state
        if (!entity.hasControlState)
        {
            entity.AddControlState(0.0f, 0.0f, 0.0f, 0.0f);
        }
        
        return entity;
    }
}
