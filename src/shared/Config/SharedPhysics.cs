using System.Text.Json;
using U2.Shared.Ships;

namespace U2.Shared.Config;

public static class SharedPhysics
{
    private static readonly Lazy<SharedPhysicsData> Cached = new(Load);

    public static SharedPhysicsData Data => Cached.Value;

    /// <summary>
    /// Produce a ShipConfig populated from shared physics JSON.
    /// </summary>
    public static ShipConfig ToShipConfig()
    {
        var data = Data;
        return new ShipConfig
        {
            Meta = new ShipMeta
            {
                Id = data.Meta.Id,
                Name = data.Meta.Name,
                Manufacturer = data.Meta.Manufacturer,
                Version = data.Meta.Version
            },
            Geometry = new ShipGeometry
            {
                Length_m = data.Geometry.Length_m,
                Width_m = data.Geometry.Width_m,
                Height_m = data.Geometry.Height_m
            },
            Hull = new ShipHull
            {
                DryMass_t = data.Hull.Dry_mass_t,
                Hull_HP = data.Hull.Hull_hp
            },
            Physics = new ShipPhysics
            {
                LinearAcceleration_mps2 = new LinearAcceleration
                {
                    Forward = data.Physics.Forward_accel_mps2,
                    Reverse = data.Physics.Reverse_accel_mps2
                },
                StrafeAcceleration_mps2 = new StrafeAcceleration
                {
                    Lateral = data.Physics.Strafe_accel_mps2
                },
                AngularAcceleration_dps2 = new AngularAcceleration
                {
                    // Maintain degrees/sec^2 for compatibility with existing systems
                    Yaw = data.Physics.Yaw_accel_dps2,
                    Pitch = data.Physics.Pitch_accel_dps2,
                    Roll = data.Physics.Roll_accel_dps2
                }
            },
            FlightAssistLimits = new FlightAssistLimits
            {
                CrewGLimit = new CrewGLimit { Linear_g = data.Limits.Crew_g_limit },
                LinearSpeedMax_mps = new LinearSpeedMax
                {
                    Forward = data.Limits.Linear_speed_max_mps.Forward,
                    Reverse = data.Limits.Linear_speed_max_mps.Reverse,
                    Lateral = data.Limits.Linear_speed_max_mps.Lateral,
                    Vertical = data.Limits.Linear_speed_max_mps.Vertical
                },
                AngularSpeedMax_dps = new AngularSpeedMax
                {
                    Yaw = data.Limits.Angular_speed_max_dps.Yaw,
                    Pitch = data.Limits.Angular_speed_max_dps.Pitch,
                    Roll = data.Limits.Angular_speed_max_dps.Roll
                }
            }
        };
    }

    private static SharedPhysicsData Load()
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        try
        {
            var path = FindPhysicsPath();
            if (path != null && File.Exists(path))
            {
                using var stream = File.OpenRead(path);
                var data = JsonSerializer.Deserialize<SharedPhysicsData>(stream, options);
                if (data != null)
                {
                    return data;
                }
            }
        }
        catch
        {
            // fallback to defaults below
        }

        return Default();
    }

    private static string? FindPhysicsPath()
    {
        var baseDir = AppContext.BaseDirectory;
        var candidate = Path.Combine(baseDir, "physics.json");
        if (File.Exists(candidate))
        {
            return candidate;
        }

        // Fallback for development (repo root)
        var repoCandidate = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "src", "shared", "physics.json");
        return File.Exists(repoCandidate) ? Path.GetFullPath(repoCandidate) : null;
    }

    private static SharedPhysicsData Default() => new()
    {
        Meta = new SharedMeta
        {
            Id = "default_fighter",
            Name = "Default Fighter",
            Manufacturer = "Generic",
            Version = "0.8.6"
        },
        Geometry = new SharedGeometry { Length_m = 11.5f, Width_m = 11.0f, Height_m = 3.5f },
        Hull = new SharedHull { Dry_mass_t = 10.0f, Hull_hp = 1000.0f },
        Physics = new SharedPhysicsValues
        {
            Forward_accel_mps2 = 90.0f,
            Reverse_accel_mps2 = 67.5f,
            Strafe_accel_mps2 = 85.0f,
            Yaw_accel_dps2 = 200.0f,
            Pitch_accel_dps2 = 180.0f,
            Roll_accel_dps2 = 220.0f
        },
        Limits = new SharedLimits
        {
            Crew_g_limit = 11.0f,
            Linear_speed_max_mps = new SharedLinearSpeedMax
            {
                Forward = 260.0f,
                Reverse = 180.0f,
                Lateral = 220.0f,
                Vertical = 220.0f
            },
            Angular_speed_max_dps = new SharedAngularSpeedMax
            {
                Yaw = 80.0f,
                Pitch = 95.0f,
                Roll = 130.0f
            }
        }
    };
}

public class SharedPhysicsData
{
    public SharedMeta Meta { get; set; } = new();
    public SharedGeometry Geometry { get; set; } = new();
    public SharedHull Hull { get; set; } = new();
    public SharedPhysicsValues Physics { get; set; } = new();
    public SharedLimits Limits { get; set; } = new();
}

public class SharedMeta
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
}

public class SharedGeometry
{
    public float Length_m { get; set; }
    public float Width_m { get; set; }
    public float Height_m { get; set; }
}

public class SharedHull
{
    public float Dry_mass_t { get; set; }
    public float Hull_hp { get; set; }
}

public class SharedPhysicsValues
{
    public float Forward_accel_mps2 { get; set; }
    public float Reverse_accel_mps2 { get; set; }
    public float Strafe_accel_mps2 { get; set; }
    public float Yaw_accel_dps2 { get; set; }
    public float Pitch_accel_dps2 { get; set; }
    public float Roll_accel_dps2 { get; set; }
}

public class SharedLimits
{
    public float Crew_g_limit { get; set; }
    public SharedLinearSpeedMax Linear_speed_max_mps { get; set; } = new();
    public SharedAngularSpeedMax Angular_speed_max_dps { get; set; } = new();
}

public class SharedLinearSpeedMax
{
    public float Forward { get; set; }
    public float Reverse { get; set; }
    public float Lateral { get; set; }
    public float Vertical { get; set; }
}

public class SharedAngularSpeedMax
{
    public float Yaw { get; set; }
    public float Pitch { get; set; }
    public float Roll { get; set; }
}
