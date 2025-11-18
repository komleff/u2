using Google.Protobuf;
using Microsoft.Extensions.Logging;
using U2.Shared.Proto;
using U2.Shared.ECS;
using U2.Shared.ECS.Serialization;
using U2.Shared.Network;

namespace U2.Server.Network;

/// <summary>
/// Manages the server game loop with network updates.
/// Broadcasts world snapshots at fixed intervals.
/// </summary>
public class NetworkGameLoop
{
    private readonly ILogger<NetworkGameLoop> _logger;
    private readonly GameWorld _gameWorld;
    private readonly UdpServer _server;
    private readonly ConnectionManager _connectionManager;
    
    private readonly float _snapshotRate; // Hz
    private readonly float _snapshotInterval; // seconds
    private uint _currentTick;
    
    private bool _isRunning;
    private CancellationTokenSource? _cancellationTokenSource;
    private Task? _loopTask;

    public NetworkGameLoop(
        ILogger<NetworkGameLoop> logger,
        GameWorld gameWorld,
        UdpServer server,
        ConnectionManager connectionManager,
        float snapshotRate = 15.0f)
    {
        _logger = logger;
        _gameWorld = gameWorld;
        _server = server;
        _connectionManager = connectionManager;
        _snapshotRate = snapshotRate;
        _snapshotInterval = 1.0f / snapshotRate;
        _currentTick = 0;
    }

    /// <summary>
    /// Start the game loop.
    /// </summary>
    public void Start()
    {
        if (_isRunning)
        {
            _logger.LogWarning("Game loop already running");
            return;
        }

        _cancellationTokenSource = new CancellationTokenSource();
        _isRunning = true;
        _loopTask = Task.Run(() => GameLoopAsync(_cancellationTokenSource.Token));
        
        _logger.LogInformation("Game loop started at {SnapshotRate} Hz (interval: {Interval:F4}s)",
            _snapshotRate, _snapshotInterval);
    }

    /// <summary>
    /// Stop the game loop.
    /// </summary>
    public void Stop()
    {
        if (!_isRunning)
        {
            return;
        }

        _isRunning = false;
        _cancellationTokenSource?.Cancel();
        _loopTask?.Wait(TimeSpan.FromSeconds(5));
        
        _logger.LogInformation("Game loop stopped");
    }

    private async Task GameLoopAsync(CancellationToken cancellationToken)
    {
        var intervalMs = (int)(_snapshotInterval * 1000);
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var nextTickTime = stopwatch.Elapsed.TotalSeconds;

        _logger.LogDebug("Starting game loop");

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var frameStart = stopwatch.Elapsed.TotalSeconds;

                // Execute game world tick
                _gameWorld.Execute();
                _currentTick++;

                // Broadcast world snapshot to all clients
                await BroadcastWorldSnapshot();

                // Calculate sleep time to maintain fixed rate
                nextTickTime += _snapshotInterval;
                var sleepTime = nextTickTime - stopwatch.Elapsed.TotalSeconds;
                
                if (sleepTime > 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(sleepTime), cancellationToken);
                }
                else
                {
                    // Running behind schedule
                    _logger.LogWarning("Game loop running behind: {Behind:F4}s", -sleepTime);
                    nextTickTime = stopwatch.Elapsed.TotalSeconds;
                }
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in game loop");
            }
        }

        _logger.LogDebug("Game loop ended");
    }

    private async Task BroadcastWorldSnapshot()
    {
        try
        {
            var snapshot = CreateWorldSnapshot();
            var message = new ServerMessageProto
            {
                WorldSnapshot = snapshot
            };

            var data = message.ToByteArray();
            await _server.BroadcastAsync(data);

            _logger.LogTrace("Broadcasted snapshot tick {Tick} with {EntityCount} entities",
                snapshot.Tick, snapshot.Entities.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting world snapshot");
        }
    }

    private WorldSnapshotProto CreateWorldSnapshot()
    {
        var timestampMs = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        // M2.3: Provide last processed sequence numbers for reconciliation
        return EntitySerializer.CreateWorldSnapshot(
            _gameWorld.Context, 
            _currentTick, 
            timestampMs,
            entityId => {
                var connection = _connectionManager.GetAllConnections()
                    .FirstOrDefault(c => c.EntityId == (uint)entityId);
                return connection?.LastProcessedSequence ?? 0;
            });
    }

    public uint GetCurrentTick() => _currentTick;
}
