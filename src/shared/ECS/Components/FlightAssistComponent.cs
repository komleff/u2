using Entitas;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Flight Assist ON/OFF toggle
/// FA:ON = autopilot enforces speed/g-limits
/// FA:OFF = raw physics, max performance
/// </summary>
[Game]
public sealed class FlightAssistComponent : IComponent
{
    public bool Enabled;  // true = FA:ON, false = FA:OFF
}
