// SafeAERC implementation for Entitas
using Entitas;

namespace U2.Shared.ECS;

public class SafeAERC : IAERC
{
    private int _refCount = 0;

    public int retainCount => _refCount;

    public static SafeAERC Create()
    {
        return new SafeAERC();
    }

    public void Retain(object owner)
    {
        _refCount++;
    }

    public void Release(object owner)
    {
        _refCount--;
        if (_refCount == 0)
        {
            // Entity can be recycled
        }
    }
}
