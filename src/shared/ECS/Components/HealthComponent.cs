using Entitas;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Health points (stub for M6)
/// </summary>
[Game]
public sealed class HealthComponent : IComponent
{
    public float Current_HP;
    public float Max_HP;
}
