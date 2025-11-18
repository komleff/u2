using NUnit.Framework;
using U2.Shared.Proto;
using Google.Protobuf;

namespace U2.Shared.Tests.Proto;

[TestFixture]
public class NetworkMessagesTests
{
    [Test]
    public void PlayerInputProto_CanSerializeAndDeserialize()
    {
        // Arrange
        var input = new PlayerInputProto
        {
            ClientId = 42,
            SequenceNumber = 100,
            TimestampMs = 1234567890,
            ControlState = new ControlStateProto
            {
                Thrust = 0.8f,
                StrafeX = 0.2f,
                StrafeY = -0.1f,
                YawInput = 0.5f
            }
        };

        // Act
        var bytes = input.ToByteArray();
        var deserialized = PlayerInputProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.ClientId, Is.EqualTo(42));
        Assert.That(deserialized.SequenceNumber, Is.EqualTo(100));
        Assert.That(deserialized.TimestampMs, Is.EqualTo(1234567890));
        Assert.That(deserialized.ControlState.Thrust, Is.EqualTo(0.8f).Within(0.001f));
        Assert.That(deserialized.ControlState.StrafeX, Is.EqualTo(0.2f).Within(0.001f));
        Assert.That(deserialized.ControlState.StrafeY, Is.EqualTo(-0.1f).Within(0.001f));
        Assert.That(deserialized.ControlState.YawInput, Is.EqualTo(0.5f).Within(0.001f));
    }

    [Test]
    public void ConnectionAcceptedProto_CanSerializeAndDeserialize()
    {
        // Arrange
        var message = new ConnectionAcceptedProto
        {
            ClientId = 123,
            EntityId = 456,
            ServerTimeMs = 9876543210
        };

        // Act
        var bytes = message.ToByteArray();
        var deserialized = ConnectionAcceptedProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.ClientId, Is.EqualTo(123));
        Assert.That(deserialized.EntityId, Is.EqualTo(456));
        Assert.That(deserialized.ServerTimeMs, Is.EqualTo(9876543210));
    }

    [Test]
    public void ConnectionRequestProto_CanSerializeAndDeserialize()
    {
        // Arrange
        var message = new ConnectionRequestProto
        {
            PlayerName = "TestPlayer",
            Version = "0.8.6"
        };

        // Act
        var bytes = message.ToByteArray();
        var deserialized = ConnectionRequestProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.PlayerName, Is.EqualTo("TestPlayer"));
        Assert.That(deserialized.Version, Is.EqualTo("0.8.6"));
    }

    [Test]
    public void DisconnectProto_CanSerializeAndDeserialize()
    {
        // Arrange
        var message = new DisconnectProto
        {
            ClientId = 789,
            Reason = "Connection timeout"
        };

        // Act
        var bytes = message.ToByteArray();
        var deserialized = DisconnectProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.ClientId, Is.EqualTo(789));
        Assert.That(deserialized.Reason, Is.EqualTo("Connection timeout"));
    }

    [Test]
    public void ClientMessageProto_ConnectionRequest_CanSerializeAndDeserialize()
    {
        // Arrange
        var message = new ClientMessageProto
        {
            ConnectionRequest = new ConnectionRequestProto
            {
                PlayerName = "Alice",
                Version = "0.8.6"
            }
        };

        // Act
        var bytes = message.ToByteArray();
        var deserialized = ClientMessageProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.MessageCase, Is.EqualTo(ClientMessageProto.MessageOneofCase.ConnectionRequest));
        Assert.That(deserialized.ConnectionRequest.PlayerName, Is.EqualTo("Alice"));
        Assert.That(deserialized.ConnectionRequest.Version, Is.EqualTo("0.8.6"));
    }

    [Test]
    public void ClientMessageProto_PlayerInput_CanSerializeAndDeserialize()
    {
        // Arrange
        var message = new ClientMessageProto
        {
            PlayerInput = new PlayerInputProto
            {
                ClientId = 1,
                SequenceNumber = 50,
                TimestampMs = 5000,
                ControlState = new ControlStateProto { Thrust = 1.0f }
            }
        };

        // Act
        var bytes = message.ToByteArray();
        var deserialized = ClientMessageProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.MessageCase, Is.EqualTo(ClientMessageProto.MessageOneofCase.PlayerInput));
        Assert.That(deserialized.PlayerInput.ClientId, Is.EqualTo(1));
        Assert.That(deserialized.PlayerInput.SequenceNumber, Is.EqualTo(50));
    }

    [Test]
    public void ServerMessageProto_ConnectionAccepted_CanSerializeAndDeserialize()
    {
        // Arrange
        var message = new ServerMessageProto
        {
            ConnectionAccepted = new ConnectionAcceptedProto
            {
                ClientId = 10,
                EntityId = 20,
                ServerTimeMs = 3000
            }
        };

        // Act
        var bytes = message.ToByteArray();
        var deserialized = ServerMessageProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.MessageCase, Is.EqualTo(ServerMessageProto.MessageOneofCase.ConnectionAccepted));
        Assert.That(deserialized.ConnectionAccepted.ClientId, Is.EqualTo(10));
        Assert.That(deserialized.ConnectionAccepted.EntityId, Is.EqualTo(20));
    }

    [Test]
    public void ServerMessageProto_WorldSnapshot_CanSerializeAndDeserialize()
    {
        // Arrange
        var message = new ServerMessageProto
        {
            WorldSnapshot = new WorldSnapshotProto
            {
                Tick = 100,
                TimestampMs = 5000,
                Entities =
                {
                    new EntitySnapshotProto
                    {
                        EntityId = 1,
                        Transform = new Transform2DProto
                        {
                            Position = new Vector2Proto { X = 10.0f, Y = 20.0f },
                            Rotation = 1.5f
                        }
                    }
                }
            }
        };

        // Act
        var bytes = message.ToByteArray();
        var deserialized = ServerMessageProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.MessageCase, Is.EqualTo(ServerMessageProto.MessageOneofCase.WorldSnapshot));
        Assert.That(deserialized.WorldSnapshot.Tick, Is.EqualTo(100));
        Assert.That(deserialized.WorldSnapshot.Entities.Count, Is.EqualTo(1));
        Assert.That(deserialized.WorldSnapshot.Entities[0].EntityId, Is.EqualTo(1));
    }

    [Test]
    public void ServerMessageProto_Disconnect_CanSerializeAndDeserialize()
    {
        // Arrange
        var message = new ServerMessageProto
        {
            Disconnect = new DisconnectProto
            {
                ClientId = 99,
                Reason = "Server shutdown"
            }
        };

        // Act
        var bytes = message.ToByteArray();
        var deserialized = ServerMessageProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.MessageCase, Is.EqualTo(ServerMessageProto.MessageOneofCase.Disconnect));
        Assert.That(deserialized.Disconnect.ClientId, Is.EqualTo(99));
        Assert.That(deserialized.Disconnect.Reason, Is.EqualTo("Server shutdown"));
    }

    [Test]
    public void WorldSnapshotProto_WithMultipleEntities_CanSerializeAndDeserialize()
    {
        // Arrange
        var snapshot = new WorldSnapshotProto
        {
            Tick = 200,
            TimestampMs = 10000
        };

        // Add multiple entities
        for (uint i = 1; i <= 5; i++)
        {
            snapshot.Entities.Add(new EntitySnapshotProto
            {
                EntityId = i,
                Transform = new Transform2DProto
                {
                    Position = new Vector2Proto { X = i * 10.0f, Y = i * 20.0f },
                    Rotation = i * 0.5f
                },
                Velocity = new VelocityProto
                {
                    Linear = new Vector2Proto { X = i, Y = i * 2 },
                    Angular = i * 0.1f
                },
                Health = new HealthProto
                {
                    CurrentHp = 100.0f - i * 10,
                    MaxHp = 100.0f
                }
            });
        }

        // Act
        var bytes = snapshot.ToByteArray();
        var deserialized = WorldSnapshotProto.Parser.ParseFrom(bytes);

        // Assert
        Assert.That(deserialized.Tick, Is.EqualTo(200));
        Assert.That(deserialized.TimestampMs, Is.EqualTo(10000));
        Assert.That(deserialized.Entities.Count, Is.EqualTo(5));

        for (int i = 0; i < 5; i++)
        {
            var entity = deserialized.Entities[i];
            Assert.That(entity.EntityId, Is.EqualTo((uint)(i + 1)));
            Assert.That(entity.Transform.Position.X, Is.EqualTo((i + 1) * 10.0f).Within(0.001f));
            Assert.That(entity.Health.CurrentHp, Is.EqualTo(100.0f - (i + 1) * 10).Within(0.001f));
        }
    }
}
