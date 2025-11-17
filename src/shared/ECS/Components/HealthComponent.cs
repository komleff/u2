using Entitas;
using Entitas.CodeGeneration.Attributes;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Health points (stub for M6)
/// </summary>

public sealed class HealthComponent : IComponent
{
    public float Current_HP;
    public float Max_HP;
}
