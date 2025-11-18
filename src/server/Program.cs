using Microsoft.Extensions.Logging;
using U2.Shared.Config;
using U2.Shared.ECS;

namespace U2.Server;

public class Program
{
    public static void Main(string[] args)
    {
        using var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddConsole();
        });

        var logger = loggerFactory.CreateLogger<Program>();
        logger.LogInformation("U2 Server starting...");
        logger.LogInformation("M0.1 - Repository and build structure initialized");
        logger.LogInformation("M1 - Initializing relativistic physics and collision systems");
        
        // M1: Initialize GameWorld with physics systems
        var location = LocationConfig.CombatZone(); // c' = 5000 m/s
        const float targetFPS = 60.0f;
        const float deltaTime = 1.0f / targetFPS;
        
        logger.LogInformation("Location: {LocationName}, c' = {SpeedOfLight} m/s", 
            location.Name, location.CPrime_mps);
        logger.LogInformation("Physics tick rate: {FPS} FPS (dt = {DeltaTime:F4}s)", 
            targetFPS, deltaTime);
        
        var world = new GameWorld(
            speedOfLight_mps: location.CPrime_mps,
            deltaTime: deltaTime,
            enableCollisions: true
        );
        
        logger.LogInformation("GameWorld initialized with systems: FlightAssist → Physics → Collision → Heat");
        
        // Initialize systems
        world.Initialize();
        logger.LogInformation("Systems initialized");
        
        // M1: Run a single physics tick as proof-of-concept
        // TODO M2: Replace with proper server loop with network updates
        logger.LogInformation("Running single physics tick (M1 demonstration)...");
        world.Execute();
        logger.LogInformation("Physics tick complete");
        
        // Cleanup
        world.Cleanup();
        world.TearDown();
        logger.LogInformation("GameWorld shutdown complete");
        
        // Dev mode: Wait for keypress before exit
        Console.WriteLine("Press any key to exit...");
        Console.ReadKey();
    }
}
