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
    
    private readonly float _physicsRate; // Hz
    private readonly float _physicsInterval; // seconds
    private readonly float _snapshotRate; // Hz
    private readonly float _snapshotInterval; // seconds
    private uint _currentTick;
    // Keep connections alive until they exceed the stale timeout
    private readonly TimeSpan _staleTimeout = TimeSpan.FromSeconds(60);
    private readonly TimeSpan _staleCheckInterval = TimeSpan.FromSeconds(1);
    private double _nextCleanupTime;
    private double _nextPhysicsTime;
    private double _nextSnapshotTime;
    
    private bool _isRunning;
    private CancellationTokenSource? _cancellationTokenSource;
    private Task? _loopTask;

    public NetworkGameLoop(
        ILogger<NetworkGameLoop> logger,
        GameWorld gameWorld,
        UdpServer server,
        ConnectionManager connectionManager,
        float snapshotRate = 15.0f,
        float physicsRate = 30.0f)
    {
        _logger = logger;
        _gameWorld = gameWorld;
        _server = server;
        _connectionManager = connectionManager;
        _physicsRate = physicsRate;
        _physicsInterval = 1.0f / physicsRate;
        _snapshotRate = snapshotRate;
        _snapshotInterval = 1.0f / snapshotRate;
        _currentTick = 0;
        _nextCleanupTime = 0;
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
        
        _logger.LogInformation(
            "Game loop started: physics {PhysicsRate} Hz (dt={PhysicsDt:F4}s), snapshots {SnapshotRate} Hz (interval: {SnapshotDt:F4}s)",
            _physicsRate, _physicsInterval, _snapshotRate, _snapshotInterval);
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
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var now = stopwatch.Elapsed.TotalSeconds;
        _nextPhysicsTime = now;
        _nextSnapshotTime = now + _snapshotInterval;
        _nextCleanupTime = now + _staleCheckInterval.TotalSeconds;

        _logger.LogDebug("Starting game loop");

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                now = stopwatch.Elapsed.TotalSeconds;

                // Execute fixed-step physics as many times as needed to catch up
                while (now >= _nextPhysicsTime && !cancellationToken.IsCancellationRequested)
                {
                    _gameWorld.Execute();
                    _currentTick++;
                    _nextPhysicsTime += _physicsInterval;
                }

                // Broadcast world snapshot on its own cadence
                if (now >= _nextSnapshotTime)
                {
                    await BroadcastWorldSnapshot();
                    _nextSnapshotTime += _snapshotInterval;
                }

                // Periodic cleanup of stale connections/entities
                if (now >= _nextCleanupTime)
                {
                    CleanupStaleConnections();
                    _nextCleanupTime += _staleCheckInterval.TotalSeconds;
                }

                // Sleep until the next deadline to avoid busy loop
                var nextDeadline = Math.Min(_nextPhysicsTime, _nextSnapshotTime);
                var sleepSeconds = nextDeadline - stopwatch.Elapsed.TotalSeconds;
                if (sleepSeconds > 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(sleepSeconds), cancellationToken);
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
        // NOTE: entityId parameter is entity.creationIndex, but connection.EntityId = creationIndex + 1
        return EntitySerializer.CreateWorldSnapshot(
            _gameWorld.Context, 
            _currentTick, 
            timestampMs,
            entityCreationIndex => {
                var entityId = (uint)entityCreationIndex + 1; // Convert creationIndex to EntityId
                var connection = _connectionManager.GetAllConnections()
                    .FirstOrDefault(c => c.EntityId == entityId);
                return connection?.LastProcessedSequence ?? 0;
            });
    }

    /// <summary>
    /// Remove stale connections and destroy their entities to avoid ghost ships.
    /// </summary>
    private void CleanupStaleConnections()
    {
        var removed = _connectionManager.RemoveStaleConnections(_staleTimeout);
        if (removed.Count == 0)
        {
            return;
        }

        foreach (var connection in removed)
        {
            if (connection.EntityId.HasValue)
            {
                var entityIndex = (int)connection.EntityId.Value - 1;
                var entity = _gameWorld.GetEntityById(entityIndex);
                entity?.Destroy();
            }
        }

        _logger.LogInformation("Cleaned up {Count} stale connections", removed.Count);
    }

    public uint GetCurrentTick() => _currentTick;
}

