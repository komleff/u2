import { describe, expect, it } from "vitest";
import { SnapshotStore } from "@client/world/SnapshotStore";

describe("SnapshotStore", () => {
  it("returns immutable frames and preserves last processed sequences", () => {
    const store = new SnapshotStore();
    const world = new Map([
      [
        1,
        {
          position: { x: 10, y: 5 },
          rotation: 0.2,
          velocity: { x: 1, y: -1 },
          angularVelocity: 0
        }
      ]
    ]);

    store.ingest(world, {
      tick: 10,
      receivedAt: 1234,
      lastProcessedSequences: new Map([[1, 7]])
    });

    const frame = store.frame(1);
    frame.entities[0].position.x = 999;
    frame.entities[0].velocity.y = 999;

    const nextFrame = store.frame(1);

    expect(nextFrame.entities[0].position.x).toBe(10);
    expect(nextFrame.entities[0].velocity.y).toBe(-1);
    expect(nextFrame.entities[0].lastProcessedSequence).toBe(7);
  });
});
