using NUnit.Framework;
using U2.Shared.Network;
using System.Net;
using Microsoft.Extensions.Logging.Abstractions;

namespace U2.Shared.Tests.Network;

[TestFixture]
public class ConnectionManagerTests
{
    private ConnectionManager _connectionManager = null!;

    [SetUp]
    public void Setup()
    {
        _connectionManager = new ConnectionManager(NullLogger.Instance);
    }

    [Test]
    public void UpdateClient_NewClient_AssignsClientId()
    {
        // Arrange
        var endpoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);

        // Act
        var connection = _connectionManager.UpdateClient(endpoint);

        // Assert
        Assert.That(connection, Is.Not.Null);
        Assert.That(connection.ClientId, Is.EqualTo(1u));
        Assert.That(connection.Endpoint, Is.EqualTo(endpoint));
        Assert.That(connection.IsAccepted, Is.False);
    }

    [Test]
    public void UpdateClient_ExistingClient_UpdatesLastSeen()
    {
        // Arrange
        var endpoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);
        var firstConnection = _connectionManager.UpdateClient(endpoint);
        var firstSeenTime = firstConnection.LastSeenUtc;

        // Wait a bit to ensure time difference
        System.Threading.Thread.Sleep(10);

        // Act
        var secondConnection = _connectionManager.UpdateClient(endpoint);

        // Assert
        Assert.That(secondConnection.ClientId, Is.EqualTo(firstConnection.ClientId));
        Assert.That(secondConnection.LastSeenUtc, Is.GreaterThan(firstSeenTime));
    }

    [Test]
    public void UpdateClient_MultipleClients_AssignsUniqueIds()
    {
        // Arrange
        var endpoint1 = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);
        var endpoint2 = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12346);
        var endpoint3 = new IPEndPoint(IPAddress.Parse("192.168.1.1"), 12345);

        // Act
        var connection1 = _connectionManager.UpdateClient(endpoint1);
        var connection2 = _connectionManager.UpdateClient(endpoint2);
        var connection3 = _connectionManager.UpdateClient(endpoint3);

        // Assert
        Assert.That(connection1.ClientId, Is.EqualTo(1u));
        Assert.That(connection2.ClientId, Is.EqualTo(2u));
        Assert.That(connection3.ClientId, Is.EqualTo(3u));
    }

    [Test]
    public void GetClient_ByEndpoint_ReturnsCorrectConnection()
    {
        // Arrange
        var endpoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);
        var originalConnection = _connectionManager.UpdateClient(endpoint);

        // Act
        var retrievedConnection = _connectionManager.GetClient(endpoint);

        // Assert
        Assert.That(retrievedConnection, Is.Not.Null);
        Assert.That(retrievedConnection!.ClientId, Is.EqualTo(originalConnection.ClientId));
    }

    [Test]
    public void GetClient_ByClientId_ReturnsCorrectConnection()
    {
        // Arrange
        var endpoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);
        var originalConnection = _connectionManager.UpdateClient(endpoint);

        // Act
        var retrievedConnection = _connectionManager.GetClient(originalConnection.ClientId);

        // Assert
        Assert.That(retrievedConnection, Is.Not.Null);
        Assert.That(retrievedConnection!.Endpoint, Is.EqualTo(endpoint));
    }

    [Test]
    public void GetAllEndpoints_ReturnsAllConnectedEndpoints()
    {
        // Arrange
        var endpoint1 = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);
        var endpoint2 = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12346);
        _connectionManager.UpdateClient(endpoint1);
        _connectionManager.UpdateClient(endpoint2);

        // Act
        var endpoints = _connectionManager.GetAllEndpoints().ToList();

        // Assert
        Assert.That(endpoints, Has.Count.EqualTo(2));
        Assert.That(endpoints, Contains.Item(endpoint1));
        Assert.That(endpoints, Contains.Item(endpoint2));
    }

    [Test]
    public void RemoveStaleConnections_RemovesOldConnections()
    {
        // Arrange
        var endpoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);
        _connectionManager.UpdateClient(endpoint);

        // Act
        _connectionManager.RemoveStaleConnections(TimeSpan.Zero);
        var retrievedConnection = _connectionManager.GetClient(endpoint);

        // Assert
        Assert.That(retrievedConnection, Is.Null);
    }

    [Test]
    public void RemoveStaleConnections_KeepsRecentConnections()
    {
        // Arrange
        var endpoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);
        _connectionManager.UpdateClient(endpoint);

        // Act
        _connectionManager.RemoveStaleConnections(TimeSpan.FromMinutes(1));
        var retrievedConnection = _connectionManager.GetClient(endpoint);

        // Assert
        Assert.That(retrievedConnection, Is.Not.Null);
    }

    [Test]
    public void ClientConnection_CanSetEntityId()
    {
        // Arrange
        var endpoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 12345);
        var connection = _connectionManager.UpdateClient(endpoint);

        // Act
        connection.EntityId = 42;
        connection.IsAccepted = true;
        connection.PlayerName = "TestPlayer";

        // Assert
        Assert.That(connection.EntityId, Is.EqualTo(42u));
        Assert.That(connection.IsAccepted, Is.True);
        Assert.That(connection.PlayerName, Is.EqualTo("TestPlayer"));
    }
}
