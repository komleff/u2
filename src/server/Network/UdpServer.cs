using System.Net;
using System.Net.Sockets;
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
    /// </summary>
    public async Task SendAsync(byte[] data, IPEndPoint endpoint)
    {
        try
        {
            await _socket.SendAsync(data, data.Length, endpoint);
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
        var endpoints = _connectionManager.GetAllEndpoints();
        foreach (var endpoint in endpoints)
        {
            await SendAsync(data, endpoint);
        }
    }

    /// <summary>
    /// Event raised when a message is received from a client.
    /// Handlers are async to support non-blocking processing.
    /// </summary>
    public event Func<byte[], IPEndPoint, Task>? MessageReceived;

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

                _logger.LogTrace("Received {Bytes} bytes from {Endpoint}", data.Length, endpoint);

                // Track this client
                _connectionManager.UpdateClient(endpoint);

                // Raise event for message processing
                if (MessageReceived is not null)
                {
                    await MessageReceived.Invoke(data, endpoint);
                }
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

    public void Dispose()
    {
        Stop();
        _cancellationTokenSource?.Dispose();
        _socket?.Dispose();
        GC.SuppressFinalize(this);
    }
}
