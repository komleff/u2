using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Components;

/// <summary>
/// 2D position and rotation
/// </summary>
[Game]
public sealed class Transform2DComponent : IComponent
{
    public Vector2 Position;
    public float Rotation; // radians
}
