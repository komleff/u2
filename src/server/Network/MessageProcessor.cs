using System.Net;
using Google.Protobuf;
using Microsoft.Extensions.Logging;
using U2.Shared.ECS;
using U2.Shared.ECS.Serialization;
using U2.Shared.Network;
using U2.Shared.Proto;

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
    public async Task ProcessMessage(byte[] data, IPEndPoint endpoint)
    {
        try
        {
            var clientMessage = ClientMessageProto.Parser.ParseFrom(data);

            switch (clientMessage.MessageCase)
            {
                case ClientMessageProto.MessageOneofCase.ConnectionRequest:
                    await HandleConnectionRequest(clientMessage.ConnectionRequest, endpoint);
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

    private async Task HandleConnectionRequest(ConnectionRequestProto request, IPEndPoint endpoint)
    {
        _logger.LogInformation("Connection request from {Endpoint}: {PlayerName} (version {Version})",
            endpoint, request.PlayerName, request.Version);

        // Get or create client connection
        var connection = _connectionManager.UpdateClient(endpoint);
        
        if (connection.IsAccepted)
        {
            if (connection.EntityId is null)
            {
                // Recreate entity if it was lost but connection persisted
                var recreated = _gameWorld.CreatePlayerEntity(connection.ClientId);
                connection.EntityId = (uint)recreated.creationIndex + 1;
            }
            await SendConnectionAcceptedAsync(connection, endpoint, isRetry: true);
            return;
        }

        // Create entity for the player
        var entity = _gameWorld.CreatePlayerEntity(connection.ClientId);
        // NOTE: Entitas creationIndex starts at 0, but client expects entityId > 0
        // Use creationIndex + 1 to ensure valid IDs (1, 2, 3, ...)
        connection.EntityId = (uint)entity.creationIndex + 1;
        connection.PlayerName = request.PlayerName;
        connection.IsAccepted = true;

        await SendConnectionAcceptedAsync(connection, endpoint);
    }

    private void HandlePlayerInput(PlayerInputProto input, IPEndPoint endpoint)
    {
        var connection = _connectionManager.GetClient(endpoint);
        if (connection == null || !connection.IsAccepted)
        {
            _logger.LogWarning("Input from unaccepted client: {Endpoint}", endpoint);
            return;
        }

        // Mark client as active for stale cleanup
        connection.UpdateLastSeen();

        if (input.ClientId != connection.ClientId)
        {
            _logger.LogWarning("Client ID mismatch: expected {Expected}, got {Actual}",
                connection.ClientId, input.ClientId);
            return;
        }

        // Apply input to the entity
        // NOTE: EntityId = creationIndex + 1, so we need to subtract 1
        var entityCreationIndex = (int)connection.EntityId!.Value - 1;
        var entity = _gameWorld.GetEntityById(entityCreationIndex);
        if (entity == null)
        {
            _logger.LogWarning("Entity {EntityId} (creationIndex={CreationIndex}) not found for input", 
                connection.EntityId, entityCreationIndex);
            return;
        }

        // Apply both control and flight assist using shared serializer helpers
        EntitySerializer.ApplyPlayerInput(entity, input);

        // Track last processed sequence number for reconciliation (M2.3)
        connection.LastProcessedSequence = input.SequenceNumber;

        _logger.LogTrace("Applied input for entity {EntityId}: seq={Sequence}, thrust={Thrust}, FA={FA}",
            connection.EntityId, input.SequenceNumber, input.ControlState.Thrust, input.FlightAssist);
    }

    private async Task SendConnectionAcceptedAsync(ClientConnection connection, IPEndPoint endpoint, bool isRetry = false)
    {
        if (connection.EntityId is null)
        {
            _logger.LogWarning("Cannot send acceptance for ClientId={ClientId}: missing EntityId", connection.ClientId);
            return;
        }

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
        await _server.SendAsync(responseData, endpoint);

        if (isRetry)
        {
            _logger.LogInformation("Re-sent connection accepted to {Endpoint}: ClientId={ClientId}, EntityId={EntityId}",
                endpoint, connection.ClientId, connection.EntityId);
        }
        else
        {
            _logger.LogInformation("Connection accepted: ClientId={ClientId}, EntityId={EntityId}",
                connection.ClientId, connection.EntityId);
        }
    }
}
