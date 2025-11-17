// Manual Protobuf implementation (in production would be auto-generated from .proto)
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value

namespace U2.Shared.Proto;

public class Vector2Proto
{
    public float X { get; set; }
    public float Y { get; set; }
}

public class Transform2DProto
{
    public Vector2Proto Position { get; set; }
    public float Rotation { get; set; }
}

public class VelocityProto
{
    public Vector2Proto Linear { get; set; }
    public float Angular { get; set; }
}

public class MassProto
{
    public float MassKg { get; set; }
    public float InertiaKgm2 { get; set; }
}

public class ControlStateProto
{
    public float Thrust { get; set; }
    public float StrafeX { get; set; }
    public float StrafeY { get; set; }
    public float YawInput { get; set; }
}

public class FlightAssistProto
{
    public bool Enabled { get; set; }
}

public class HealthProto
{
    public float CurrentHp { get; set; }
    public float MaxHp { get; set; }
}

public class EntitySnapshotProto
{
    public uint EntityId { get; set; }
    public Transform2DProto? Transform { get; set; }
    public VelocityProto? Velocity { get; set; }
    public ControlStateProto? ControlState { get; set; }
    public FlightAssistProto? FlightAssist { get; set; }
    public HealthProto? Health { get; set; }
}

public class WorldSnapshotProto
{
    public List<EntitySnapshotProto> Entities { get; set; } = new List<EntitySnapshotProto>();
}

#pragma warning restore CS8618
