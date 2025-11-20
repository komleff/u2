import { describe, it, expect, vi, afterEach } from 'vitest';
import { PredictionEngine, type EntityState } from '@network/PredictionEngine';

describe('PredictionEngine reconciliation thresholds', () => {
  const baseState: EntityState = {
    position: { x: 0, y: 0 },
    rotation: 0,
    velocity: { x: 0, y: 0 },
    angularVelocity: 0
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('honors tighter reconciliation thresholds when determining corrections', () => {
    const engine = new PredictionEngine(baseState, undefined, 0.0001);
    engine.applyInput(
      {
        thrust: 0.1,
        strafeX: 0,
        strafeY: 0,
        yawInput: 0,
        flightAssist: true,
        sequenceNumber: 1,
        timestamp: Date.now()
      },
      0.01
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const corrected = engine.reconcile(baseState, 0, 0.01);

    expect(warnSpy).toHaveBeenCalled();
    expect(corrected.position.x).toBeGreaterThan(0);
  });

  it('avoids reconciliation when error stays under configured threshold', () => {
    const engine = new PredictionEngine(baseState, undefined, 10);
    engine.applyInput(
      {
        thrust: 0.1,
        strafeX: 0,
        strafeY: 0,
        yawInput: 0,
        flightAssist: true,
        sequenceNumber: 1,
        timestamp: Date.now()
      },
      0.01
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    engine.reconcile(baseState, 0, 0.01);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('reconciles on rotation drift and trims processed history', () => {
    const engine = new PredictionEngine(baseState, undefined, 10);

    // apply two inputs to fill history
    engine.applyInput(
      {
        thrust: 0,
        strafeX: 0,
        strafeY: 0,
        yawInput: 1,
        flightAssist: true,
        sequenceNumber: 1,
        timestamp: Date.now()
      },
      0.1
    );

    engine.applyInput(
      {
        thrust: 0,
        strafeX: 0,
        strafeY: 0,
        yawInput: 1,
        flightAssist: true,
        sequenceNumber: 2,
        timestamp: Date.now()
      },
      0.1
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // server says rotation is back to 0 while prediction drifted
    engine.reconcile(
      {
        ...baseState,
        rotation: 0
      },
      1, // server processed first input
      0.1
    );

    expect(warnSpy).toHaveBeenCalled();
    // History should now contain only the unprocessed input (sequenceNumber 2)
    expect(engine.getHistorySize()).toBe(1);
  });
});
