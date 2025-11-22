using NUnit.Framework;
using U2.Shared.ECS;
using U2.Shared.ECS.Systems;
using U2.Shared.Math;
using U2.Shared.Config;
using U2.Shared.Ships;

namespace U2.Shared.Tests.ECS;

[TestFixture]
public class FlightAssistSystemTests
{
    private GameContext _context = null!;
    private FlightAssistSystem _system = null!;
    private ShipConfig _testConfig = null!;

    [SetUp]
    public void SetUp()
    {
        _context = new GameContext();
        _system = new FlightAssistSystem(_context, 1f/30f); // 30 Hz physics tick
        
        _testConfig = new ShipConfig
        {
            Meta = new ShipMeta { Id = "test_ship", Name = "Test Ship" },
            Physics = new ShipPhysics
            {
                AngularAcceleration_dps2 = new AngularAcceleration { Yaw = 180f }
            },
            FlightAssistLimits = new FlightAssistLimits
            {
                CrewGLimit = new CrewGLimit { Linear_g = 6.0f },
                LinearSpeedMax_mps = new LinearSpeedMax { Forward = 260f, Reverse = 130f },
                AngularSpeedMax_dps = new AngularSpeedMax { Yaw = 80f }
            }
        };
    }

    [TearDown]
    public void TearDown()
    {
        _context.DestroyAllEntities();
    }

    [Test]
    public void Execute_FAOn_DampsVelocityWhenIdle()
    {
        var entity = _context.CreateEntity();
        entity.AddControlState(0f, 0f, 0f, 0f); // Idle controls
        entity.AddFlightAssist(true);
        entity.AddVelocity(new Vector2(10f, 0f), 1f);
        entity.AddShipConfig(_testConfig);

        _system.Execute();

        Assert.That(entity.velocity.Linear.X, Is.LessThan(10f), "Linear velocity should be damped when idle");
        Assert.That(entity.velocity.Angular, Is.LessThan(1f), "Angular velocity should be damped");
    }

    [Test]
    public void Execute_FAOff_DoesNotModifyVelocity()
    {
        var entity = _context.CreateEntity();
        entity.AddControlState(0.2f, 0f, 0f, 0f);
        entity.AddFlightAssist(false); // FA:OFF
        entity.AddVelocity(new Vector2(5f, 0f), 0.5f);
        entity.AddShipConfig(_testConfig);

        _system.Execute();

        Assert.That(entity.velocity.Linear.X, Is.EqualTo(5f).Within(0.0001f), "FA:OFF should not modify linear velocity");
        Assert.That(entity.velocity.Angular, Is.EqualTo(0.5f).Within(0.0001f), "FA:OFF should not modify angular velocity");
    }
    
    [Test]
    public void Execute_FAOn_LimitsExcessiveSpeed()
    {
        var entity = _context.CreateEntity();
        entity.AddControlState(0f, 0f, 0f, 0f);
        entity.AddFlightAssist(true);
        entity.AddVelocity(new Vector2(400f, 0f), 0f); // 400 m/s exceeds 260 m/s limit
        entity.AddShipConfig(_testConfig);

        _system.Execute();

        var finalSpeed = entity.velocity.Linear.Magnitude;
        Assert.That(finalSpeed, Is.LessThan(400f), "Speed should be reduced toward limit");
    }
    
    [Test]
    public void Execute_FAOn_DoesNotDampWhenControlsActive()
    {
        var entity = _context.CreateEntity();
        entity.AddControlState(0.5f, 0f, 0f, 0f); // Active thrust
        entity.AddFlightAssist(true);
        entity.AddVelocity(new Vector2(50f, 0f), 0f); // Below speed limit
        entity.AddShipConfig(_testConfig);

        var initialSpeed = entity.velocity.Linear.Magnitude;
        _system.Execute();
        var finalSpeed = entity.velocity.Linear.Magnitude;

        Assert.That(finalSpeed, Is.EqualTo(initialSpeed).Within(0.01f), "Linear damping should not apply when controls active");
    }
    
    [Test]
    public void Execute_FAOn_DampsAngularVelocity()
    {
        var entity = _context.CreateEntity();
        entity.AddControlState(0f, 0f, 0f, 0f);
        entity.AddFlightAssist(true);
        entity.AddVelocity(Vector2.Zero, 2f); // 2 rad/s angular velocity
        entity.AddShipConfig(_testConfig);

        _system.Execute();

        Assert.That(entity.velocity.Angular, Is.LessThan(2f), "Angular velocity should be damped");
        Assert.That(entity.velocity.Angular, Is.GreaterThanOrEqualTo(0f), "Angular velocity should not go negative");
    }
}
