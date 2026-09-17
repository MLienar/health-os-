/**
 * Structured console logging with one prefix so Playwright console capture and Metro output
 * can be filtered to this app alone. Scopes are per feature: "auth", "diary", "workout", "queue"…
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

const PREFIX = "[dt]";

function emit(level: LogLevel, scope: string, message: string, data?: unknown) {
  const line = `${PREFIX} ${scope}: ${message}`;
  const fn = level === "debug" ? console.debug : console[level];
  if (data === undefined) fn(line);
  else fn(line, data);
}

export const log = Object.assign(
  (scope: string, message: string, data?: unknown) => emit("info", scope, message, data),
  {
    debug: (scope: string, message: string, data?: unknown) => emit("debug", scope, message, data),
    info: (scope: string, message: string, data?: unknown) => emit("info", scope, message, data),
    warn: (scope: string, message: string, data?: unknown) => emit("warn", scope, message, data),
    error: (scope: string, message: string, data?: unknown) => emit("error", scope, message, data),
  },
);
