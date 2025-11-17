using NUnit.Framework;
using U2.Shared.ECS;
using U2.Shared.ECS.Components;
using U2.Shared.Math;
using U2.Shared.Ships;

namespace U2.Shared.Tests.ECS;

[TestFixture]
public class EntityFactoryTests
{
    private GameContext _context = null!;

    [SetUp]
    public void SetUp()
    {
        _context = new GameContext();
    }

    [TearDown]
    public void TearDown()
    {
        _context.DestroyAllEntities();
    }

    private ShipConfig CreateTestShipConfig()
    {
        return new ShipConfig
        {
            Meta = new ShipMeta { Id = "test_ship", Name = "Test Ship" },
            Classification = new ShipClassification { Size = "light", Type = "fighter" },
            Geometry = new ShipGeometry
            {
                Length_m = 18f,
                Width_m = 13f,
                Height_m = 5f
            },
            Hull = new ShipHull
            {
                DryMass_t = 55f,
                Hull_HP = 5500f
            },
            Physics = new ShipPhysics
            {
                LinearAcceleration_mps2 = new LinearAcceleration { Forward = 80f, Reverse = 60f }
            }
        };
    }

    [Test]
    public void CreateShip_CreatesEntityWithAllComponents()
    {
        var config = CreateTestShipConfig();
        var position = new Vector2(100f, 200f);

        var entity = EntityFactory.CreateShip(_context, config, position);

        Assert.That(entity, Is.Not.Null);
        Assert.That(entity.hasTransform2D, Is.True);
        Assert.That(entity.hasVelocity, Is.True);
        Assert.That(entity.hasMomentum, Is.True);
        Assert.That(entity.hasMass, Is.True);
        Assert.That(entity.hasShipConfig, Is.True);
        Assert.That(entity.hasControlState, Is.True);
        Assert.That(entity.hasFlightAssist, Is.True);
        Assert.That(entity.hasHealth, Is.True);
    }

    [Test]
    public void CreateShip_SetsCorrectPosition()
    {
        var config = CreateTestShipConfig();
        var position = new Vector2(100f, 200f);

        var entity = EntityFactory.CreateShip(_context, config, position);

        Assert.That(entity.transform2D.Position.X, Is.EqualTo(100f));
        Assert.That(entity.transform2D.Position.Y, Is.EqualTo(200f));
    }

    [Test]
    public void CreateShip_CalculatesMassCorrectly()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero);

        // 55 tons = 55000 kg
        Assert.That(entity.mass.Mass_kg, Is.EqualTo(55000f));
        Assert.That(entity.mass.Inertia_kgm2, Is.GreaterThan(0f));
    }

    [Test]
    public void CreateShip_DefaultsToFlightAssistOn()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero);

        Assert.That(entity.flightAssist.Enabled, Is.True);
    }

    [Test]
    public void CreateShip_SetsFullHealth()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero);

        Assert.That(entity.health.Current_HP, Is.EqualTo(5500f));
        Assert.That(entity.health.Max_HP, Is.EqualTo(5500f));
    }

    [Test]
    public void CreateShip_WithPlayerId_AddsPlayerOwnedComponent()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero, playerId: 42);

        Assert.That(entity.hasPlayerOwned, Is.True);
        Assert.That(entity.playerOwned.PlayerId, Is.EqualTo(42));
    }

    [Test]
    public void CreateShip_WithoutPlayerId_DoesNotAddPlayerOwnedComponent()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero);

        Assert.That(entity.hasPlayerOwned, Is.False);
    }

    [Test]
    public void CreateShip_InitializesZeroVelocity()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero);

        Assert.That(entity.velocity.Linear.X, Is.EqualTo(0f));
        Assert.That(entity.velocity.Linear.Y, Is.EqualTo(0f));
        Assert.That(entity.velocity.Angular, Is.EqualTo(0f));
    }

    [Test]
    public void CreateShip_InitializesZeroMomentum()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero);

        Assert.That(entity.momentum.Linear.X, Is.EqualTo(0f));
        Assert.That(entity.momentum.Linear.Y, Is.EqualTo(0f));
        Assert.That(entity.momentum.Angular, Is.EqualTo(0f));
    }

    [Test]
    public void CreateShip_InitializesZeroControls()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, Vector2.Zero);

        Assert.That(entity.controlState.Thrust, Is.EqualTo(0f));
        Assert.That(entity.controlState.Strafe_X, Is.EqualTo(0f));
        Assert.That(entity.controlState.Strafe_Y, Is.EqualTo(0f));
        Assert.That(entity.controlState.Yaw_Input, Is.EqualTo(0f));
    }
}
