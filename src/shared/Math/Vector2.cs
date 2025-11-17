namespace U2.Shared.Math;

/// <summary>
/// 2D vector for physics calculations
/// </summary>
public struct Vector2
{
    public float X;
    public float Y;

    public Vector2(float x, float y)
    {
        X = x;
        Y = y;
    }

    public readonly float Magnitude => MathF.Sqrt(X * X + Y * Y);
    
    public readonly float SqrMagnitude => X * X + Y * Y;

    public readonly Vector2 Normalized
    {
        get
        {
            float mag = Magnitude;
            if (mag < 1e-6f) return new Vector2(0, 0);
            return new Vector2(X / mag, Y / mag);
        }
    }

    public static Vector2 operator +(Vector2 a, Vector2 b) => new(a.X + b.X, a.Y + b.Y);
    
    public static Vector2 operator -(Vector2 a, Vector2 b) => new(a.X - b.X, a.Y - b.Y);
    
    public static Vector2 operator *(Vector2 v, float s) => new(v.X * s, v.Y * s);
    
    public static Vector2 operator *(float s, Vector2 v) => new(v.X * s, v.Y * s);
    
    public static Vector2 operator /(Vector2 v, float s) => new(v.X / s, v.Y / s);

    public static float Dot(Vector2 a, Vector2 b) => a.X * b.X + a.Y * b.Y;

    public static Vector2 Zero => new(0, 0);
    
    public static Vector2 One => new(1, 1);
    
    public static Vector2 Up => new(0, 1);
    
    public static Vector2 Right => new(1, 0);

    public override readonly string ToString() => $"({X:F2}, {Y:F2})";
}
