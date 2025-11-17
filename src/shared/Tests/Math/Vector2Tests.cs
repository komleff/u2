using NUnit.Framework;
using U2.Shared.Math;

namespace U2.Shared.Tests.Math;

[TestFixture]
public class Vector2Tests
{
    [Test]
    public void Constructor_SetsComponents()
    {
        var v = new Vector2(3.0f, 4.0f);
        Assert.That(v.X, Is.EqualTo(3.0f));
        Assert.That(v.Y, Is.EqualTo(4.0f));
    }

    [Test]
    public void Magnitude_CalculatesCorrectly()
    {
        var v = new Vector2(3.0f, 4.0f);
        Assert.That(v.Magnitude, Is.EqualTo(5.0f).Within(0.001f));
    }

    [Test]
    public void Normalized_ReturnsUnitVector()
    {
        var v = new Vector2(3.0f, 4.0f);
        var normalized = v.Normalized;
        
        Assert.That(normalized.Magnitude, Is.EqualTo(1.0f).Within(0.001f));
        Assert.That(normalized.X, Is.EqualTo(0.6f).Within(0.001f));
        Assert.That(normalized.Y, Is.EqualTo(0.8f).Within(0.001f));
    }

    [Test]
    public void Addition_WorksCorrectly()
    {
        var a = new Vector2(1.0f, 2.0f);
        var b = new Vector2(3.0f, 4.0f);
        var result = a + b;
        
        Assert.That(result.X, Is.EqualTo(4.0f));
        Assert.That(result.Y, Is.EqualTo(6.0f));
    }

    [Test]
    public void Subtraction_WorksCorrectly()
    {
        var a = new Vector2(5.0f, 7.0f);
        var b = new Vector2(2.0f, 3.0f);
        var result = a - b;
        
        Assert.That(result.X, Is.EqualTo(3.0f));
        Assert.That(result.Y, Is.EqualTo(4.0f));
    }

    [Test]
    public void ScalarMultiplication_WorksCorrectly()
    {
        var v = new Vector2(2.0f, 3.0f);
        var result = v * 2.0f;
        
        Assert.That(result.X, Is.EqualTo(4.0f));
        Assert.That(result.Y, Is.EqualTo(6.0f));
    }

    [Test]
    public void DotProduct_CalculatesCorrectly()
    {
        var a = new Vector2(1.0f, 2.0f);
        var b = new Vector2(3.0f, 4.0f);
        
        float dot = Vector2.Dot(a, b);
        Assert.That(dot, Is.EqualTo(11.0f)); // 1*3 + 2*4 = 11
    }

    [Test]
    public void Zero_IsZeroVector()
    {
        var zero = Vector2.Zero;
        Assert.That(zero.X, Is.EqualTo(0.0f));
        Assert.That(zero.Y, Is.EqualTo(0.0f));
    }
}
