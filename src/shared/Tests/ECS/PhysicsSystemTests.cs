using NUnit.Framework;
using U2.Shared.ECS;
using U2.Shared.ECS.Systems;
using U2.Shared.Math;
using U2.Shared.Ships;
using U2.Shared.Config;

namespace U2.Shared.Tests.ECS;

[TestFixture]
public class PhysicsSystemTests
{
    private GameContext _context = null!;
    private PhysicsSystem _system = null!;
    private const float TestCPrime = 1000.0f; // Test speed of light
    private const float DeltaTime = 1.0f / 60.0f; // 60 FPS

    [SetUp]
    public void Setup()
    {
        _context = new GameContext();
        _system = new PhysicsSystem(_context, TestCPrime, DeltaTime);
    }

    [TearDown]
    public void TearDown()
    {
        _context.DestroyAllEntities();
    }

    [Test]
    public void Execute_WithNoForce_VelocityRemainsConstant()
    {
        // Arrange
        var ship = CreateTestShip(Vector2.Zero, Vector2.Right * 100.0f);
        ship.controlState.Thrust = 0.0f;
        ship.controlState.Strafe_X = 0.0f;
        ship.controlState.Yaw_Input = 0.0f;

        var initialVelocity = ship.velocity.Linear;

        // Act
        _system.Execute();

        // Assert
        Assert.That(ship.velocity.Linear.Magnitude, Is.EqualTo(initialVelocity.Magnitude).Within(1.0f));
    }

    [Test]
    public void Execute_WithForwardThrust_VelocityIncreases()
    {
        // Arrange
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.controlState.Thrust = 1.0f; // Full forward thrust

        var initialSpeed = ship.velocity.Linear.Magnitude;

        // Act
        _system.Execute();

        // Assert
        var finalSpeed = ship.velocity.Linear.Magnitude;
        Assert.That(finalSpeed, Is.GreaterThan(initialSpeed));
    }

    [Test]
    public void Execute_VelocityClampedAtLightSpeed()
    {
        // Arrange
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        
        // Set very high momentum to exceed light speed
        var extremeMomentum = Vector2.Right * 1000000.0f;
        ship.ReplaceMomentum(extremeMomentum, 0.0f);

        // Act
        _system.Execute();

        // Assert
        var maxAllowedSpeed = TestCPrime * 0.99f;
        Assert.That(ship.velocity.Linear.Magnitude, Is.LessThanOrEqualTo(maxAllowedSpeed));
    }

    [Test]
    public void Execute_PositionIntegratesCorrectly()
    {
        // Arrange
        var initialPos = new Vector2(100.0f, 100.0f);
        var velocity = new Vector2(50.0f, 0.0f);
        var ship = CreateTestShip(initialPos, velocity);
        ship.controlState.Thrust = 0.0f; // No acceleration

        var expectedDelta = velocity * DeltaTime;

        // Act
        _system.Execute();

        // Assert
        var actualDelta = ship.transform2D.Position - initialPos;
        Assert.That(actualDelta.X, Is.EqualTo(expectedDelta.X).Within(0.1f));
        Assert.That(actualDelta.Y, Is.EqualTo(expectedDelta.Y).Within(0.1f));
    }

    [Test]
    public void Execute_RotationIntegratesCorrectly()
    {
        // Arrange
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.transform2D.Rotation = 0.0f;
        ship.velocity.Angular = MathF.PI / 4.0f; // 45 degrees per second
        ship.controlState.Yaw_Input = 0.0f; // No torque

        var expectedRotationDelta = (MathF.PI / 4.0f) * DeltaTime;

        // Act
        _system.Execute();

        // Assert
        Assert.That(ship.transform2D.Rotation, Is.EqualTo(expectedRotationDelta).Within(0.01f));
    }

    [Test]
    public void Execute_SkipsDestroyedShips()
    {
        // Arrange
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.ReplaceHealth(0.0f, 100.0f); // Destroyed
        ship.controlState.Thrust = 1.0f;

        var initialPosition = new Vector2(ship.transform2D.Position.X, ship.transform2D.Position.Y);

        // Act
        _system.Execute();

        // Assert
        // Position should not change for destroyed ship
        Assert.That(ship.transform2D.Position.X, Is.EqualTo(initialPosition.X).Within(0.001f));
        Assert.That(ship.transform2D.Position.Y, Is.EqualTo(initialPosition.Y).Within(0.001f));
    }

    [Test]
    public void Execute_RelativisticEffectsAtHighSpeed()
    {
        // Arrange
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        var mass_kg = ship.mass.Mass_kg;
        
        // Set velocity to 0.8c'
        var highSpeed = TestCPrime * 0.8f;
        ship.ReplaceVelocity(Vector2.Right * highSpeed, 0.0f);

        // Calculate expected relativistic momentum
        var beta = highSpeed / TestCPrime;
        var gamma = 1.0f / MathF.Sqrt(1.0f - beta * beta);
        var expectedMomentum = gamma * mass_kg * highSpeed;

        // Act - one frame to recalculate momentum
        ship.controlState.Thrust = 0.0f;
        _system.Execute();

        // Assert - momentum should include gamma factor
        var actualMomentum = ship.momentum.Linear.Magnitude;
        Assert.That(actualMomentum, Is.GreaterThan(mass_kg * highSpeed)); // Should be > classical momentum
    }

    [Test]
    public void Execute_YawInput_CausesRotation()
    {
        // Arrange
        var ship = CreateTestShip(Vector2.Zero, Vector2.Zero);
        ship.controlState.Yaw_Input = 1.0f; // Full yaw
        var initialAngularVelocity = ship.velocity.Angular;

        // Act
        _system.Execute();

        // Assert
        Assert.That(MathF.Abs(ship.velocity.Angular), Is.GreaterThan(MathF.Abs(initialAngularVelocity)));
    }

    private GameEntity CreateTestShip(Vector2 position, Vector2 velocity)
    {
        var config = new ShipConfig
        {
            Hull = new ShipHull
            {
                DryMass_t = 10.0f,
                Hull_HP = 100.0f
            },
            Geometry = new ShipGeometry
            {
                Length_m = 20.0f,
                Width_m = 10.0f,
                Height_m = 5.0f
            },
            Physics = new ShipPhysics
            {
                LinearAcceleration_mps2 = new LinearAcceleration
                {
                    Forward = 50.0f,
                    Reverse = -30.0f
                },
                StrafeAcceleration_mps2 = new StrafeAcceleration
                {
                    Lateral = 20.0f
                },
                AngularAcceleration_dps2 = new AngularAcceleration
                {
                    Yaw = 90.0f // 90 degrees/s²
                }
            }
        };

        var entity = EntityFactory.CreateShip(_context, config, position, 0.0f, playerId: null);
        
        // Set initial velocity
        entity.ReplaceVelocity(velocity, 0.0f);
        
        // Calculate initial momentum from velocity
        var mass_kg = config.Hull.DryMass_t * 1000.0f;
        var speed = velocity.Magnitude;
        var beta = speed / TestCPrime;
        var gamma = 1.0f / MathF.Sqrt(MathF.Max(0.001f, 1.0f - beta * beta));
        var momentum = velocity * (gamma * mass_kg);
        entity.ReplaceMomentum(momentum, 0.0f);

        return entity;
    }
}
