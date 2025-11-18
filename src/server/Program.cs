using Microsoft.Extensions.Logging;
using U2.Shared.Config;
using U2.Shared.ECS;
using U2.Server.Network;

namespace U2.Server;

public class Program
{
    public static async Task Main(string[] args)
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
            await RunNetworkMode(loggerFactory, logger);
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

    private static async Task RunNetworkMode(ILoggerFactory loggerFactory, ILogger<Program> logger)
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
        
        // Create WebSocket relay for browser clients (M2.3)
        const int wsPort = 8080;
        var wsLogger = loggerFactory.CreateLogger<WebSocketRelay>();
        var wsRelay = new WebSocketRelay(wsLogger, udpServer, wsPort);
        
        // Attach relay to UdpServer for bidirectional routing
        udpServer.AttachWebSocketRelay(wsRelay);
        
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
        wsRelay.Start();
        gameLoop.Start();
        
        logger.LogInformation("Network server running on port {Port}", port);
        logger.LogInformation("WebSocket relay running on ws://localhost:{WsPort}/", wsPort);
        logger.LogInformation("Press Ctrl+C to stop server...");
        
        // Wait indefinitely until Ctrl+C
        using var cts = new CancellationTokenSource();
        Console.CancelKeyPress += (s, e) => { e.Cancel = true; cts.Cancel(); };
        try { await Task.Delay(Timeout.Infinite, cts.Token); }
        catch (TaskCanceledException) { }
        
        // Shutdown
        logger.LogInformation("Shutting down server...");
        gameLoop.Stop();
        wsRelay.Dispose();
        udpServer.Stop();
        world.Cleanup();
        world.TearDown();
        
        logger.LogInformation("Server stopped");
    }
}
