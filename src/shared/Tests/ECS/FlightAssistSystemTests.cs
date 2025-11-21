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

    [SetUp]
    public void Setup()
    {
        _context = new GameContext();
        _system = new FlightAssistSystem(_context);
    }

    [TearDown]
    public void TearDown()
    {
        _context.DestroyAllEntities();
    }

    /// <summary>
    /// Helper to create a test ship with specified configuration
    /// </summary>
    private GameEntity CreateTestShip(bool flightAssistEnabled, Vector2 velocity, float angularVelocity = 0.0f)
    {
        var config = SharedPhysics.ToShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero, 0.0f);
        
        entity.ReplaceFlightAssist(flightAssistEnabled);
        entity.ReplaceVelocity(velocity, angularVelocity);
        
        return entity;
    }

    #region FA:OFF Tests (Bypass Behavior)

    [Test]
    public void Execute_FA_OFF_DoesNotModifyVelocity()
    {
        // Arrange
        var highVelocity = new Vector2(500.0f, 0.0f); // Exceeds FA limits
        var highAngularVel = 10.0f; // High rotation
        var ship = CreateTestShip(flightAssistEnabled: false, highVelocity, highAngularVel);
        
        var initialSpeed = highVelocity.Magnitude;
        var initialAngular = highAngularVel;
        
        // Act
        _system.Execute();
        
        // Assert - velocity unchanged
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(initialSpeed).Within(0.01f));
        Assert.That(ship.velocity.Angular, Is.EqualTo(initialAngular).Within(0.01f));
    }

    [Test]
    public void Execute_FA_OFF_AllowsExtremeVelocities()
    {
        // Arrange
        var extremeVelocity = new Vector2(1000.0f, 1000.0f); // Very high speed
        var ship = CreateTestShip(flightAssistEnabled: false, extremeVelocity);
        
        // Act
        _system.Execute();
        
        // Assert - speed unchanged (FA:OFF doesn't limit)
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(extremeVelocity.Magnitude).Within(0.01f));
    }

    #endregion

    #region FA:ON Linear Speed Limiting Tests

    [Test]
    public void Execute_FA_ON_LimitsLinearSpeed()
    {
        // Arrange
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = MathF.Max(
            MathF.Max(config.FlightAssistLimits.LinearSpeedMax_mps.Forward, 
                     config.FlightAssistLimits.LinearSpeedMax_mps.Reverse),
            MathF.Max(config.FlightAssistLimits.LinearSpeedMax_mps.Lateral, 
                     config.FlightAssistLimits.LinearSpeedMax_mps.Vertical)
        );
        
        var excessiveVelocity = new Vector2(maxSpeed * 2.0f, 0.0f);
        var ship = CreateTestShip(flightAssistEnabled: true, excessiveVelocity);
        
        // Act
        _system.Execute();
        
        // Assert - speed clamped to max
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThanOrEqualTo(maxSpeed));
    }

    [Test]
    public void Execute_FA_ON_PreservesDirectionWhenLimiting()
    {
        // Arrange
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward;
        var excessiveVelocity = new Vector2(maxSpeed * 2.0f, maxSpeed * 2.0f); // 45-degree angle
        var ship = CreateTestShip(flightAssistEnabled: true, excessiveVelocity);
        
        var originalDirection = excessiveVelocity.Normalized;
        
        // Act
        _system.Execute();
        
        // Assert - direction preserved
        var newDirection = ship.velocity.Linear.Normalized;
        Assert.That(newDirection.X, Is.EqualTo(originalDirection.X).Within(0.01f));
        Assert.That(newDirection.Y, Is.EqualTo(originalDirection.Y).Within(0.01f));
    }

    [Test]
    public void Execute_FA_ON_DoesNotLimitBelowMaxSpeed()
    {
        // Arrange
        var config = SharedPhysics.ToShipConfig();
        var safeSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward * 0.8f;
        var velocity = new Vector2(safeSpeed, 0.0f);
        var ship = CreateTestShip(flightAssistEnabled: true, velocity);
        ship.ReplaceControlState(1.0f, 0.0f, 0.0f, 0.0f); // Active thrust
        
        var originalSpeed = velocity.Magnitude;
        
        // Act
        _system.Execute();
        
        // Assert - speed not reduced (below limit and controls active)
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(originalSpeed).Within(0.01f));
    }

    #endregion

    #region FA:ON Angular Damping Tests

    [Test]
    public void Execute_FA_ON_DampsAngularVelocity()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true, Vector2.Zero, angularVelocity: 5.0f);
        var initialAngularVel = ship.velocity.Angular;
        
        // Act
        _system.Execute();
        
        // Assert - angular velocity reduced
        Assert.That(ship.velocity.Angular, Is.LessThan(initialAngularVel));
        Assert.That(ship.velocity.Angular, Is.GreaterThan(0.0f)); // Not zero in one tick
    }

    [Test]
    public void Execute_FA_ON_ZerosSmallAngularVelocity()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true, Vector2.Zero, angularVelocity: 0.0005f);
        
        // Act
        _system.Execute();
        
        // Assert - very small angular velocity zeroed out
        Assert.That(ship.velocity.Angular, Is.EqualTo(0.0f));
    }

    [Test]
    public void Execute_FA_ON_AngularDampingConvergesToZero()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true, Vector2.Zero, angularVelocity: 2.0f);
        
        // Act - execute multiple times
        for (int i = 0; i < 100; i++)
        {
            _system.Execute();
        }
        
        // Assert - angular velocity converges to zero
        Assert.That(MathF.Abs(ship.velocity.Angular), Is.LessThan(0.01f));
    }

    #endregion

    #region FA:ON Linear Damping Tests (Idle Controls)

    [Test]
    public void Execute_FA_ON_DampsLinearVelocityWhenIdle()
    {
        // Arrange
        var velocity = new Vector2(100.0f, 0.0f);
        var ship = CreateTestShip(flightAssistEnabled: true, velocity);
        ship.ReplaceControlState(0.0f, 0.0f, 0.0f, 0.0f); // Idle controls
        
        var initialSpeed = velocity.Magnitude;
        
        // Act
        _system.Execute();
        
        // Assert - linear velocity reduced
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThan(initialSpeed));
    }

    [Test]
    public void Execute_FA_ON_NoLinearDampingWhenControlsActive()
    {
        // Arrange
        var velocity = new Vector2(100.0f, 0.0f);
        var ship = CreateTestShip(flightAssistEnabled: true, velocity);
        ship.ReplaceControlState(1.0f, 0.0f, 0.0f, 0.0f); // Active thrust
        
        var initialSpeed = velocity.Magnitude;
        
        // Act
        _system.Execute();
        
        // Assert - linear velocity NOT damped (controls active)
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(initialSpeed).Within(0.01f));
    }

    [Test]
    public void Execute_FA_ON_ZerosSmallLinearVelocityWhenIdle()
    {
        // Arrange
        var velocity = new Vector2(0.05f, 0.05f);
        var ship = CreateTestShip(flightAssistEnabled: true, velocity);
        ship.ReplaceControlState(0.0f, 0.0f, 0.0f, 0.0f); // Idle controls
        
        // Act
        _system.Execute();
        
        // Assert - very small velocity zeroed out
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThan(0.01f));
    }

    [Test]
    public void Execute_FA_ON_LinearDampingConvergesToZeroWhenIdle()
    {
        // Arrange
        var velocity = new Vector2(150.0f, 100.0f);
        var ship = CreateTestShip(flightAssistEnabled: true, velocity);
        ship.ReplaceControlState(0.0f, 0.0f, 0.0f, 0.0f); // Idle controls
        
        // Act - execute multiple times
        for (int i = 0; i < 100; i++)
        {
            _system.Execute();
        }
        
        // Assert - linear velocity converges to zero
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThan(0.1f));
    }

    #endregion

    #region FA Mode Switching Tests

    [Test]
    public void Execute_SwitchingFA_ON_To_OFF_StopsModifications()
    {
        // Arrange
        var highVelocity = new Vector2(500.0f, 0.0f);
        var ship = CreateTestShip(flightAssistEnabled: true, highVelocity);
        
        // Act - first with FA:ON
        _system.Execute();
        var velocityAfterFA_ON = ship.velocity.Linear.Magnitude;
        
        // Switch to FA:OFF
        ship.ReplaceFlightAssist(false);
        ship.ReplaceVelocity(highVelocity, 0.0f); // Reset velocity
        _system.Execute();
        var velocityAfterFA_OFF = ship.velocity.Linear.Magnitude;
        
        // Assert
        Assert.That(velocityAfterFA_ON, Is.LessThan(highVelocity.Magnitude)); // FA:ON limited
        Assert.That(velocityAfterFA_OFF, Is.EqualTo(highVelocity.Magnitude)); // FA:OFF didn't limit
    }

    [Test]
    public void Execute_SwitchingFA_OFF_To_ON_EnablesLimits()
    {
        // Arrange
        var config = SharedPhysics.ToShipConfig();
        var maxSpeed = config.FlightAssistLimits.LinearSpeedMax_mps.Forward;
        var excessiveVelocity = new Vector2(maxSpeed * 2.0f, 0.0f);
        var ship = CreateTestShip(flightAssistEnabled: false, excessiveVelocity);
        
        // Act - first with FA:OFF
        _system.Execute();
        var velocityAfterFA_OFF = ship.velocity.Linear.Magnitude;
        
        // Switch to FA:ON
        ship.ReplaceFlightAssist(true);
        _system.Execute();
        var velocityAfterFA_ON = ship.velocity.Linear.Magnitude;
        
        // Assert
        Assert.That(velocityAfterFA_OFF, Is.EqualTo(excessiveVelocity.Magnitude)); // FA:OFF didn't limit
        Assert.That(velocityAfterFA_ON, Is.LessThanOrEqualTo(maxSpeed)); // FA:ON limited
    }

    #endregion

    #region Edge Cases

    [Test]
    public void Execute_FA_ON_HandlesZeroVelocity()
    {
        // Arrange
        var ship = CreateTestShip(flightAssistEnabled: true, Vector2.Zero, 0.0f);
        
        // Act
        _system.Execute();
        
        // Assert - no crash, velocity remains zero
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(0.0f).Within(0.01f));
        Assert.That(ship.velocity.Angular, Is.EqualTo(0.0f).Within(0.01f));
    }

    [Test]
    public void Execute_MultipleEntities_ProcessedIndependently()
    {
        // Arrange
        var ship1 = CreateTestShip(flightAssistEnabled: true, new Vector2(100.0f, 0.0f));
        var ship2 = CreateTestShip(flightAssistEnabled: false, new Vector2(100.0f, 0.0f));
        ship1.ReplaceControlState(0.0f, 0.0f, 0.0f, 0.0f); // Idle
        ship2.ReplaceControlState(0.0f, 0.0f, 0.0f, 0.0f); // Idle
        
        // Act
        _system.Execute();
        
        // Assert
        Assert.That(ship1.velocity.Linear.Magnitude, Is.LessThan(100.0f)); // FA:ON damped
        Assert.That(ship2.velocity.Linear.Magnitude, Is.EqualTo(100.0f).Within(0.01f)); // FA:OFF unchanged
    }

    #endregion
}
