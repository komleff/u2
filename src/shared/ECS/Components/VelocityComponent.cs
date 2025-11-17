using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Linear and angular velocity
/// </summary>
[Game]
public sealed class VelocityComponent : IComponent
{
    public Vector2 Linear;    // m/s
    public float Angular;      // rad/s
}
