/**
 * Structured logging with Pino
 */

import pino from 'pino';
import type { MCPServerConfig } from '../types/index.js';

export function createLogger(config: MCPServerConfig['logging']) {
  const baseConfig: any = {
    level: config.level,
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (config.pretty) {
    baseConfig.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    };
  }

  return pino(baseConfig);
}

export type Logger = ReturnType<typeof createLogger>;
