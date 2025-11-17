using Entitas;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Physics integration system (stub for M1)
/// Will implement relativistic kinematics
/// </summary>
public class PhysicsSystem : IExecuteSystem
{
    private readonly GameContext _context;

    public PhysicsSystem(GameContext context)
    {
        _context = context;
    }

    public void Execute()
    {
        // TODO M1.1: Implement relativistic physics
        // - Calculate forces from control inputs
        // - Integrate momentum: p += F⋅dt
        // - Convert momentum to velocity: v = p/(γm)
        // - Integrate position: x += v⋅dt
        // - Angular dynamics
    }
}
