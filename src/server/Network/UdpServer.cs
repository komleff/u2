using System.Net;
using System.Net.Sockets;
using System.Linq;
using Microsoft.Extensions.Logging;
using U2.Shared.Network;

namespace U2.Server.Network;

/// <summary>
/// UDP server for handling game network communication.
/// Manages client connections and message routing.
/// </summary>
public class UdpServer : IDisposable
{
    private readonly UdpClient _socket;
    private readonly ILogger<UdpServer> _logger;
    private readonly ConnectionManager _connectionManager;
    private bool _isRunning;
    private CancellationTokenSource? _cancellationTokenSource;
    private Task? _receiveTask;
    private WebSocketRelay? _webSocketRelay; // M2.3 WebSocket relay integration

    public int Port { get; }
    public bool IsRunning => _isRunning;

    public UdpServer(int port, ILogger<UdpServer> logger)
    {
        Port = port;
        _logger = logger;
        _socket = new UdpClient(port);
        _connectionManager = new ConnectionManager(logger);
    }

    /// <summary>
    /// Start the UDP server and begin listening for messages.
    /// </summary>
    public void Start()
    {
        if (_isRunning)
        {
            _logger.LogWarning("UDP server already running on port {Port}", Port);
            return;
        }

        _cancellationTokenSource = new CancellationTokenSource();
        _isRunning = true;
        _receiveTask = Task.Run(() => ReceiveLoop(_cancellationTokenSource.Token));
        
        _logger.LogInformation("UDP server started on port {Port}", Port);
    }

    /// <summary>
    /// Stop the UDP server.
    /// </summary>
    public void Stop()
    {
        if (!_isRunning)
        {
            return;
        }

        _isRunning = false;
        _cancellationTokenSource?.Cancel();
        _receiveTask?.Wait(TimeSpan.FromSeconds(2));
        
        _logger.LogInformation("UDP server stopped");
    }

    /// <summary>
    /// Send data to a specific client endpoint.
    /// Routes to WebSocket relay for virtual endpoints (port 50000+).
    /// </summary>
    public async Task SendAsync(byte[] data, IPEndPoint endpoint)
    {
        try
        {
            // Check if this is a virtual endpoint from WebSocket relay (M2.3)
            if (_webSocketRelay != null && 
                endpoint.Address.Equals(IPAddress.Loopback) && 
                endpoint.Port >= 50000)
            {
                await _webSocketRelay.SendToWebSocketAsync(data, endpoint);
            }
            else
            {
                // Standard UDP send
                await _socket.SendAsync(data, data.Length, endpoint);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending data to {Endpoint}", endpoint);
        }
    }

    /// <summary>
    /// Broadcast data to all connected clients.
    /// </summary>
    public async Task BroadcastAsync(byte[] data)
    {
        var acceptedConnections = _connectionManager
            .GetAllConnections()
            .Where(c => c.IsAccepted);

        foreach (var connection in acceptedConnections)
        {
            await SendAsync(data, connection.Endpoint);
        }
    }

    /// <summary>
    /// Event raised when a message is received from a client.
    /// Handlers are async to support non-blocking processing.
    /// </summary>
    public event Func<byte[], IPEndPoint, Task>? MessageReceived;

    /// <summary>
    /// Manually trigger message processing (for WebSocket relay)
    /// </summary>
    internal async Task ProcessReceivedDataAsync(byte[] data, IPEndPoint endpoint)
    {
        _logger.LogTrace("Processing {Bytes} bytes from {Endpoint}", data.Length, endpoint);
        
        // Track this client
        _connectionManager.UpdateClient(endpoint);
        
        // Raise event for message processing
        if (MessageReceived is not null)
        {
            await MessageReceived.Invoke(data, endpoint);
        }
    }

    private async Task ReceiveLoop(CancellationToken cancellationToken)
    {
        _logger.LogDebug("Starting receive loop");

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var result = await _socket.ReceiveAsync(cancellationToken);
                var data = result.Buffer;
                var endpoint = result.RemoteEndPoint;

                await ProcessReceivedDataAsync(data, endpoint);
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in receive loop");
            }
        }

        _logger.LogDebug("Receive loop ended");
    }

    public ConnectionManager GetConnectionManager() => _connectionManager;

    /// <summary>
    /// Attach WebSocket relay for routing virtual endpoints (M2.3)
    /// </summary>
    public void AttachWebSocketRelay(WebSocketRelay relay)
    {
        _webSocketRelay = relay;
        _logger.LogInformation("WebSocket relay attached for virtual endpoint routing");
    }

    public void Dispose()
    {
        Stop();
        _cancellationTokenSource?.Dispose();
        _socket?.Dispose();
        GC.SuppressFinalize(this);
    }
}
