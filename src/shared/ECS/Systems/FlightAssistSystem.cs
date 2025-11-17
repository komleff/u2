using Entitas;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Flight Assist system (stub for M3)
/// FA:ON = enforce speed/g-limits, damping
/// FA:OFF = raw control pass-through
/// </summary>
public class FlightAssistSystem : IExecuteSystem
{
    private readonly GameContext _context;

    public FlightAssistSystem(GameContext context)
    {
        _context = context;
    }

    public void Execute()
    {
        // TODO M3: Implement flight assist
        // - Check FlightAssistComponent.Enabled
        // - If FA:ON: apply speed limits, g-limits, damping
        // - If FA:OFF: pass controls directly to physics
    }
}
