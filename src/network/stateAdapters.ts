import type { EntityState } from "./PredictionEngine";
import type { u2 } from "./proto/ecs.js";

type EntitySnapshotProto = u2.shared.proto.IEntitySnapshotProto;

/**
 * Converts protobuf snapshots into strongly typed entity state.
 * Kept in a shared helper to avoid duplicating conversion logic.
 */
export function protoToEntityState(proto: EntitySnapshotProto): EntityState {
  return {
    position: {
      x: proto.transform?.position?.x ?? 0,
      y: proto.transform?.position?.y ?? 0
    },
    rotation: proto.transform?.rotation ?? 0,
    velocity: {
      x: proto.velocity?.linear?.x ?? 0,
      y: proto.velocity?.linear?.y ?? 0
    },
    angularVelocity: proto.velocity?.angular ?? 0
  };
}
