using Entitas;
using U2.Shared.ECS.Components;
using SysPhysics = U2.Shared.ECS.Systems.PhysicsSystem;
using SysCollision = U2.Shared.ECS.Systems.CollisionSystem;
using SysFlightAssist = U2.Shared.ECS.Systems.FlightAssistSystem;
using SysHeat = U2.Shared.ECS.Systems.HeatSystem;

namespace U2.Shared.ECS;

/// <summary>
/// Main ECS context holder and system executor
/// </summary>
public class GameWorld
{
    private readonly GameContext _context;
    private readonly Entitas.Systems _systems;

    public GameContext Context => _context;

    public GameWorld(float speedOfLight_mps = 5000.0f, float deltaTime = 1.0f / 60.0f, bool enableCollisions = true)
    {
        _context = new GameContext();
        _systems = CreateSystems(_context, speedOfLight_mps, deltaTime, enableCollisions);
    }

    private Entitas.Systems CreateSystems(GameContext context, float speedOfLight_mps, float deltaTime, bool enableCollisions)
    {
        var systems = new Entitas.Systems()
            // Update order matters!
            .Add(new SysFlightAssist(context))  // Process inputs first
            .Add(new SysPhysics(context, speedOfLight_mps, deltaTime));       // Then physics
        
        if (enableCollisions)
        {
            systems.Add(new SysCollision(context));     // Then collision detection (O(n²) - expensive for large entity counts)
        }
        
        systems.Add(new SysHeat(context));         // Then heat management
        
        return systems;
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
