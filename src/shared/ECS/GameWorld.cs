using Entitas;
using U2.Shared.ECS.Components;
using U2.Shared.ECS.Systems;

namespace U2.Shared.ECS;

/// <summary>
/// Main ECS context holder and system executor
/// </summary>
public class GameWorld
{
    private readonly GameContext _context;
    private readonly Systems _systems;

    public GameContext Context => _context;

    public GameWorld()
    {
        _context = new GameContext();
        _systems = CreateSystems(_context);
    }

    private Systems CreateSystems(GameContext context)
    {
        return new Systems()
            // Update order matters!
            .Add(new FlightAssistSystem(context))  // Process inputs first
            .Add(new PhysicsSystem(context))       // Then physics
            .Add(new HeatSystem(context));         // Then heat management
    }

    public void Initialize()
    {
        _systems.Initialize();
    }

    public void Execute()
    {
        _systems.Execute();
    }

    public void Cleanup()
    {
        _systems.Cleanup();
    }

    public void TearDown()
    {
        _systems.TearDown();
    }
}
