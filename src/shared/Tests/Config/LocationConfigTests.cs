using NUnit.Framework;
using U2.Shared.Config;

namespace U2.Shared.Tests.Config;

[TestFixture]
public class LocationConfigTests
{
    [Test]
    public void DefaultConstructor_SetsDefaultValues()
    {
        var config = new LocationConfig();
        
        Assert.That(config.CPrime_mps, Is.EqualTo(5000.0f));
        Assert.That(config.Name, Is.EqualTo("Test Arena"));
    }

    [Test]
    public void TestArena_HasSlowLight()
    {
        var config = LocationConfig.TestArena();
        
        Assert.That(config.CPrime_mps, Is.EqualTo(1000.0f));
        Assert.That(config.Name, Is.EqualTo("Test Arena"));
    }

    [Test]
    public void CombatZone_HasMediumLight()
    {
        var config = LocationConfig.CombatZone();
        
        Assert.That(config.CPrime_mps, Is.EqualTo(5000.0f));
        Assert.That(config.Name, Is.EqualTo("Combat Zone"));
    }

    [Test]
    public void OpenSpace_HasFastLight()
    {
        var config = LocationConfig.OpenSpace();
        
        Assert.That(config.CPrime_mps, Is.EqualTo(10000.0f));
        Assert.That(config.Name, Is.EqualTo("Open Space"));
    }

    [Test]
    public void CPrime_CanBeModified()
    {
        var config = new LocationConfig();
        config.CPrime_mps = 7500.0f;
        
        Assert.That(config.CPrime_mps, Is.EqualTo(7500.0f));
    }
}
