using Entitas;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Heat management system (stub for M7)
/// </summary>
public class HeatSystem : IExecuteSystem
{
    private readonly GameContext _context;

    public HeatSystem(GameContext context)
    {
        _context = context;
    }

    public void Execute()
    {
        // TODO M7: Implement heat model
        // - Heat generation from thrusters/weapons
        // - Cooling/dissipation
        // - Throttling at high temperatures
    }
}
