using Entitas;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Marks entity as owned by a player
/// </summary>
[Game]
public sealed class PlayerOwnedComponent : IComponent
{
    public int PlayerId;
}
