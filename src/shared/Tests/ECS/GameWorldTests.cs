using NUnit.Framework;
using U2.Shared.ECS;

namespace U2.Shared.Tests.ECS;

[TestFixture]
public class GameWorldTests
{
    [Test]
    public void GameWorld_CanBeCreated()
    {
        var world = new GameWorld();
        Assert.That(world, Is.Not.Null);
        Assert.That(world.Context, Is.Not.Null);
    }

    [Test]
    public void GameWorld_Initialize_DoesNotThrow()
    {
        var world = new GameWorld();
        Assert.DoesNotThrow(() => world.Initialize());
    }

    [Test]
    public void GameWorld_Execute_DoesNotThrow()
    {
        var world = new GameWorld();
        world.Initialize();
        
        Assert.DoesNotThrow(() => world.Execute());
    }

    [Test]
    public void GameWorld_CanExecuteMultipleTimes()
    {
        var world = new GameWorld();
        world.Initialize();

        for (int i = 0; i < 10; i++)
        {
            Assert.DoesNotThrow(() => world.Execute());
        }
    }

    [Test]
    public void GameWorld_Cleanup_DoesNotThrow()
    {
        var world = new GameWorld();
        world.Initialize();
        world.Execute();
        
        Assert.DoesNotThrow(() => world.Cleanup());
    }

    [Test]
    public void GameWorld_TearDown_DoesNotThrow()
    {
        var world = new GameWorld();
        world.Initialize();
        
        Assert.DoesNotThrow(() => world.TearDown());
    }
}
