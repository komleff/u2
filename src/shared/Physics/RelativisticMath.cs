namespace U2.Shared.Physics;

/// <summary>
/// Relativistic physics calculations for variable speed of light
/// </summary>
public static class RelativisticMath
{
    /// <summary>
    /// Calculate Lorentz factor γ = 1/√(1 - β²)
    /// </summary>
    /// <param name="beta">Velocity as fraction of c' (v/c')</param>
    /// <returns>Gamma factor (≥ 1.0)</returns>
    public static float Gamma(float beta)
    {
        float beta2 = beta * beta;
        
        // Safety: prevent division by zero and ensure β < 1
        if (beta2 >= 0.999f * 0.999f)
        {
            return 1000.0f; // Large but finite value
        }
        
        float denominator = 1.0f - beta2;
        if (denominator <= 0.0f)
        {
            return 1000.0f;
        }
        
        return 1.0f / MathF.Sqrt(denominator);
    }

    /// <summary>
    /// Calculate beta (v/c') from velocity and speed of light
    /// </summary>
    public static float CalculateBeta(float velocity, float cPrime)
    {
        if (cPrime <= 0.0f) return 0.0f;
        return velocity / cPrime;
    }

    /// <summary>
    /// Clamp velocity to not exceed 0.999 * c'
    /// </summary>
    public static float ClampVelocity(float velocity, float cPrime)
    {
        float maxVelocity = 0.999f * cPrime;
        return MathF.Min(MathF.Abs(velocity), maxVelocity) * MathF.Sign(velocity);
    }
}
