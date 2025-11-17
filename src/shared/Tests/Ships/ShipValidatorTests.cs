using NUnit.Framework;
using U2.Shared.Ships;

namespace U2.Shared.Tests.Ships;

[TestFixture]
public class ShipValidatorTests
{
    private ShipConfig CreateValidShip()
    {
        return new ShipConfig
        {
            Meta = new ShipMeta
            {
                Id = "test_ship",
                Name = "Test Ship",
                Manufacturer = "Test Corp",
                Version = "0.8.6"
            },
            Classification = new ShipClassification
            {
                Size = "light",
                Type = "fighter"
            },
            Geometry = new ShipGeometry
            {
                Length_m = 18.0f,
                Width_m = 13.0f,
                Height_m = 5.0f
            },
            Hull = new ShipHull
            {
                DryMass_t = 55.0f,
                Hull_HP = 5500.0f
            },
            Physics = new ShipPhysics
            {
                LinearAcceleration_mps2 = new LinearAcceleration
                {
                    Forward = 80.0f,
                    Reverse = 60.0f
                },
                StrafeAcceleration_mps2 = new StrafeAcceleration
                {
                    Lateral = 75.0f
                },
                AngularAcceleration_dps2 = new AngularAcceleration
                {
                    Pitch = 240.0f,
                    Yaw = 200.0f,
                    Roll = 325.0f
                }
            },
            FlightAssistLimits = new FlightAssistLimits
            {
                CrewGLimit = new CrewGLimit
                {
                    Linear_g = 10.0f
                },
                LinearSpeedMax_mps = new LinearSpeedMax
                {
                    Forward = 300.0f,
                    Reverse = 200.0f,
                    Lateral = 250.0f,
                    Vertical = 250.0f
                },
                AngularSpeedMax_dps = new AngularSpeedMax
                {
                    Pitch = 95.0f,
                    Yaw = 80.0f,
                    Roll = 130.0f
                }
            },
            Media = new ShipMedia
            {
                Sprite = new SpriteInfo
                {
                    Name = "test_ship.png"
                }
            }
        };
    }

    [Test]
    public void Validate_ValidShip_ReturnsTrue()
    {
        var ship = CreateValidShip();
        var result = ShipValidator.Validate(ship);
        
        Assert.That(result.IsValid, Is.True);
        Assert.That(result.Errors, Is.Empty);
    }

    [Test]
    public void Validate_InvalidSize_ReturnsFalse()
    {
        var ship = CreateValidShip();
        ship.Classification.Size = "invalid_size";
        
        var result = ShipValidator.Validate(ship);
        
        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Contains("Invalid size"));
    }

    [Test]
    public void Validate_NegativeGeometry_ReturnsFalse()
    {
        var ship = CreateValidShip();
        ship.Geometry.Length_m = -10.0f;
        
        var result = ShipValidator.Validate(ship);
        
        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Contains("Geometry dimensions must be positive"));
    }

    [Test]
    public void Validate_ZeroAcceleration_ReturnsFalse()
    {
        var ship = CreateValidShip();
        ship.Physics.LinearAcceleration_mps2.Forward = 0.0f;
        
        var result = ShipValidator.Validate(ship);
        
        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Contains("Forward acceleration must be positive"));
    }

    [Test]
    public void Validate_ReverseExceedsForward_GeneratesWarning()
    {
        var ship = CreateValidShip();
        ship.Physics.LinearAcceleration_mps2.Reverse = 100.0f;
        ship.Physics.LinearAcceleration_mps2.Forward = 80.0f;
        
        var result = ShipValidator.Validate(ship);
        
        Assert.That(result.Warnings, Has.Some.Contains("Reverse acceleration exceeds forward acceleration"));
    }

    [Test]
    public void Validate_GLimitOutOfRange_GeneratesWarning()
    {
        var ship = CreateValidShip();
        ship.Classification.Size = "light";
        ship.FlightAssistLimits.CrewGLimit.Linear_g = 20.0f; // Too high for light ship
        
        var result = ShipValidator.Validate(ship);
        
        Assert.That(result.Warnings, Has.Some.Contains("G-limit"));
    }

    [Test]
    public void CollisionRadius_CalculatesCorrectly()
    {
        var ship = CreateValidShip();
        float expectedRadius = MathF.Sqrt(18.0f * 18.0f + 13.0f * 13.0f) / 2.0f;
        
        Assert.That(ship.Geometry.CollisionRadius_m, Is.EqualTo(expectedRadius).Within(0.01f));
    }
}
