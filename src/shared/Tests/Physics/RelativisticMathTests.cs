using NUnit.Framework;
using U2.Shared.Physics;

namespace U2.Shared.Tests.Physics;

[TestFixture]
public class RelativisticMathTests
{
    [Test]
    public void Gamma_AtZeroVelocity_ReturnsOne()
    {
        float gamma = RelativisticMath.Gamma(0.0f);
        Assert.That(gamma, Is.EqualTo(1.0f).Within(0.001f));
    }

    [Test]
    public void Gamma_AtLowVelocity_ApproximatesOne()
    {
        float gamma = RelativisticMath.Gamma(0.1f); // 10% of c'
        Assert.That(gamma, Is.EqualTo(1.005f).Within(0.01f));
    }

    [Test]
    public void Gamma_AtHalfLightSpeed_CalculatesCorrectly()
    {
        float beta = 0.5f;
        float gamma = RelativisticMath.Gamma(beta);
        
        // γ = 1/√(1 - 0.5²) = 1/√0.75 ≈ 1.1547
        Assert.That(gamma, Is.EqualTo(1.1547f).Within(0.001f));
    }

    [Test]
    public void Gamma_At80PercentLightSpeed_CalculatesCorrectly()
    {
        float beta = 0.8f;
        float gamma = RelativisticMath.Gamma(beta);
        
        // γ = 1/√(1 - 0.8²) = 1/√0.36 = 1/0.6 ≈ 1.6667
        Assert.That(gamma, Is.EqualTo(1.6667f).Within(0.001f));
    }

    [Test]
    public void Gamma_At90PercentLightSpeed_CalculatesCorrectly()
    {
        float beta = 0.9f;
        float gamma = RelativisticMath.Gamma(beta);
        
        // γ = 1/√(1 - 0.9²) = 1/√0.19 ≈ 2.294
        Assert.That(gamma, Is.EqualTo(2.294f).Within(0.01f));
    }

    [Test]
    public void Gamma_NearLightSpeed_ReturnsLargeValue()
    {
        float beta = 0.999f;
        float gamma = RelativisticMath.Gamma(beta);
        
        // γ should be very large but finite
        Assert.That(gamma, Is.GreaterThan(20.0f));
        Assert.That(gamma, Is.LessThan(1000.0f));
    }

    [Test]
    public void Gamma_AtLightSpeed_ReturnsCappedValue()
    {
        float beta = 1.0f;
        float gamma = RelativisticMath.Gamma(beta);
        
        // Should return capped value, not infinity
        Assert.That(gamma, Is.EqualTo(1000.0f));
    }

    [Test]
    public void Gamma_AboveLightSpeed_ReturnsCappedValue()
    {
        float beta = 1.1f;
        float gamma = RelativisticMath.Gamma(beta);
        
        // Should return capped value for invalid input
        Assert.That(gamma, Is.EqualTo(1000.0f));
    }

    [Test]
    public void CalculateBeta_CalculatesCorrectly()
    {
        float velocity = 2500.0f; // m/s
        float cPrime = 5000.0f;   // m/s
        
        float beta = RelativisticMath.CalculateBeta(velocity, cPrime);
        Assert.That(beta, Is.EqualTo(0.5f).Within(0.001f));
    }

    [Test]
    public void ClampVelocity_ClampsToMaxSpeed()
    {
        float cPrime = 5000.0f;
        float tooFast = 6000.0f;
        
        float clamped = RelativisticMath.ClampVelocity(tooFast, cPrime);
        
        // Should clamp to 0.999 * c'
        float expected = 0.999f * cPrime;
        Assert.That(clamped, Is.EqualTo(expected).Within(0.1f));
    }

    [Test]
    public void ClampVelocity_PreservesSign()
    {
        float cPrime = 5000.0f;
        float negativeVelocity = -6000.0f;
        
        float clamped = RelativisticMath.ClampVelocity(negativeVelocity, cPrime);
        
        // Should be negative and clamped
        Assert.That(clamped, Is.LessThan(0));
        Assert.That(MathF.Abs(clamped), Is.EqualTo(0.999f * cPrime).Within(0.1f));
    }

    /// <summary>
    /// Property test: γ should always be >= 1.0
    /// </summary>
    [Test]
    public void Gamma_AlwaysGreaterThanOrEqualToOne([Random(0.0f, 0.999f, 100)] float beta)
    {
        float gamma = RelativisticMath.Gamma(beta);
        Assert.That(gamma, Is.GreaterThanOrEqualTo(1.0f));
    }

    /// <summary>
    /// Property test: γ should be monotonically increasing with β
    /// </summary>
    [Test]
    public void Gamma_MonotonicallyIncreasing()
    {
        float prevGamma = RelativisticMath.Gamma(0.0f);
        
        for (float beta = 0.1f; beta < 0.95f; beta += 0.1f)
        {
            float gamma = RelativisticMath.Gamma(beta);
            Assert.That(gamma, Is.GreaterThan(prevGamma), 
                $"Gamma should increase as beta increases (beta={beta})");
            prevGamma = gamma;
        }
    }
}
