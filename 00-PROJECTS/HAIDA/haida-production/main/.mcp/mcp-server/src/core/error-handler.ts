/**
 * Centralized error handling with classification and retry logic
 */

import type { Logger } from './logger.js';
import { MCPError, ErrorType } from '../types/index.js';

export class ErrorHandler {
  constructor(private logger: Logger) {}

  handle(error: Error): MCPError {
    // Already an MCPError
    if (error instanceof MCPError) {
      this.log(error);
      return error;
    }

    // Classify error
    const mcpError = this.classify(error);
    this.log(mcpError);
    return mcpError;
  }

  private classify(error: Error): MCPError {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('etimedout')
    ) {
      return new MCPError(
        ErrorType.NETWORK_ERROR,
        'NETWORK_ERROR',
        'Network connection failed',
        error.message,
        true
      );
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return new MCPError(
        ErrorType.TIMEOUT_ERROR,
        'TIMEOUT',
        'Operation timed out',
        error.message,
        true
      );
    }

    // Auth errors
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('authentication')
    ) {
      return new MCPError(
        ErrorType.AUTH_ERROR,
        'AUTH_ERROR',
        'Authentication failed',
        error.message,
        false
      );
    }

    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return new MCPError(
        ErrorType.NOT_FOUND_ERROR,
        'NOT_FOUND',
        'Resource not found',
        error.message,
        false
      );
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return new MCPError(
        ErrorType.RATE_LIMIT_ERROR,
        'RATE_LIMIT',
        'Rate limit exceeded',
        error.message,
        true
      );
    }

    // Default to server error
    return new MCPError(
      ErrorType.SERVER_ERROR,
      'INTERNAL_ERROR',
      'Internal server error',
      error.message,
      true
    );
  }

  private log(error: MCPError): void {
    const logData = {
      type: error.type,
      code: error.code,
      message: error.message,
      details: error.details,
      retryable: error.retryable,
      stack: error.stack,
    };

    if (error.type === ErrorType.SERVER_ERROR) {
      this.logger.error(logData, 'Server error occurred');
    } else if (error.type === ErrorType.CLIENT_ERROR) {
      this.logger.warn(logData, 'Client error occurred');
    } else {
      this.logger.info(logData, 'Error occurred');
    }
  }

  shouldRetry(error: MCPError, attempt: number, maxRetries: number = 3): boolean {
    if (attempt >= maxRetries) {
      return false;
    }

    return error.retryable;
  }

  getRetryDelay(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const jitter = Math.random() * 500; // 0-500ms
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    return Math.min(exponentialDelay + jitter, 30000); // max 30s
  }
}
