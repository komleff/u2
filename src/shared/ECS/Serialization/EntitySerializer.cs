using U2.Shared.ECS.Components;
using U2.Shared.Math;
using U2.Shared.Proto;

namespace U2.Shared.ECS.Serialization;

/// <summary>
/// Extension methods for Protobuf conversion
/// </summary>
public static class ProtoExtensions
{
    public static Vector2 ToVector2(this Vector2Proto proto)
    {
        return new Vector2(proto.X, proto.Y);
    }
}

/// <summary>
/// Serializes ECS entities to/from Protobuf for network transmission
/// </summary>
public static class EntitySerializer
{
    public static Vector2Proto ToProto(Vector2 v)
    {
        return new Vector2Proto
        {
            X = v.X,
            Y = v.Y
        };
    }

    public static Vector2 FromProto(Vector2Proto proto)
    {
        return new Vector2(proto.X, proto.Y);
    }

    public static Transform2DProto ToProto(Transform2DComponent comp)
    {
        return new Transform2DProto
        {
            Position = ToProto(comp.Position),
            Rotation = comp.Rotation
        };
    }

    public static VelocityProto ToProto(VelocityComponent comp)
    {
        return new VelocityProto
        {
            Linear = ToProto(comp.Linear),
            Angular = comp.Angular
        };
    }

    public static ControlStateProto ToProto(ControlStateComponent comp)
    {
        return new ControlStateProto
        {
            Thrust = comp.Thrust,
            StrafeX = comp.Strafe_X,
            StrafeY = comp.Strafe_Y,
            YawInput = comp.Yaw_Input
        };
    }

    public static FlightAssistProto ToProto(FlightAssistComponent comp)
    {
        return new FlightAssistProto
        {
            Enabled = comp.Enabled
        };
    }

    public static HealthProto ToProto(HealthComponent comp)
    {
        return new HealthProto
        {
            CurrentHp = comp.Current_HP,
            MaxHp = comp.Max_HP
        };
    }

    /// <summary>
    /// Serialize entity to snapshot for network transmission
    /// Note: Only includes components needed for visualization
    /// Full state stays on server
    /// </summary>
    public static EntitySnapshotProto ToSnapshot(GameEntity entity, uint lastProcessedSequence = 0)
    {
        var snapshot = new EntitySnapshotProto
        {
            EntityId = (uint)entity.creationIndex,
            LastProcessedSequence = lastProcessedSequence // M2.3 reconciliation
        };

        // Transform (always present for ships)
        if (entity.hasTransform2D)
        {
            snapshot.Transform = ToProto(entity.transform2D);
        }

        // Velocity
        if (entity.hasVelocity)
        {
            snapshot.Velocity = ToProto(entity.velocity);
        }

        // Control state
        if (entity.hasControlState)
        {
            snapshot.ControlState = ToProto(entity.controlState);
        }

        // Flight assist
        if (entity.hasFlightAssist)
        {
            snapshot.FlightAssist = ToProto(entity.flightAssist);
        }

        // Health
        if (entity.hasHealth)
        {
            snapshot.Health = ToProto(entity.health);
        }

        return snapshot;
    }

    /// <summary>
    /// Create world snapshot for all entities (M2.1)
    /// </summary>
    /// <param name="context">Game context containing entities</param>
    /// <param name="tick">Server tick number</param>
    /// <param name="timestampMs">Server timestamp in milliseconds</param>
    /// <param name="getLastProcessedSequence">Optional function to get last processed sequence for entity</param>
    public static WorldSnapshotProto CreateWorldSnapshot(
        GameContext context, 
        uint tick, 
        ulong timestampMs,
        Func<int, uint>? getLastProcessedSequence = null)
    {
        var snapshot = new WorldSnapshotProto
        {
            Tick = tick,
            TimestampMs = timestampMs
        };
        
        foreach (var entity in context.GetEntities())
        {
            var lastSequence = getLastProcessedSequence?.Invoke(entity.creationIndex) ?? 0;
            snapshot.Entities.Add(ToSnapshot(entity, lastSequence));
        }
        
        return snapshot;
    }

    /// <summary>
    /// Create world snapshot for all entities (legacy - no tick/timestamp)
    /// </summary>
    public static WorldSnapshotProto CreateWorldSnapshot(GameContext context)
    {
        return CreateWorldSnapshot(context, 0, 0);
    }

    /// <summary>
    /// Apply control state from protobuf to entity (M2.1)
    /// </summary>
    public static void ApplyControlState(GameEntity entity, ControlStateProto proto)
    {
        if (!entity.hasControlState)
        {
            entity.AddControlState(0, 0, 0, 0);
        }

        entity.ReplaceControlState(
            proto.Thrust,
            proto.StrafeX,
            proto.StrafeY,
            proto.YawInput
        );
    }

    /// <summary>
    /// Apply flight assist state from player input (M2.1)
    /// </summary>
    public static void ApplyFlightAssist(GameEntity entity, bool enabled)
    {
        if (!entity.hasFlightAssist)
        {
            entity.AddFlightAssist(enabled);
        }
        else
        {
            entity.ReplaceFlightAssist(enabled);
        }
    }

    /// <summary>
    /// Apply player input to entity (M2.1 - combined control + FA)
    /// </summary>
    public static void ApplyPlayerInput(GameEntity entity, PlayerInputProto input)
    {
        ApplyControlState(entity, input.ControlState);
        ApplyFlightAssist(entity, input.FlightAssist);
    }

    /// <summary>
    /// Create server message wrapper for world snapshot (M2.1)
    /// </summary>
    public static ServerMessageProto CreateWorldSnapshotMessage(GameContext context, uint tick, ulong timestampMs)
    {
        return new ServerMessageProto
        {
            WorldSnapshot = CreateWorldSnapshot(context, tick, timestampMs)
        };
    }

    /// <summary>
    /// Create server message wrapper for connection accepted (M2.1)
    /// </summary>
    public static ServerMessageProto CreateConnectionAcceptedMessage(uint clientId, uint entityId, ulong serverTimeMs)
    {
        return new ServerMessageProto
        {
            ConnectionAccepted = new ConnectionAcceptedProto
            {
                ClientId = clientId,
                EntityId = entityId,
                ServerTimeMs = serverTimeMs
            }
        };
    }

    /// <summary>
    /// Create server message wrapper for disconnect (M2.1)
    /// </summary>
    public static ServerMessageProto CreateDisconnectMessage(uint clientId, string reason)
    {
        return new ServerMessageProto
        {
            Disconnect = new DisconnectProto
            {
                ClientId = clientId,
                Reason = reason
            }
        };
    }

    /// <summary>
    /// Create client message wrapper for connection request (M2.1)
    /// </summary>
    public static ClientMessageProto CreateConnectionRequestMessage(string playerName, string version)
    {
        return new ClientMessageProto
        {
            ConnectionRequest = new ConnectionRequestProto
            {
                PlayerName = playerName,
                Version = version
            }
        };
    }

    /// <summary>
    /// Create client message wrapper for player input (M2.1)
    /// </summary>
    public static ClientMessageProto CreatePlayerInputMessage(
        uint clientId,
        uint sequenceNumber,
        ulong timestampMs,
        ControlStateProto controlState,
        bool flightAssist = true)
    {
        return new ClientMessageProto
        {
            PlayerInput = new PlayerInputProto
            {
                ClientId = clientId,
                SequenceNumber = sequenceNumber,
                TimestampMs = timestampMs,
                ControlState = controlState,
                FlightAssist = flightAssist
            }
        };
    }
}
