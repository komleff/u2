export type BackoffConfig = {
  enabled: boolean;
  baseDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitterMs: number;
  maxRetries: number;
};

export type ClientConfig = {
  input: {
    yawSensitivity: number;
  };
  render: {
    viewRadius: number;
  };
  network: {
    inputRateHz: number;
    fixedDeltaTime: number;
    reconciliationThreshold: number;
    decodeErrorThreshold: number;
    reconnect: BackoffConfig;
  };
};

/**
 * Tunable client defaults extracted from the Stage 1 review.
 * Keeping these in one place makes the magic numbers discoverable and testable.
 */
export const CLIENT_CONFIG: ClientConfig = {
  input: {
    yawSensitivity: 0.0025 // rad per pixel
  },
  render: {
    viewRadius: 900 // meters
  },
  network: {
    inputRateHz: 30,
    fixedDeltaTime: 1 / 60,
    reconciliationThreshold: 1.5, // meters
    decodeErrorThreshold: 3,
    reconnect: {
      enabled: true,
      baseDelayMs: 500,
      maxDelayMs: 5000,
      factor: 1.6,
      jitterMs: 150,
      maxRetries: 5
    }
  }
};
