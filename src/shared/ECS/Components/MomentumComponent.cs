using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Momentum for relativistic physics calculations
/// </summary>
[Game]
public sealed class MomentumComponent : IComponent
{
    public Vector2 Linear;    // kg⋅m/s
    public float Angular;      // kg⋅m²/s
}
