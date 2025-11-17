namespace U2.Shared.Config;

/// <summary>
/// Location configuration with fixed speed of light
/// M0.2: Minimal implementation
/// </summary>
public class LocationConfig
{
    /// <summary>
    /// Speed of light in this location (m/s) - FIXED per location
    /// </summary>
    public float CPrime_mps { get; set; } = 5000.0f;

    /// <summary>
    /// Location name
    /// </summary>
    public string Name { get; set; } = "Test Arena";

    /// <summary>
    /// Boundary size (for future collision detection)
    /// </summary>
    public float BoundarySize_m { get; set; } = 100000.0f;

    /// <summary>
    /// Typical test locations
    /// </summary>
    public static LocationConfig TestArena() => new()
    {
        Name = "Test Arena",
        CPrime_mps = 1000.0f
    };

    public static LocationConfig CombatZone() => new()
    {
        Name = "Combat Zone",
        CPrime_mps = 5000.0f
    };

    public static LocationConfig OpenSpace() => new()
    {
        Name = "Open Space",
        CPrime_mps = 10000.0f
    };
}
