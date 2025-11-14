type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

class Logger {
  constructor(
    private readonly scope: string,
    private level: LogLevel = "info"
  ) {}

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private canLog(level: LogLevel) {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.level];
  }

  private format(message: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.scope}] ${message}`;
  }

  debug(message: string, ...data: unknown[]) {
    if (this.canLog("debug")) {
      console.debug(this.format(message), ...data);
    }
  }

  info(message: string, ...data: unknown[]) {
    if (this.canLog("info")) {
      console.info(this.format(message), ...data);
    }
  }

  warn(message: string, ...data: unknown[]) {
    if (this.canLog("warn")) {
      console.warn(this.format(message), ...data);
    }
  }

  error(message: string, ...data: unknown[]) {
    if (this.canLog("error")) {
      console.error(this.format(message), ...data);
    }
  }
}

export const makeLogger = (scope: string, level: LogLevel = "info") =>
  new Logger(scope, level);
