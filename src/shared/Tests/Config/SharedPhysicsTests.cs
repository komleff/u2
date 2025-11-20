using NUnit.Framework;
using U2.Shared.Config;

namespace U2.Shared.Tests.Config;

[TestFixture]
public class SharedPhysicsTests
{
    [Test]
    public void SharedPhysics_LoadsDefaults()
    {
        var data = SharedPhysics.Data;

        Assert.That(data.Physics.Forward_accel_mps2, Is.GreaterThan(0));
        Assert.That(data.Hull.Dry_mass_t, Is.EqualTo(10.0f).Within(0.001));
        Assert.That(data.Limits.Angular_speed_max_dps.Yaw, Is.EqualTo(80.0f).Within(0.01));
    }

    [Test]
    public void SharedPhysics_ToShipConfig_MapsValues()
    {
        var config = SharedPhysics.ToShipConfig();

        Assert.That(config.Hull.DryMass_t, Is.EqualTo(10.0f).Within(0.001));
        Assert.That(config.Physics.LinearAcceleration_mps2.Forward, Is.EqualTo(90.0f).Within(0.001));
        Assert.That(config.Physics.StrafeAcceleration_mps2.Lateral, Is.EqualTo(85.0f).Within(0.001));
        Assert.That(config.Physics.AngularAcceleration_dps2.Yaw, Is.EqualTo(200.0f).Within(0.01));
        Assert.That(config.FlightAssistLimits.LinearSpeedMax_mps.Forward, Is.EqualTo(260.0f).Within(0.01));
        Assert.That(config.FlightAssistLimits.AngularSpeedMax_dps.Yaw, Is.EqualTo(80.0f).Within(0.01));
    }
}
