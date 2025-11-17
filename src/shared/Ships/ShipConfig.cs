namespace U2.Shared.Ships;

/// <summary>
/// Ship configuration v0.8.6 (minimal)
/// </summary>
public class ShipConfig
{
    public ShipMeta Meta { get; set; } = new();
    public ShipClassification Classification { get; set; } = new();
    public ShipGeometry Geometry { get; set; } = new();
    public ShipHull Hull { get; set; } = new();
    public ShipPhysics Physics { get; set; } = new();
    public FlightAssistLimits FlightAssistLimits { get; set; } = new();
    public ShipMedia Media { get; set; } = new();
}

public class ShipMeta
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Manufacturer { get; set; } = "";
    public string Version { get; set; } = "0.8.6";
}

public class ShipClassification
{
    /// <summary>
    /// snub, light, medium, heavy, capital
    /// </summary>
    public string Size { get; set; } = "light";
    
    /// <summary>
    /// interceptor, fighter, freighter, etc.
    /// </summary>
    public string Type { get; set; } = "fighter";
}

public class ShipGeometry
{
    public float Length_m { get; set; }
    public float Width_m { get; set; }
    public float Height_m { get; set; }

    /// <summary>
    /// Calculated collision radius
    /// </summary>
    public float CollisionRadius_m => MathF.Sqrt(Length_m * Length_m + Width_m * Width_m) / 2.0f;
}

public class ShipHull
{
    public float DryMass_t { get; set; }
    public float Hull_HP { get; set; }
}

/// <summary>
/// FA:OFF potential (maximum capabilities)
/// </summary>
public class ShipPhysics
{
    public LinearAcceleration LinearAcceleration_mps2 { get; set; } = new();
    public StrafeAcceleration StrafeAcceleration_mps2 { get; set; } = new();
    public AngularAcceleration AngularAcceleration_dps2 { get; set; } = new();
}

public class LinearAcceleration
{
    public float Forward { get; set; }
    public float Reverse { get; set; }
}

public class StrafeAcceleration
{
    public float Lateral { get; set; }
}

public class AngularAcceleration
{
    public float Pitch { get; set; }
    public float Yaw { get; set; }
    public float Roll { get; set; }
}

/// <summary>
/// FA:ON limits (safety constraints)
/// </summary>
public class FlightAssistLimits
{
    public CrewGLimit CrewGLimit { get; set; } = new();
    public LinearSpeedMax LinearSpeedMax_mps { get; set; } = new();
    public AngularSpeedMax AngularSpeedMax_dps { get; set; } = new();
}

public class CrewGLimit
{
    public float Linear_g { get; set; } = 10.0f;
}

public class LinearSpeedMax
{
    public float Forward { get; set; }
    public float Reverse { get; set; }
    public float Lateral { get; set; }
    public float Vertical { get; set; }
}

public class AngularSpeedMax
{
    public float Pitch { get; set; }
    public float Yaw { get; set; }
    public float Roll { get; set; }
}

public class ShipMedia
{
    public SpriteInfo Sprite { get; set; } = new();
}

public class SpriteInfo
{
    public string Name { get; set; } = "";
}
