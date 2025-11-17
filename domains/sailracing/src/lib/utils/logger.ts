export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function noopLogger(level: LogLevel, scope: string, ...args: any[]) {
  if (process.env.EXPO_PUBLIC_LOG_LEVEL === 'debug') {
    // eslint-disable-next-line no-console
    console.log(`[${scope}] ${level.toUpperCase()}:`, ...args);
  }
}

export function createLogger(scope: string) {
  return {
    debug: (...args: any[]) => noopLogger('debug', scope, ...args),
    info: (...args: any[]) => noopLogger('info', scope, ...args),
    warn: (...args: any[]) => noopLogger('warn', scope, ...args),
    error: (...args: any[]) => noopLogger('error', scope, ...args),
  };
}
