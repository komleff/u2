using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;
using U2.Shared.ECS;
using U2.Shared.Math;
using U2.Shared.Ships;

namespace U2.Shared.Tests.ECS;

/// <summary>
/// M0.3 DoD: Benchmark processing 10,000 entities < 16ms
/// Run with: dotnet run -c Release --project src/shared/Tests/Benchmarks/EcsBenchmarks.cs
/// </summary>
[MemoryDiagnoser]
[SimpleJob(warmupCount: 3, iterationCount: 10)]
public class EcsBenchmarks
{
    private GameWorld? _world;
    private ShipConfig? _shipConfig;

    [Params(1000, 5000, 10000)]
    public int EntityCount { get; set; }

    [GlobalSetup]
    public void Setup()
    {
        _shipConfig = new ShipConfig
        {
            Meta = new ShipMeta { Id = "benchmark_ship", Name = "Benchmark Ship" },
            Classification = new ShipClassification { Size = "light", Type = "fighter" },
            Geometry = new ShipGeometry { Length_m = 18f, Width_m = 13f, Height_m = 5f },
            Hull = new ShipHull { DryMass_t = 55f, Hull_HP = 5500f },
            Physics = new ShipPhysics
            {
                LinearAcceleration_mps2 = new LinearAcceleration 
                { 
                    Forward = 80f, 
                    Reverse = 60f,
                    Left = 40f,
                    Right = 40f,
                    Up = 40f,
                    Down = 40f
                },
                AngularAcceleration_radps2 = new AngularAcceleration { Yaw = 2.0f }
            },
            FlightAssistLimits = new FlightAssistLimits
            {
                LinearVelocity_mps = new LinearVelocityLimits 
                { 
                    Forward = 200f, 
                    Reverse = 100f,
                    Strafe = 100f
                },
                AngularVelocity_radps = new AngularVelocityLimits { Yaw = 1.5f }
            }
        };

        _world = new GameWorld();
        _world.Initialize();

        // Create entities spread across space
        for (int i = 0; i < EntityCount; i++)
        {
            float x = (i % 100) * 1000f;
            float y = (i / 100) * 1000f;
            EntityFactory.CreateShip(_world.Context, _shipConfig, new Vector2(x, y));
        }
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        _world?.TearDown();
    }

    [Benchmark]
    public void ProcessAllSystems()
    {
        _world!.Execute();
    }

    [Benchmark]
    public void CreateEntity()
    {
        var entity = EntityFactory.CreateShip(
            _world!.Context,
            _shipConfig!,
            new Vector2(0f, 0f)
        );
        entity.Destroy();
    }

    [Benchmark]
    public void DestroyEntity()
    {
        var entity = EntityFactory.CreateShip(
            _world!.Context,
            _shipConfig!,
            new Vector2(0f, 0f)
        );
        entity.Destroy();
    }
}

/// <summary>
/// NUnit test wrapper for benchmark - verifies 10k entities processed < 16ms
/// </summary>
[NUnit.Framework.TestFixture]
public class EcsBenchmarkTests
{
    [NUnit.Framework.Test]
    [NUnit.Framework.Category("Performance")]
    public void Benchmark_10kEntities_ProcessesUnder16ms()
    {
        var world = new GameWorld();
        world.Initialize();

        var shipConfig = new ShipConfig
        {
            Meta = new ShipMeta { Id = "test", Name = "Test" },
            Classification = new ShipClassification { Size = "light", Type = "fighter" },
            Geometry = new ShipGeometry { Length_m = 18f, Width_m = 13f, Height_m = 5f },
            Hull = new ShipHull { DryMass_t = 55f, Hull_HP = 5500f },
            Physics = new ShipPhysics
            {
                LinearAcceleration_mps2 = new LinearAcceleration { Forward = 80f, Reverse = 60f }
            }
        };

        // Create 10,000 entities
        for (int i = 0; i < 10000; i++)
        {
            EntityFactory.CreateShip(world.Context, shipConfig, new Vector2(i * 100f, 0f));
        }

        // Warm up
        world.Execute();

        // Measure
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        world.Execute();
        stopwatch.Stop();

        world.TearDown();

        // M0.3 DoD requirement: < 16ms for 10k entities
        NUnit.Framework.Assert.That(
            stopwatch.ElapsedMilliseconds,
            NUnit.Framework.Is.LessThan(16),
            $"Expected < 16ms, got {stopwatch.ElapsedMilliseconds}ms"
        );
    }
}
