import { describe, it, expect, beforeEach } from "vitest";
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

describe("Flight Assist Toggle", () => {
  let inputManager: InputManager;
  let eventSource: StubEventSource;
  let target: StubEventSource;

  beforeEach(() => {
    eventSource = new StubEventSource();
    target = new StubEventSource();
    
    inputManager = new InputManager(
      target as unknown as HTMLElement,
      eventSource as unknown as Window,
      { flightAssist: true }
    );
  });

  it("should start with FA:ON by default", () => {
    const frame = inputManager.poll();
    expect(frame.flightAssist).toBe(true);
  });

  it("should toggle FA state when Z key is pressed", () => {
    // Simulate Z key press
    eventSource.emit("keydown", { code: "KeyZ", preventDefault() {} });

    // Check that FA toggled
    const frame = inputManager.poll();
    expect(frame.flightAssist).toBe(false);
  });

  it("should toggle FA multiple times correctly", () => {
    // Initial state: FA:ON
    let frame = inputManager.poll();
    expect(frame.flightAssist).toBe(true);

    // First toggle: FA:ON → FA:OFF
    eventSource.emit("keydown", { code: "KeyZ", preventDefault() {} });
    frame = inputManager.poll();
    expect(frame.flightAssist).toBe(false);

    // Second toggle: FA:OFF → FA:ON
    eventSource.emit("keydown", { code: "KeyZ", preventDefault() {} });
    frame = inputManager.poll();
    expect(frame.flightAssist).toBe(true);

    // Third toggle: FA:ON → FA:OFF
    eventSource.emit("keydown", { code: "KeyZ", preventDefault() {} });
    frame = inputManager.poll();
    expect(frame.flightAssist).toBe(false);
  });

  it("should include FA state in command frame", () => {
    const frame = inputManager.poll();
    
    expect(frame).toHaveProperty("flightAssist");
    expect(typeof frame.flightAssist).toBe("boolean");
  });

  it("should start with FA:OFF when explicitly configured", () => {
    const manager = new InputManager(
      target as unknown as HTMLElement,
      eventSource as unknown as Window,
      { flightAssist: false }
    );

    const frame = manager.poll();
    expect(frame.flightAssist).toBe(false);
    
    manager.dispose();
  });
});
