using System.Net;
using Google.Protobuf;
using Microsoft.Extensions.Logging;
using U2.Shared.Proto;
using U2.Shared.ECS;

namespace U2.Server.Network;

/// <summary>
/// Processes incoming network messages and generates outgoing messages.
/// Bridges the network layer with the game world.
/// </summary>
public class MessageProcessor
{
    private readonly ILogger<MessageProcessor> _logger;
    private readonly ConnectionManager _connectionManager;
    private readonly GameWorld _gameWorld;
    private readonly UdpServer _server;

    public MessageProcessor(
        ILogger<MessageProcessor> logger,
        ConnectionManager connectionManager,
        GameWorld gameWorld,
        UdpServer server)
    {
        _logger = logger;
        _connectionManager = connectionManager;
        _gameWorld = gameWorld;
        _server = server;
    }

    /// <summary>
    /// Process a received message from a client.
    /// </summary>
    public void ProcessMessage(byte[] data, IPEndPoint endpoint)
    {
        try
        {
            var clientMessage = ClientMessageProto.Parser.ParseFrom(data);

            switch (clientMessage.MessageCase)
            {
                case ClientMessageProto.MessageOneofCase.ConnectionRequest:
                    HandleConnectionRequest(clientMessage.ConnectionRequest, endpoint);
                    break;

                case ClientMessageProto.MessageOneofCase.PlayerInput:
                    HandlePlayerInput(clientMessage.PlayerInput, endpoint);
                    break;

                default:
                    _logger.LogWarning("Unknown message type from {Endpoint}", endpoint);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message from {Endpoint}", endpoint);
        }
    }

    private void HandleConnectionRequest(ConnectionRequestProto request, IPEndPoint endpoint)
    {
        _logger.LogInformation("Connection request from {Endpoint}: {PlayerName} (version {Version})",
            endpoint, request.PlayerName, request.Version);

        // Get or create client connection
        var connection = _connectionManager.UpdateClient(endpoint);
        
        if (connection.IsAccepted)
        {
            _logger.LogWarning("Client {ClientId} already accepted", connection.ClientId);
            return;
        }

        // Create entity for the player
        var entity = _gameWorld.CreatePlayerEntity(connection.ClientId);
        connection.EntityId = (uint)entity.creationIndex;
        connection.PlayerName = request.PlayerName;
        connection.IsAccepted = true;

        // Send connection accepted response
        var response = new ServerMessageProto
        {
            ConnectionAccepted = new ConnectionAcceptedProto
            {
                ClientId = connection.ClientId,
                EntityId = connection.EntityId.Value,
                ServerTimeMs = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            }
        };

        var responseData = response.ToByteArray();
        _server.SendAsync(responseData, endpoint).Wait();

        _logger.LogInformation("Connection accepted: ClientId={ClientId}, EntityId={EntityId}",
            connection.ClientId, connection.EntityId);
    }

    private void HandlePlayerInput(PlayerInputProto input, IPEndPoint endpoint)
    {
        var connection = _connectionManager.GetClient(endpoint);
        if (connection == null || !connection.IsAccepted)
        {
            _logger.LogWarning("Input from unaccepted client: {Endpoint}", endpoint);
            return;
        }

        if (input.ClientId != connection.ClientId)
        {
            _logger.LogWarning("Client ID mismatch: expected {Expected}, got {Actual}",
                connection.ClientId, input.ClientId);
            return;
        }

        // Apply input to the entity
        ApplyPlayerInput(connection.EntityId!.Value, input);
    }

    private void ApplyPlayerInput(uint entityId, PlayerInputProto input)
    {
        var entity = _gameWorld.GetEntityById((int)entityId);
        if (entity == null)
        {
            _logger.LogWarning("Entity {EntityId} not found for input", entityId);
            return;
        }

        // Update control state
        entity.ReplaceControlState(
            input.ControlState.Thrust,
            input.ControlState.StrafeX,
            input.ControlState.StrafeY,
            input.ControlState.YawInput
        );

        // Update flight assist mode
        if (entity.hasFlightAssist)
        {
            entity.ReplaceFlightAssist(input.FlightAssist);
        }

        _logger.LogTrace("Applied input for entity {EntityId}: thrust={Thrust}, FA={FA}",
            entityId, input.ControlState.Thrust, input.FlightAssist);
    }
}
