namespace U2.Shared.Ships;

/// <summary>
/// Validates ship configurations according to v0.8.6 spec
/// </summary>
public static class ShipValidator
{
    private const float G_ACCELERATION = 9.81f; // m/s²
    private const float TOLERANCE = 0.10f; // 10% tolerance for thrust formula

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public static ValidationResult Validate(ShipConfig ship)
    {
        var result = new ValidationResult { IsValid = true };

        // 1. Validate classification
        ValidateClassification(ship, result);

        // 2. Validate geometry
        ValidateGeometry(ship, result);

        // 3. Validate mass and thrust formula F = m * a
        ValidateThrustFormula(ship, result);

        // 4. Validate G-limits
        ValidateGLimits(ship, result);

        // 5. Validate FA:ON speed limits
        ValidateSpeedLimits(ship, result);

        return result;
    }

    private static void ValidateClassification(ShipConfig ship, ValidationResult result)
    {
        var validSizes = new[] { "snub", "light", "medium", "heavy", "capital" };
        if (!validSizes.Contains(ship.Classification.Size.ToLower()))
        {
            result.IsValid = false;
            result.Errors.Add($"Invalid size '{ship.Classification.Size}'. Must be one of: {string.Join(", ", validSizes)}");
        }
    }

    private static void ValidateGeometry(ShipConfig ship, ValidationResult result)
    {
        if (ship.Geometry.Length_m <= 0 || ship.Geometry.Width_m <= 0 || ship.Geometry.Height_m <= 0)
        {
            result.IsValid = false;
            result.Errors.Add("Geometry dimensions must be positive");
        }
    }

    private static void ValidateThrustFormula(ShipConfig ship, ValidationResult result)
    {
        // F = m * a (convert mass from tons to kg, thrust should match within tolerance)
        float mass_kg = ship.Hull.DryMass_t * 1000.0f;
        float expectedThrust_N = mass_kg * ship.Physics.LinearAcceleration_mps2.Forward;
        float expectedThrust_MN = expectedThrust_N / 1_000_000.0f;

        // For now, just log the expected thrust (actual thrust will be calculated in M1)
        if (ship.Physics.LinearAcceleration_mps2.Forward <= 0)
        {
            result.IsValid = false;
            result.Errors.Add("Forward acceleration must be positive");
        }

        // Validate reverse acceleration is less than forward
        if (ship.Physics.LinearAcceleration_mps2.Reverse > ship.Physics.LinearAcceleration_mps2.Forward)
        {
            result.Warnings.Add("Reverse acceleration exceeds forward acceleration");
        }
    }

    private static void ValidateGLimits(ShipConfig ship, ValidationResult result)
    {
        var gLimit = ship.FlightAssistLimits.CrewGLimit.Linear_g;
        
        // Validate G-limit ranges by size
        var (minG, maxG) = ship.Classification.Size.ToLower() switch
        {
            "snub" => (8.0f, 15.0f),
            "light" => (6.0f, 12.0f),
            "medium" => (4.0f, 8.0f),
            "heavy" => (2.0f, 5.0f),
            "capital" => (1.0f, 3.0f),
            _ => (1.0f, 15.0f)
        };

        if (gLimit < minG || gLimit > maxG)
        {
            result.Warnings.Add($"G-limit {gLimit:F1}g is outside typical range [{minG:F1}g - {maxG:F1}g] for {ship.Classification.Size} ships");
        }

        // Verify acceleration doesn't exceed G-limit
        float maxAccel_g = ship.Physics.LinearAcceleration_mps2.Forward / G_ACCELERATION;
        if (maxAccel_g > gLimit * 1.2f) // 20% tolerance
        {
            result.Warnings.Add($"Physics acceleration ({maxAccel_g:F1}g) significantly exceeds FA:ON G-limit ({gLimit:F1}g)");
        }
    }

    private static void ValidateSpeedLimits(ShipConfig ship, ValidationResult result)
    {
        var speedLimits = ship.FlightAssistLimits.LinearSpeedMax_mps;
        
        if (speedLimits.Forward <= 0)
        {
            result.Warnings.Add("FA:ON forward speed limit should be positive");
        }

        if (speedLimits.Reverse > speedLimits.Forward)
        {
            result.Warnings.Add("FA:ON reverse speed exceeds forward speed");
        }
    }
}
