using Entitas;
using U2.Shared.Math;

namespace U2.Shared.ECS.Systems;

/// <summary>
/// Collision detection and response system
/// Implements M1.2: Simple elastic collisions with damage
/// </summary>
public class CollisionSystem : IExecuteSystem
{
    private readonly GameContext _context;
    private readonly float _coefficientOfRestitution = 0.5f; // Damped bounces
    private readonly float _damageFactorBase = 0.0001f; // Base damage per (kg·m/s) of momentum transfer

    public CollisionSystem(GameContext context, float coefficientOfRestitution = 0.5f)
    {
        _context = context;
        _coefficientOfRestitution = coefficientOfRestitution;
    }

    public void Execute()
    {
        var entities = _context.GetEntities(GameMatcher.AllOf(
            GameMatcher.Transform2D,
            GameMatcher.Velocity,
            GameMatcher.Mass,
            GameMatcher.ShipConfig,
            GameMatcher.Health
        ));

        // O(n²) collision detection - add broad-phase optimization for large entity counts
        for (int i = 0; i < entities.Length; i++)
        {
            var entityA = entities[i];
            
            // Skip destroyed ships
            if (entityA.health.Current_HP <= 0)
                continue;

            var posA = entityA.transform2D.Position;
            var radiusA = entityA.shipConfig.Config.Geometry.CollisionRadius_m;

            for (int j = i + 1; j < entities.Length; j++)
            {
                var entityB = entities[j];
                
                // Skip destroyed ships
                if (entityB.health.Current_HP <= 0)
                    continue;

                // Broad-phase: Quick distance check before detailed collision
                var posB = entityB.transform2D.Position;
                var radiusB = entityB.shipConfig.Config.Geometry.CollisionRadius_m;
                var minDistance = radiusA + radiusB;
                
                // Quick squared distance check (avoids sqrt)
                var deltaX = posB.X - posA.X;
                var deltaY = posB.Y - posA.Y;
                var distanceSq = deltaX * deltaX + deltaY * deltaY;
                var minDistanceSq = minDistance * minDistance;
                
                if (distanceSq < minDistanceSq)
                {
                    // Only do expensive collision resolution if actually colliding
                    var distance = MathF.Sqrt(distanceSq);
                    var delta = new Vector2(deltaX, deltaY);
                    ResolveCollision(entityA, entityB, delta, distance, minDistance);
                }
            }
        }
    }

    private void ResolveCollision(GameEntity entityA, GameEntity entityB, Vector2 delta, float distance, float minDistance)
    {
        // Normal vector from A to B
        var normal = delta.Normalized;

        // Get velocities and masses
        var velA = entityA.velocity.Linear;
        var velB = entityB.velocity.Linear;
        var massA = entityA.mass.Mass_kg;
        var massB = entityB.mass.Mass_kg;

        // Relative velocity
        var relativeVel = velB - velA;

        // Relative velocity along collision normal
        var velAlongNormal = Vector2.Dot(relativeVel, normal);

        // Do not resolve if velocities are separating
        if (velAlongNormal > 0)
            return;

        // Calculate impulse scalar using coefficient of restitution
        var impulseScalar = -(1 + _coefficientOfRestitution) * velAlongNormal;
        impulseScalar /= (1 / massA + 1 / massB);

        // Apply impulse
        var impulse = normal * impulseScalar;
        
        // Update velocities
        var newVelA = velA - impulse / massA;
        var newVelB = velB + impulse / massB;

        entityA.ReplaceVelocity(newVelA, entityA.velocity.Angular);
        entityB.ReplaceVelocity(newVelB, entityB.velocity.Angular);

        // Update momentum to match new velocities (simplified - not relativistic for now)
        entityA.ReplaceMomentum(newVelA * massA, entityA.momentum.Angular);
        entityB.ReplaceMomentum(newVelB * massB, entityB.momentum.Angular);

        // Calculate damage based on impulse magnitude and relative velocity
        // Higher relative velocity = more damage (quadratic scaling with speed)
        var impulseMagnitude = impulse.Magnitude;
        var relativeSpeed = MathF.Abs(velAlongNormal);
        var velocitySquared = relativeSpeed * relativeSpeed;
        var damageA = impulseMagnitude * _damageFactorBase * (1.0f + velocitySquared / 100.0f);
        var damageB = impulseMagnitude * _damageFactorBase * (1.0f + velocitySquared / 100.0f);

        // Apply damage to both ships
        var newHpA = MathF.Max(0, entityA.health.Current_HP - damageA);
        var newHpB = MathF.Max(0, entityB.health.Current_HP - damageB);

        entityA.ReplaceHealth(newHpA, entityA.health.Max_HP);
        entityB.ReplaceHealth(newHpB, entityB.health.Max_HP);

        // Separate overlapping ships
        var overlap = minDistance - distance;
        var separation = normal * (overlap / 2.0f);

        var newPosA = entityA.transform2D.Position - separation;
        var newPosB = entityB.transform2D.Position + separation;

        entityA.ReplaceTransform2D(newPosA, entityA.transform2D.Rotation);
        entityB.ReplaceTransform2D(newPosB, entityB.transform2D.Rotation);
    }
}
