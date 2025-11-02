import { config } from '@/config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Simple logger utility
 * In production, consider using Winston or Pino for structured logging
 * and proper log rotation/aggregation
 */
export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (config.nodeEnv === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

