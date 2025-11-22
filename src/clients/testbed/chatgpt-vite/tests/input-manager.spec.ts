import { describe, it, expect } from "vitest";
import { InputManager } from "@client/input/InputManager";

class StubEventSource {
  private listeners: Record<string, Array<(evt: any) => void>> = {};

  addEventListener(type: string, handler: (evt: any) => void) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }

  removeEventListener(type: string, handler: (evt: any) => void) {
    this.listeners[type] = (this.listeners[type] || []).filter((h) => h !== handler);
  }

  emit(type: string, evt: any) {
    for (const handler of this.listeners[type] || []) {
      handler(evt);
    }
  }
}

describe("InputManager", () => {
  it("normalizes thrust/strafe and edge toggles", () => {
    const source = new StubEventSource();
    const target = new StubEventSource();

    const manager = new InputManager(target as unknown as HTMLElement, source as unknown as Window);

    source.emit("keydown", { code: "KeyW", preventDefault() {} });
    source.emit("keydown", { code: "KeyD", preventDefault() {} });
    source.emit("keydown", { code: "KeyO", preventDefault() {} }); // online toggle
    source.emit("keydown", { code: "F2", preventDefault() {} }); // autopilot toggle
    source.emit("keydown", { code: "KeyZ", preventDefault() {} }); // FA toggle (ON -> OFF)

    const frame = manager.poll();

    expect(frame.thrust).toBe(1);
    expect(frame.strafeX).toBe(1);
    expect(frame.toggles.online).toBe(true);
    expect(frame.toggles.autopilot).toBe(true);
    expect(frame.toggles.flightAssist).toBe(false);
    expect(frame.flightAssist).toBe(false);

    manager.dispose();
  });

  it("converts pointer movement into yaw using configured sensitivity", () => {
    const source = new StubEventSource();
    const target = new StubEventSource();

    const manager = new InputManager(
      target as unknown as HTMLElement,
      source as unknown as Window,
      { yawSensitivity: 0.01 }
    );

    target.emit("mousemove", { movementX: 10 });
    const frame = manager.poll();

    expect(frame.yaw).toBeCloseTo(0.1);

    // yaw accumulator should reset between polls
    const secondFrame = manager.poll();
    expect(secondFrame.yaw).toBe(0);

    manager.dispose();
  });
});
