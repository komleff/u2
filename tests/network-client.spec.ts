import { afterEach, describe, expect, it, vi } from "vitest";
import { NetworkClient } from "../src/network/NetworkClient";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NetworkClient decode error handling", () => {
  it("disconnects after configurable decode error threshold", () => {
    const client = new NetworkClient({
      serverUrl: "ws://localhost",
      playerName: "tester",
      version: "0.0.0-test",
      inputRateHz: 30,
      decodeErrorThreshold: 2,
      reconnect: { enabled: false }
    });

    const disconnectSpy = vi.spyOn(client, "disconnect");
    vi.spyOn(console, "error").mockImplementation(() => {});

    (client as any).handleMessage(new ArrayBuffer(1));
    expect(disconnectSpy).not.toHaveBeenCalled();

    (client as any).handleMessage(new ArrayBuffer(1));
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
