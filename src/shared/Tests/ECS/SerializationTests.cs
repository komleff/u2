using NUnit.Framework;
using U2.Shared.ECS;
using U2.Shared.ECS.Serialization;
using U2.Shared.Math;
using U2.Shared.Ships;

namespace U2.Shared.Tests.ECS;

[TestFixture]
public class SerializationTests
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
            Geometry = new ShipGeometry { Length_m = 18f, Width_m = 13f, Height_m = 5f },
            Hull = new ShipHull { DryMass_t = 55f, Hull_HP = 5500f },
            Physics = new ShipPhysics
            {
                LinearAcceleration_mps2 = new LinearAcceleration { Forward = 80f, Reverse = 60f }
            }
        };
    }

    [Test]
    public void SerializeTransform2D_RoundTrip_PreservesData()
    {
        var entity = _context.CreateEntity();
        entity.AddTransform2D(new Vector2(100f, 200f), 1.5f);

        var proto = EntitySerializer.ToProto(entity.transform2D);
        entity.ReplaceTransform2D(proto.Position.ToVector2(), proto.Rotation);

        Assert.That(entity.transform2D.Position.X, Is.EqualTo(100f).Within(0.001f));
        Assert.That(entity.transform2D.Position.Y, Is.EqualTo(200f).Within(0.001f));
        Assert.That(entity.transform2D.Rotation, Is.EqualTo(1.5f).Within(0.001f));
    }

    [Test]
    public void SerializeVelocity_RoundTrip_PreservesData()
    {
        var entity = _context.CreateEntity();
        entity.AddVelocity(new Vector2(50f, -30f), 0.5f);

        var proto = EntitySerializer.ToProto(entity.velocity);
        entity.ReplaceVelocity(proto.Linear.ToVector2(), proto.Angular);

        Assert.That(entity.velocity.Linear.X, Is.EqualTo(50f).Within(0.001f));
        Assert.That(entity.velocity.Linear.Y, Is.EqualTo(-30f).Within(0.001f));
        Assert.That(entity.velocity.Angular, Is.EqualTo(0.5f).Within(0.001f));
    }

    [Test]
    public void SerializeControlState_RoundTrip_PreservesData()
    {
        var entity = _context.CreateEntity();
        entity.AddControlState(0.8f, -0.3f, 0.2f, 0.1f, false);

        var proto = EntitySerializer.ToProto(entity.controlState);
        entity.ReplaceControlState(proto.Thrust, proto.StrafeX, proto.StrafeY, proto.YawInput, proto.Brake);

        Assert.That(entity.controlState.Thrust, Is.EqualTo(0.8f).Within(0.001f));
        Assert.That(entity.controlState.Strafe_X, Is.EqualTo(-0.3f).Within(0.001f));
        Assert.That(entity.controlState.Strafe_Y, Is.EqualTo(0.2f).Within(0.001f));
        Assert.That(entity.controlState.Yaw_Input, Is.EqualTo(0.1f).Within(0.001f));
    }

    [Test]
    public void SerializeFlightAssist_RoundTrip_PreservesData()
    {
        var entity = _context.CreateEntity();
        entity.AddFlightAssist(false);

        var proto = EntitySerializer.ToProto(entity.flightAssist);
        entity.ReplaceFlightAssist(proto.Enabled);

        Assert.That(entity.flightAssist.Enabled, Is.False);
    }

    [Test]
    public void SerializeHealth_RoundTrip_PreservesData()
    {
        var entity = _context.CreateEntity();
        entity.AddHealth(4200f, 5500f);

        var proto = EntitySerializer.ToProto(entity.health);
        entity.ReplaceHealth(proto.CurrentHp, proto.MaxHp);

        Assert.That(entity.health.Current_HP, Is.EqualTo(4200f).Within(0.001f));
        Assert.That(entity.health.Max_HP, Is.EqualTo(5500f).Within(0.001f));
    }

    [Test]
    public void SerializeFullEntity_CreatesValidSnapshot()
    {
        var config = CreateTestShipConfig();
        var entity = EntityFactory.CreateShip(_context, config, new Vector2(150f, 250f));
        entity.ReplaceVelocity(new Vector2(100f, 50f), 0.2f);

        var snapshot = EntitySerializer.ToSnapshot(entity);

        Assert.That(snapshot, Is.Not.Null);
        Assert.That(snapshot.Transform, Is.Not.Null);
        Assert.That(snapshot.Velocity, Is.Not.Null);
        Assert.That(snapshot.Health, Is.Not.Null);
        Assert.That(snapshot.ControlState, Is.Not.Null);
        Assert.That(snapshot.FlightAssist, Is.Not.Null);
    }

    [Test]
    public void SerializeWorldSnapshot_ContainsAllEntities()
    {
        var config = CreateTestShipConfig();
        var entity1 = EntityFactory.CreateShip(_context, config, new Vector2(0f, 0f));
        var entity2 = EntityFactory.CreateShip(_context, config, new Vector2(100f, 100f));
        var entity3 = EntityFactory.CreateShip(_context, config, new Vector2(200f, 200f));

        var snapshot = EntitySerializer.CreateWorldSnapshot(_context);

        Assert.That(snapshot.Entities.Count, Is.EqualTo(3));
    }

    // M2.1 Tests for new helper methods

    [Test]
    public void CreateWorldSnapshot_WithTickAndTimestamp_IncludesMetadata()
    {
        var config = CreateTestShipConfig();
        EntityFactory.CreateShip(_context, config, new Vector2(0f, 0f));
        EntityFactory.CreateShip(_context, config, new Vector2(100f, 100f));

        uint tick = 12345;
        ulong timestampMs = 9876543210;
        var snapshot = EntitySerializer.CreateWorldSnapshot(_context, tick, timestampMs);

        Assert.That(snapshot.Tick, Is.EqualTo(tick));
        Assert.That(snapshot.TimestampMs, Is.EqualTo(timestampMs));
        Assert.That(snapshot.Entities.Count, Is.EqualTo(2));
    }

    [Test]
    public void ApplyControlState_UpdatesEntityControls()
    {
        var entity = _context.CreateEntity();
        entity.AddControlState(0f, 0f, 0f, 0f, false);

        var proto = new U2.Shared.Proto.ControlStateProto
        {
            Thrust = 0.9f,
            StrafeX = -0.5f,
            StrafeY = 0.3f,
            YawInput = 0.7f
        };

        EntitySerializer.ApplyControlState(entity, proto);

        Assert.That(entity.controlState.Thrust, Is.EqualTo(0.9f).Within(0.001f));
        Assert.That(entity.controlState.Strafe_X, Is.EqualTo(-0.5f).Within(0.001f));
        Assert.That(entity.controlState.Strafe_Y, Is.EqualTo(0.3f).Within(0.001f));
        Assert.That(entity.controlState.Yaw_Input, Is.EqualTo(0.7f).Within(0.001f));
    }

    [Test]
    public void CreateConnectionAcceptedMessage_CreatesValidMessage()
    {
        uint clientId = 42;
        uint entityId = 123;
        ulong serverTime = 1234567890;

        var message = EntitySerializer.CreateConnectionAcceptedMessage(clientId, entityId, serverTime);

        Assert.That(message.MessageCase, Is.EqualTo(U2.Shared.Proto.ServerMessageProto.MessageOneofCase.ConnectionAccepted));
        Assert.That(message.ConnectionAccepted.ClientId, Is.EqualTo(clientId));
        Assert.That(message.ConnectionAccepted.EntityId, Is.EqualTo(entityId));
        Assert.That(message.ConnectionAccepted.ServerTimeMs, Is.EqualTo(serverTime));
    }

    [Test]
    public void CreateDisconnectMessage_CreatesValidMessage()
    {
        uint clientId = 99;
        string reason = "Test disconnect";

        var message = EntitySerializer.CreateDisconnectMessage(clientId, reason);

        Assert.That(message.MessageCase, Is.EqualTo(U2.Shared.Proto.ServerMessageProto.MessageOneofCase.Disconnect));
        Assert.That(message.Disconnect.ClientId, Is.EqualTo(clientId));
        Assert.That(message.Disconnect.Reason, Is.EqualTo(reason));
    }

    [Test]
    public void CreateConnectionRequestMessage_CreatesValidMessage()
    {
        string playerName = "TestPlayer";
        string version = "0.8.6";

        var message = EntitySerializer.CreateConnectionRequestMessage(playerName, version);

        Assert.That(message.MessageCase, Is.EqualTo(U2.Shared.Proto.ClientMessageProto.MessageOneofCase.ConnectionRequest));
        Assert.That(message.ConnectionRequest.PlayerName, Is.EqualTo(playerName));
        Assert.That(message.ConnectionRequest.Version, Is.EqualTo(version));
    }

    [Test]
    public void CreatePlayerInputMessage_CreatesValidMessage()
    {
        uint clientId = 10;
        uint sequenceNumber = 500;
        ulong timestampMs = 5000;
        var controlState = new U2.Shared.Proto.ControlStateProto
        {
            Thrust = 1.0f,
            StrafeX = 0.0f,
            StrafeY = 0.0f,
            YawInput = 0.5f
        };

        var message = EntitySerializer.CreatePlayerInputMessage(clientId, sequenceNumber, timestampMs, controlState);

        Assert.That(message.MessageCase, Is.EqualTo(U2.Shared.Proto.ClientMessageProto.MessageOneofCase.PlayerInput));
        Assert.That(message.PlayerInput.ClientId, Is.EqualTo(clientId));
        Assert.That(message.PlayerInput.SequenceNumber, Is.EqualTo(sequenceNumber));
        Assert.That(message.PlayerInput.TimestampMs, Is.EqualTo(timestampMs));
        Assert.That(message.PlayerInput.ControlState.Thrust, Is.EqualTo(1.0f).Within(0.001f));
    }

    [Test]
    public void CreateWorldSnapshotMessage_CreatesValidMessage()
    {
        var config = CreateTestShipConfig();
        EntityFactory.CreateShip(_context, config, new Vector2(10f, 20f));

        uint tick = 100;
        ulong timestampMs = 3000;
        var message = EntitySerializer.CreateWorldSnapshotMessage(_context, tick, timestampMs);

        Assert.That(message.MessageCase, Is.EqualTo(U2.Shared.Proto.ServerMessageProto.MessageOneofCase.WorldSnapshot));
        Assert.That(message.WorldSnapshot.Tick, Is.EqualTo(tick));
        Assert.That(message.WorldSnapshot.TimestampMs, Is.EqualTo(timestampMs));
        Assert.That(message.WorldSnapshot.Entities.Count, Is.EqualTo(1));
    }
}
