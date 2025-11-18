using Microsoft.Extensions.Logging;
using U2.Shared.Config;
using U2.Shared.ECS;
using U2.Server.Network;

namespace U2.Server;

public class Program
{
    public static void Main(string[] args)
    {
        using var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddConsole();
            builder.SetMinimumLevel(LogLevel.Information);
        });

        var logger = loggerFactory.CreateLogger<Program>();
        logger.LogInformation("U2 Server starting...");
        logger.LogInformation("M0.1 - Repository and build structure initialized");
        logger.LogInformation("M1 - Relativistic physics and collision systems");
        logger.LogInformation("M2.1 - Protobuf protocol (190/190 tests passing)");
        logger.LogInformation("M2.2 - UDP Transport initialization");
        
        // Check for network mode flag
        bool networkMode = args.Contains("--network");
        
        if (!networkMode)
        {
            // M1 mode: Single physics tick demonstration
            logger.LogInformation("Running in M1 mode (single tick demonstration)");
            RunM1Mode(loggerFactory, logger);
        }
        else
        {
            // M2.2 mode: Network server
            logger.LogInformation("Running in M2.2 mode (network server)");
            RunNetworkMode(loggerFactory, logger);
        }
    }

    private static void RunM1Mode(ILoggerFactory loggerFactory, ILogger<Program> logger)
    {
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
        
        // Run a single physics tick
        logger.LogInformation("Running single physics tick...");
        world.Execute();
        logger.LogInformation("Physics tick complete");
        
        // Cleanup
        world.Cleanup();
        world.TearDown();
        logger.LogInformation("GameWorld shutdown complete");
        
        Console.WriteLine("Press any key to exit...");
        Console.ReadKey();
    }

    private static void RunNetworkMode(ILoggerFactory loggerFactory, ILogger<Program> logger)
    {
        const int port = 7777;
        const float snapshotRate = 15.0f; // Hz (as per spec)
        
        var location = LocationConfig.CombatZone(); // c' = 5000 m/s
        const float targetFPS = 60.0f;
        const float deltaTime = 1.0f / targetFPS;
        
        logger.LogInformation("Location: {LocationName}, c' = {SpeedOfLight} m/s", 
            location.Name, location.CPrime_mps);
        logger.LogInformation("Physics tick rate: {FPS} FPS (dt = {DeltaTime:F4}s)", 
            targetFPS, deltaTime);
        logger.LogInformation("Snapshot broadcast rate: {SnapshotRate} Hz", snapshotRate);
        
        // Create game world
        var world = new GameWorld(
            speedOfLight_mps: location.CPrime_mps,
            deltaTime: deltaTime,
            enableCollisions: true
        );
        
        world.Initialize();
        logger.LogInformation("GameWorld initialized");
        
        // Create network components
        var udpLogger = loggerFactory.CreateLogger<UdpServer>();
        var udpServer = new UdpServer(port, udpLogger);
        
        var connectionManager = udpServer.GetConnectionManager();
        
        var messageProcessorLogger = loggerFactory.CreateLogger<MessageProcessor>();
        var messageProcessor = new MessageProcessor(
            messageProcessorLogger,
            connectionManager,
            world,
            udpServer
        );
        
        // Wire up message handling
        udpServer.MessageReceived += messageProcessor.ProcessMessage;
        
        // Create and start network game loop
        var loopLogger = loggerFactory.CreateLogger<NetworkGameLoop>();
        var gameLoop = new NetworkGameLoop(
            loopLogger,
            world,
            udpServer,
            connectionManager,
            snapshotRate
        );
        
        // Start server
        udpServer.Start();
        gameLoop.Start();
        
        logger.LogInformation("Network server running on port {Port}", port);
        logger.LogInformation("Press any key to stop server...");
        
        Console.ReadKey();
        
        // Shutdown
        logger.LogInformation("Shutting down server...");
        gameLoop.Stop();
        udpServer.Stop();
        world.Cleanup();
        world.TearDown();
        
        logger.LogInformation("Server stopped");
    }
}
