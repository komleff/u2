using System.Collections.Concurrent;
using System.Net;
using System.Net.WebSockets;
using Microsoft.Extensions.Logging;

namespace U2.Server.Network;

/// <summary>
/// WebSocket relay server for browser clients.
/// Translates between WebSocket (browser) and UDP (game server) protocols.
/// </summary>
public class WebSocketRelay : IDisposable
{
    private readonly ILogger<WebSocketRelay> _logger;
    private readonly UdpServer _udpServer;
    private readonly int _wsPort;
    private HttpListener? _httpListener;
    private CancellationTokenSource? _cts;
    private Task? _listenerTask;
    
    // Map WebSocket connections to virtual UDP endpoints
    private readonly ConcurrentDictionary<WebSocket, IPEndPoint> _wsToEndpoint = new();
    private readonly ConcurrentDictionary<IPEndPoint, WebSocket> _endpointToWs = new();
    private int _nextVirtualPort = 50000;

    public WebSocketRelay(ILogger<WebSocketRelay> logger, UdpServer udpServer, int wsPort = 8080)
    {
        _logger = logger;
        _udpServer = udpServer;
        _wsPort = wsPort;
    }

    /// <summary>
    /// Start the WebSocket relay server
    /// </summary>
    public void Start()
    {
        if (_httpListener != null)
        {
            _logger.LogWarning("WebSocket relay already running");
            return;
        }

        _cts = new CancellationTokenSource();
        _httpListener = new HttpListener();
        
        // Try to bind to wildcard first (works inside Docker), fall back to localhost if ACLs block it
        bool prefixAdded = false;
        var prefixes = new[]
        {
            $"http://+:{_wsPort}/",
            $"http://localhost:{_wsPort}/"
        };

        foreach (var prefix in prefixes)
        {
            try
            {
                _httpListener.Prefixes.Add(prefix);
                prefixAdded = true;
                _logger.LogDebug("Successfully added WebSocket listener prefix {Prefix}", prefix);
                break; // Use first successful prefix only
            }
            catch (HttpListenerException ex)
            {
                _logger.LogWarning(ex, "Failed to add WebSocket listener prefix {Prefix}, trying next...", prefix);
            }
        }

        if (!prefixAdded)
        {
            _logger.LogError("Failed to add any WebSocket listener prefix");
            throw new InvalidOperationException("Could not bind WebSocket listener to any address");
        }
        
        try
        {
            _httpListener.Start();
            _logger.LogInformation(
                "WebSocket relay listening on {Prefixes}", 
                string.Join(", ", _httpListener.Prefixes));
            
            _listenerTask = Task.Run(() => AcceptConnectionsAsync(_cts.Token));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start WebSocket relay");
            throw;
        }
    }

    /// <summary>
    /// Stop the WebSocket relay server
    /// </summary>
    public void Stop()
    {
        _cts?.Cancel();
        _httpListener?.Stop();
        _listenerTask?.Wait(TimeSpan.FromSeconds(5));
        
        // Close all WebSocket connections
        foreach (var ws in _wsToEndpoint.Keys.ToArray())
        {
            try
            {
                ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Server shutdown", CancellationToken.None).Wait();
            }
            catch
            {
                // Ignore errors during shutdown
            }
        }
        
        _wsToEndpoint.Clear();
        _endpointToWs.Clear();
        
        _logger.LogInformation("WebSocket relay stopped");
    }

    private async Task AcceptConnectionsAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var context = await _httpListener!.GetContextAsync();
                
                if (context.Request.IsWebSocketRequest)
                {
                    _ = Task.Run(async () => await HandleWebSocketAsync(context, cancellationToken));
                }
                else
                {
                    context.Response.StatusCode = 400;
                    context.Response.Close();
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting WebSocket connection");
            }
        }
    }

    private async Task HandleWebSocketAsync(HttpListenerContext context, CancellationToken cancellationToken)
    {
        WebSocket? webSocket = null;
        IPEndPoint? virtualEndpoint = null;
        
        try
        {
            var wsContext = await context.AcceptWebSocketAsync(null);
            webSocket = wsContext.WebSocket;
            
            // Create virtual UDP endpoint for this WebSocket connection
            virtualEndpoint = new IPEndPoint(IPAddress.Loopback, Interlocked.Increment(ref _nextVirtualPort));
            
            _wsToEndpoint[webSocket] = virtualEndpoint;
            _endpointToWs[virtualEndpoint] = webSocket;
            
            _logger.LogInformation("WebSocket connected: {RemoteEndPoint} -> Virtual {VirtualEndpoint}", 
                context.Request.RemoteEndPoint, virtualEndpoint);
            
            // Relay loop: WebSocket -> UDP
            var buffer = new byte[8192];
            while (webSocket.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);
                
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Client closed", CancellationToken.None);
                    break;
                }
                
                if (result.MessageType == WebSocketMessageType.Binary)
                {
                    var data = new byte[result.Count];
                    Array.Copy(buffer, data, result.Count);
                    
                    // Forward to UDP server as if from virtual endpoint
                    await ForwardToUdpAsync(data, virtualEndpoint);
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling WebSocket connection");
        }
        finally
        {
            if (webSocket != null && virtualEndpoint != null)
            {
                _wsToEndpoint.TryRemove(webSocket, out _);
                _endpointToWs.TryRemove(virtualEndpoint, out _);
                
                _logger.LogInformation("WebSocket disconnected: Virtual {VirtualEndpoint}", virtualEndpoint);
            }
        }
    }

    private async Task ForwardToUdpAsync(byte[] data, IPEndPoint virtualEndpoint)
    {
        try
        {
            // Simulate UDP message reception by invoking the same processing path
            // UdpServer's MessageReceived event will be triggered by MessageProcessor
            await _udpServer.ProcessReceivedDataAsync(data, virtualEndpoint);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error forwarding WebSocket message to UDP handler");
        }
    }

    /// <summary>
    /// Send data to a WebSocket client (called by UdpServer.SendAsync)
    /// </summary>
    public async Task SendToWebSocketAsync(byte[] data, IPEndPoint endpoint)
    {
        if (_endpointToWs.TryGetValue(endpoint, out var webSocket))
        {
            try
            {
                if (webSocket.State == WebSocketState.Open)
                {
                    await webSocket.SendAsync(
                        new ArraySegment<byte>(data), 
                        WebSocketMessageType.Binary, 
                        true, 
                        CancellationToken.None
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending to WebSocket {Endpoint}", endpoint);
            }
        }
    }

    public void Dispose()
    {
        Stop();
        _httpListener?.Close();
        _cts?.Dispose();
    }
}
