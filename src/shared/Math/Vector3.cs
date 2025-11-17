namespace U2.Shared.Math;

/// <summary>
/// 3D vector for future 3D implementation
/// </summary>
public struct Vector3
{
    public float X;
    public float Y;
    public float Z;

    public Vector3(float x, float y, float z)
    {
        X = x;
        Y = y;
        Z = z;
    }

    public readonly float Magnitude => MathF.Sqrt(X * X + Y * Y + Z * Z);
    
    public readonly float SqrMagnitude => X * X + Y * Y + Z * Z;

    public readonly Vector3 Normalized
    {
        get
        {
            float mag = Magnitude;
            if (mag < 1e-6f) return new Vector3(0, 0, 0);
            return new Vector3(X / mag, Y / mag, Z / mag);
        }
    }

    public static Vector3 operator +(Vector3 a, Vector3 b) => new(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
    
    public static Vector3 operator -(Vector3 a, Vector3 b) => new(a.X - b.X, a.Y - b.Y, a.Z - b.Z);
    
    public static Vector3 operator *(Vector3 v, float s) => new(v.X * s, v.Y * s, v.Z * s);
    
    public static Vector3 operator *(float s, Vector3 v) => new(v.X * s, v.Y * s, v.Z * s);
    
    public static Vector3 operator /(Vector3 v, float s) => new(v.X / s, v.Y / s, v.Z / s);

    public static float Dot(Vector3 a, Vector3 b) => a.X * b.X + a.Y * b.Y + a.Z * b.Z;

    public static Vector3 Cross(Vector3 a, Vector3 b) => new(
        a.Y * b.Z - a.Z * b.Y,
        a.Z * b.X - a.X * b.Z,
        a.X * b.Y - a.Y * b.X
    );

    public static Vector3 Zero => new(0, 0, 0);
    
    public static Vector3 One => new(1, 1, 1);
    
    public static Vector3 Up => new(0, 1, 0);
    
    public static Vector3 Right => new(1, 0, 0);
    
    public static Vector3 Forward => new(0, 0, 1);

    public override readonly string ToString() => $"({X:F2}, {Y:F2}, {Z:F2})";
}
