import { afterEach, describe, expect, it, vi } from "vitest";
import { TransportLayer } from "@client/net/TransportLayer";

const baseConfig = {
  serverUrl: "ws://localhost",
  playerName: "tester",
  version: "0.0.0-test",
  inputRateHz: 30,
  enablePrediction: false,
  reconciliationThreshold: 1,
  fixedDeltaTime: 1 / 60,
  transportBackoff: {
    enabled: true,
    baseDelayMs: 100,
    maxDelayMs: 500,
    factor: 2,
    jitterMs: 0,
    maxRetries: 2
  }
};

const noopCallbacks = {
  onWorld: vi.fn(),
  onLocalState: vi.fn(),
  onConnection: vi.fn(),
  onStatus: vi.fn()
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("TransportLayer backoff", () => {
  it("uses configurable backoff values when scheduling reconnects", async () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");

    const managerFactory = vi.fn(() => ({
      connect: vi.fn(() => Promise.reject(new Error("boom"))),
      disconnect: vi.fn(),
      onStateUpdate: vi.fn(),
      onWorldUpdate: vi.fn(),
      onConnectionChange: vi.fn(),
      updateInput: vi.fn(),
      getLocalEntityId: vi.fn(() => null),
      getPredictedState: vi.fn(() => null)
    })) as unknown as () => any;

    const transport = new TransportLayer(
      baseConfig as any,
      noopCallbacks,
      managerFactory as any
    );

    // Dial desiredOnline manually to exercise backoff without spinning up a real manager
    (transport as any).desiredOnline = true;
    (transport as any).scheduleReconnect();

    expect(timeoutSpy).toHaveBeenCalled();
    const scheduledDelay = timeoutSpy.mock.calls[0]?.[1];
    expect(scheduledDelay).toBe(100);
  });
});
