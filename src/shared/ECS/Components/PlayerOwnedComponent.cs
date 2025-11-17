using Entitas;
using Entitas.CodeGeneration.Attributes;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Marks entity as owned by a player
/// </summary>

public sealed class PlayerOwnedComponent : IComponent
{
    public int PlayerId;
}
