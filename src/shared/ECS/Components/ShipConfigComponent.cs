using Entitas;
using U2.Shared.Ships;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Ship configuration reference
/// </summary>
[Game]
public sealed class ShipConfigComponent : IComponent
{
    public ShipConfig Config = new();
}
