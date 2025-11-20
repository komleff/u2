import type { EntityState } from "@network/PredictionEngine";
import type { WorldUpdateMeta } from "@network/NetworkManager";
import type { Vector2 } from "@types/simulation";

export interface RenderEntity extends EntityState {
  id: number;
  lastProcessedSequence?: number;
}

export interface WorldFrame {
  entities: RenderEntity[];
  tick: number;
  timestamp: number;
  focus?: Vector2;
}

/**
  * Holds the latest world snapshot and exposes a render-friendly view.
  */
export class SnapshotStore {
  private entities = new Map<number, RenderEntity>();
  private tick = 0;
  private lastTimestamp = 0;

  ingest(world: Map<number, EntityState>, meta?: WorldUpdateMeta): void {
    this.entities.clear();

    for (const [id, state] of world.entries()) {
      this.entities.set(id, {
        position: { ...state.position },
        rotation: state.rotation,
        velocity: { ...state.velocity },
        angularVelocity: state.angularVelocity,
        id,
        lastProcessedSequence: meta?.lastProcessedSequences?.get(id)
      });
    }

    this.tick = meta?.tick ?? this.tick + 1;
    this.lastTimestamp = meta?.receivedAt ?? performance.now();
  }

  frame(localEntityId: number | null): WorldFrame {
    const entities = Array.from(this.entities.values()).map((entity) => ({
      ...entity,
      position: { ...entity.position },
      velocity: { ...entity.velocity }
    }));

    const focus = localEntityId !== null ? this.entities.get(localEntityId)?.position : undefined;

    return {
      entities,
      tick: this.tick,
      timestamp: this.lastTimestamp,
      focus: focus ? { ...focus } : undefined
    };
  }

  count(): number {
    return this.entities.size;
  }
}
