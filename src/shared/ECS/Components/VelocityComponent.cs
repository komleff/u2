using Entitas;
using Entitas.CodeGeneration.Attributes;
using U2.Shared.Math;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Linear and angular velocity
/// </summary>

public sealed class VelocityComponent : IComponent
{
    public Vector2 Linear;    // m/s
    public float Angular;      // rad/s
}
