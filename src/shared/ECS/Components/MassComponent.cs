using Entitas;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Mass and moment of inertia
/// </summary>
[Game]
public sealed class MassComponent : IComponent
{
    public float Mass_kg;           // kilograms
    public float Inertia_kgm2;      // kg⋅m²
}
