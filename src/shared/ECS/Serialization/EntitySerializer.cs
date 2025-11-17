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
    public static EntitySnapshotProto ToSnapshot(GameEntity entity)
    {
        var snapshot = new EntitySnapshotProto
        {
            EntityId = (uint)entity.creationIndex
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
    /// Create world snapshot for all entities
    /// </summary>
    public static WorldSnapshotProto CreateWorldSnapshot(GameContext context)
    {
        var snapshot = new WorldSnapshotProto();
        
        foreach (var entity in context.GetEntities())
        {
            snapshot.Entities.Add(ToSnapshot(entity));
        }
        
        return snapshot;
    }
}
