using NUnit.Framework;
using U2.Shared;

namespace U2.Shared.Tests;

[TestFixture]
public class BasicTests
{
    [Test]
    public void EmptyTest_ShouldPass()
    {
        // M0.1 DoD: Один пустой тест проходит
        Assert.Pass("Basic test infrastructure is working");
    }

    [Test]
    public void SharedLibrary_ShouldReturnVersion()
    {
        var version = SharedLibrary.GetVersion();
        Assert.That(version, Is.EqualTo("0.8.6-M0.1"));
    }
}
