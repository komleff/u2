using NUnit.Framework;
using U2.Shared.ECS;
using U2.Shared.ECS.Systems;
using U2.Shared.Math;
using U2.Shared.Ships;

namespace U2.Shared.Tests.ECS;

[TestFixture]
public class CollisionSystemTests
{
    private GameContext _context = null!;
    private CollisionSystem _system = null!;

    [SetUp]
    public void Setup()
    {
        _context = new GameContext();
        _system = new CollisionSystem(_context);
    }

    [TearDown]
    public void TearDown()
    {
        _context.DestroyAllEntities();
    }

    [Test]
    public void Execute_NoCollision_ShipsUnaffected()
    {
        // Arrange
        var shipA = CreateTestShip(new Vector2(0, 0), Vector2.Zero);
        var shipB = CreateTestShip(new Vector2(100, 0), Vector2.Zero); // Far apart

        var initialPosA = new Vector2(shipA.transform2D.Position.X, shipA.transform2D.Position.Y);
        var initialPosB = new Vector2(shipB.transform2D.Position.X, shipB.transform2D.Position.Y);

        // Act
        _system.Execute();

        // Assert
        Assert.That(shipA.transform2D.Position.X, Is.EqualTo(initialPosA.X).Within(0.001f));
        Assert.That(shipB.transform2D.Position.X, Is.EqualTo(initialPosB.X).Within(0.001f));
    }

    [Test]
    public void Execute_HeadOnCollision_ShipsBounce()
    {
        // Arrange
        var shipA = CreateTestShip(new Vector2(0, 0), new Vector2(10, 0)); // Moving right
        var shipB = CreateTestShip(new Vector2(15, 0), new Vector2(-10, 0)); // Moving left
        // Collision radii ~11m each, so they're overlapping

        var initialVelA = shipA.velocity.Linear;
        var initialVelB = shipB.velocity.Linear;

        // Act
        _system.Execute();

        // Assert
        // After collision, velocities should reverse (or at least change significantly)
        Assert.That(shipA.velocity.Linear.X, Is.LessThan(initialVelA.X));
        Assert.That(shipB.velocity.Linear.X, Is.GreaterThan(initialVelB.X));
    }

    [Test]
    public void Execute_Collision_AppliesDamage()
    {
        // Arrange
        var shipA = CreateTestShip(new Vector2(0, 0), new Vector2(50, 0));
        var shipB = CreateTestShip(new Vector2(15, 0), new Vector2(-50, 0));

        var initialHpA = shipA.health.Current_HP;
        var initialHpB = shipB.health.Current_HP;

        // Act
        _system.Execute();

        // Assert
        Assert.That(shipA.health.Current_HP, Is.LessThan(initialHpA));
        Assert.That(shipB.health.Current_HP, Is.LessThan(initialHpB));
    }

    [Test]
    public void Execute_HighSpeedCollision_CausesMoreDamage()
    {
        // Arrange - Low speed collision
        var shipA1 = CreateTestShip(new Vector2(0, 0), new Vector2(5, 0));
        var shipB1 = CreateTestShip(new Vector2(15, 0), new Vector2(-5, 0));
        
        _system.Execute();
        var damageA_low = 100.0f - shipA1.health.Current_HP;

        // Reset
        _context.DestroyAllEntities();
        
        // Arrange - High speed collision (but not too high to avoid total destruction)
        var shipA2 = CreateTestShip(new Vector2(0, 0), new Vector2(20, 0));
        var shipB2 = CreateTestShip(new Vector2(15, 0), new Vector2(-20, 0));
        
        _system.Execute();
        var damageA_high = 100.0f - shipA2.health.Current_HP;

        // Assert
        Assert.That(damageA_high, Is.GreaterThan(damageA_low));
    }

    [Test]
    public void Execute_CollisionSeparatesShips()
    {
        // Arrange
        var shipA = CreateTestShip(new Vector2(0, 0), Vector2.Zero);
        var shipB = CreateTestShip(new Vector2(5, 0), Vector2.Zero); // Heavily overlapping

        var initialDistance = (shipB.transform2D.Position - shipA.transform2D.Position).Magnitude;

        // Act
        _system.Execute();

        // Assert
        var finalDistance = (shipB.transform2D.Position - shipA.transform2D.Position).Magnitude;
        Assert.That(finalDistance, Is.GreaterThan(initialDistance));
    }

    [Test]
    public void Execute_SkipsDestroyedShips()
    {
        // Arrange
        var shipA = CreateTestShip(new Vector2(0, 0), new Vector2(10, 0));
        var shipB = CreateTestShip(new Vector2(15, 0), Vector2.Zero);
        
        // Destroy ship B
        shipB.ReplaceHealth(0.0f, 100.0f);

        var initialVelA = shipA.velocity.Linear;

        // Act
        _system.Execute();

        // Assert
        // Ship A should not be affected by collision with destroyed ship B
        Assert.That(shipA.velocity.Linear.X, Is.EqualTo(initialVelA.X).Within(0.001f));
    }

    [Test]
    public void Execute_ConservesApproximateMomentum()
    {
        // Arrange
        var shipA = CreateTestShip(new Vector2(0, 0), new Vector2(20, 0));
        var shipB = CreateTestShip(new Vector2(15, 0), new Vector2(-10, 0));

        var massA = shipA.mass.Mass_kg;
        var massB = shipB.mass.Mass_kg;
        var initialMomentum = massA * 20.0f + massB * (-10.0f);

        // Act
        _system.Execute();

        // Assert
        var finalMomentum = massA * shipA.velocity.Linear.X + massB * shipB.velocity.Linear.X;
        Assert.That(finalMomentum, Is.EqualTo(initialMomentum).Within(0.5f)); // Allow small error
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
                    Yaw = 90.0f
                }
            }
        };

        var entity = EntityFactory.CreateShip(_context, config, position, 0.0f, playerId: null);
        entity.ReplaceVelocity(velocity, 0.0f);
        
        // Set momentum to match velocity (non-relativistic for simplicity)
        var mass_kg = config.Hull.DryMass_t * 1000.0f;
        entity.ReplaceMomentum(velocity * mass_kg, 0.0f);

        return entity;
    }
}
