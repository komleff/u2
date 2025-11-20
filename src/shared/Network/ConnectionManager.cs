using System.Collections.Concurrent;
using System.Net;
using Microsoft.Extensions.Logging;

namespace U2.Shared.Network;

/// <summary>
/// Manages client connections and assigns client IDs.
/// </summary>
public class ConnectionManager
{
    private readonly ILogger _logger;
    private readonly ConcurrentDictionary<IPEndPoint, ClientConnection> _connections;
    private uint _nextClientId = 1;
    private readonly object _idLock = new();

    public ConnectionManager(ILogger logger)
    {
        _logger = logger;
        _connections = new ConcurrentDictionary<IPEndPoint, ClientConnection>();
    }

    /// <summary>
    /// Update the last seen time for a client, creating a new connection if needed.
    /// </summary>
    public ClientConnection UpdateClient(IPEndPoint endpoint)
    {
        return _connections.AddOrUpdate(
            endpoint,
            // Add new client
            ep =>
            {
                uint clientId;
                lock (_idLock)
                {
                    clientId = _nextClientId++;
                }
                var connection = new ClientConnection(clientId, ep);
                _logger.LogInformation("New client connected: {ClientId} from {Endpoint}", clientId, ep);
                return connection;
            },
            // Update existing client
            (ep, existing) =>
            {
                existing.UpdateLastSeen();
                return existing;
            }
        );
    }

    /// <summary>
    /// Get a client connection by endpoint.
    /// </summary>
    public ClientConnection? GetClient(IPEndPoint endpoint)
    {
        _connections.TryGetValue(endpoint, out var connection);
        return connection;
    }

    /// <summary>
    /// Get a client connection by client ID.
    /// </summary>
    public ClientConnection? GetClient(uint clientId)
    {
        return _connections.Values.FirstOrDefault(c => c.ClientId == clientId);
    }

    /// <summary>
    /// Get all active client endpoints.
    /// </summary>
    public IEnumerable<IPEndPoint> GetAllEndpoints()
    {
        return _connections.Keys.ToList();
    }

    /// <summary>
    /// Get all active client connections.
    /// </summary>
    public IEnumerable<ClientConnection> GetAllConnections()
    {
        return _connections.Values.ToList();
    }

    /// <summary>
    /// Remove disconnected clients that haven't been seen for the specified timeout.
    /// </summary>
    public List<ClientConnection> RemoveStaleConnections(TimeSpan timeout)
    {
        var removed = new List<ClientConnection>();
        var cutoffTime = DateTime.UtcNow - timeout;
        var staleEndpoints = _connections
            .Where(kvp => kvp.Value.LastSeenUtc < cutoffTime)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var endpoint in staleEndpoints)
        {
            if (_connections.TryRemove(endpoint, out var connection))
            {
                _logger.LogInformation("Removed stale client: {ClientId} from {Endpoint}", 
                    connection.ClientId, endpoint);
                removed.Add(connection);
            }
        }

        return removed;
    }
}

/// <summary>
/// Represents a connected client.
/// </summary>
public class ClientConnection
{
    public uint ClientId { get; }
    public IPEndPoint Endpoint { get; }
    public DateTime LastSeenUtc { get; private set; }
    public uint? EntityId { get; set; }
    public bool IsAccepted { get; set; }
    public string PlayerName { get; set; } = "";
    public uint LastProcessedSequence { get; set; } = 0; // M2.3: Last input sequence processed (for reconciliation)

    public ClientConnection(uint clientId, IPEndPoint endpoint)
    {
        ClientId = clientId;
        Endpoint = endpoint;
        LastSeenUtc = DateTime.UtcNow;
        IsAccepted = false;
    }

    public void UpdateLastSeen()
    {
        LastSeenUtc = DateTime.UtcNow;
    }
}
