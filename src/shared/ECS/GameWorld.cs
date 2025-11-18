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

    /// <summary>
    /// Create a player entity for network play
    /// </summary>
    public GameEntity CreatePlayerEntity(uint clientId)
    {
        // Create a default ship config (Origin M50-like interceptor)
        var config = new Ships.ShipConfig
        {
            Meta = new Ships.ShipMeta
            {
                Id = "default_fighter",
                Name = "Default Fighter",
                Manufacturer = "Generic",
                Version = "0.8.6"
            },
            Geometry = new Ships.ShipGeometry
            {
                Length_m = 11.5f,
                Width_m = 11.0f,
                Height_m = 3.5f
            },
            Hull = new Ships.ShipHull
            {
                DryMass_t = 10.0f,
                Hull_HP = 1000.0f
            },
            Physics = new Ships.ShipPhysics
            {
                LinearAcceleration_mps2 = new Ships.LinearAcceleration
                {
                    Forward = 90.0f,
                    Reverse = 67.5f
                },
                StrafeAcceleration_mps2 = new Ships.StrafeAcceleration
                {
                    Lateral = 85.0f
                },
                AngularAcceleration_dps2 = new Ships.AngularAcceleration
                {
                    Pitch = 240.0f,
                    Yaw = 200.0f,
                    Roll = 325.0f
                }
            },
            FlightAssistLimits = new Ships.FlightAssistLimits
            {
                CrewGLimit = new Ships.CrewGLimit { Linear_g = 11.0f },
                LinearSpeedMax_mps = new Ships.LinearSpeedMax
                {
                    Forward = 260.0f,
                    Reverse = 180.0f,
                    Lateral = 220.0f,
                    Vertical = 220.0f
                },
                AngularSpeedMax_dps = new Ships.AngularSpeedMax
                {
                    Pitch = 95.0f,
                    Yaw = 80.0f,
                    Roll = 130.0f
                }
            }
        };
        
        // Create entity at spawn position
        var position = new Math.Vector2(0, 0);
        var entity = EntityFactory.CreateShip(_context, config, position, 0.0f, (int)clientId);
        
        return entity;
    }

    /// <summary>
    /// Get entity by ID
    /// </summary>
    public GameEntity? GetEntityById(int id)
    {
        var entities = _context.GetEntities();
        return entities.FirstOrDefault(e => e.creationIndex == id);
    }

    /// <summary>
    /// Get all entities in the world
    /// </summary>
    public GameEntity[] GetAllEntities()
    {
        return _context.GetEntities();
    }
}
