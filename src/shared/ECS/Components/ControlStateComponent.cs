using Entitas;
using Entitas.CodeGeneration.Attributes;

namespace U2.Shared.ECS.Components;

/// <summary>
/// Control input state (-1 to 1)
/// </summary>

public sealed class ControlStateComponent : IComponent
{
    public float Thrust;      // -1..1 (forward/reverse)
    public float Strafe_X;    // -1..1 (left/right)
    public float Strafe_Y;    // -1..1 (down/up, for 3D)
    public float Yaw_Input;   // -1..1 (turn left/right)
}
