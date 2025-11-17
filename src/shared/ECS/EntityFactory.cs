using Entitas;
using U2.Shared.ECS.Components;
using U2.Shared.Math;
using U2.Shared.Ships;

namespace U2.Shared.ECS;

/// <summary>
/// Factory for creating entities
/// </summary>
public static class EntityFactory
{
    /// <summary>
    /// Create a ship entity from configuration
    /// </summary>
    public static GameEntity CreateShip(GameContext context, ShipConfig config, Vector2 position, int? playerId = null)
    {
        var entity = context.CreateEntity();

        // Transform
        entity.AddTransform2D(position, 0f);

        // Velocity
        entity.AddVelocity(Vector2.Zero, 0f);

        // Momentum
        entity.AddMomentum(Vector2.Zero, 0f);

        // Mass
        float mass_kg = config.Hull.DryMass_t * 1000f;
        float length_m = config.Geometry.Length_m;
        float width_m = config.Geometry.Width_m;
        float inertia = CalculateInertia(mass_kg, length_m, width_m);
        entity.AddMass(mass_kg, inertia);

        // Ship config
        entity.AddShipConfig(config);

        // Control state
        entity.AddControlState(0f, 0f, 0f, 0f);

        // Flight assist (default ON)
        entity.AddFlightAssist(true);

        // Health
        entity.AddHealth(config.Hull.Hull_HP, config.Hull.Hull_HP);

        // Player ownership
        if (playerId.HasValue)
        {
            entity.AddPlayerOwned(playerId.Value);
        }

        return entity;
    }

    /// <summary>
    /// Calculate moment of inertia for rectangular ship
    /// I = (1/12) * m * (length² + width²)
    /// </summary>
    private static float CalculateInertia(float mass_kg, float length_m, float width_m)
    {
        return (1f / 12f) * mass_kg * (length_m * length_m + width_m * width_m);
    }

    // Extension methods for cleaner entity creation

    private static void AddTransform2D(this GameEntity entity, Vector2 position, float rotation)
    {
        entity.AddComponent(0, new Transform2DComponent { Position = position, Rotation = rotation });
    }

    private static void AddVelocity(this GameEntity entity, Vector2 linear, float angular)
    {
        entity.AddComponent(1, new VelocityComponent { Linear = linear, Angular = angular });
    }

    private static void AddMomentum(this GameEntity entity, Vector2 linear, float angular)
    {
        entity.AddComponent(2, new MomentumComponent { Linear = linear, Angular = angular });
    }

    private static void AddMass(this GameEntity entity, float mass_kg, float inertia_kgm2)
    {
        entity.AddComponent(3, new MassComponent { Mass_kg = mass_kg, Inertia_kgm2 = inertia_kgm2 });
    }

    private static void AddControlState(this GameEntity entity, float thrust, float strafe_x, float strafe_y, float yaw)
    {
        entity.AddComponent(4, new ControlStateComponent { Thrust = thrust, Strafe_X = strafe_x, Strafe_Y = strafe_y, Yaw_Input = yaw });
    }

    private static void AddFlightAssist(this GameEntity entity, bool enabled)
    {
        entity.AddComponent(5, new FlightAssistComponent { Enabled = enabled });
    }

    private static void AddShipConfig(this GameEntity entity, ShipConfig config)
    {
        entity.AddComponent(6, new ShipConfigComponent { Config = config });
    }

    private static void AddHealth(this GameEntity entity, float current, float max)
    {
        entity.AddComponent(7, new HealthComponent { Current_HP = current, Max_HP = max });
    }

    private static void AddPlayerOwned(this GameEntity entity, int playerId)
    {
        entity.AddComponent(8, new PlayerOwnedComponent { PlayerId = playerId });
    }
}
