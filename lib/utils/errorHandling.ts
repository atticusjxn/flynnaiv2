// Flynn.ai v2 - Comprehensive Error Handling System
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class CallProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly callSid: string,
    public readonly severity: 'low' | 'medium' | 'high' | 'critical',
    public readonly retryable: boolean = false,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'CallProcessingError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      callSid: this.callSid,
      severity: this.severity,
      retryable: this.retryable,
      context: this.context,
    };
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }

  toResponse(): NextResponse {
    return NextResponse.json(
      {
        error: {
          message: this.message,
          code: this.code,
          details: this.details,
        },
      },
      { status: this.statusCode }
    );
  }
}

// Structured logging
export class Logger {
  constructor(private context: string) {}

  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: Record<string, any>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...data,
    };

    if (level === 'error') {
      console.error(JSON.stringify(logEntry, null, 2));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry, null, 2));
    }

    // In production, you would send this to a monitoring service
    // like Sentry, DataDog, or CloudWatch
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(logEntry);
    }
  }

  info(message: string, data?: Record<string, any>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | Record<string, any>) {
    const errorData = error instanceof Error 
      ? { error: { name: error.name, message: error.message, stack: error.stack } }
      : { error };
    
    this.log('error', message, errorData);
  }

  debug(message: string, data?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }

  private sendToMonitoringService(logEntry: any) {
    // Implement monitoring service integration here
    // Examples: Sentry, DataDog, CloudWatch, etc.
  }
}

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryIf?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryIf = () => true,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries || !retryIf(lastError)) {
        throw lastError;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Validation error handling
export function handleValidationError(error: ZodError): APIError {
  const details = error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return new APIError(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    { errors: details }
  );
}

// Database error handling
export function handleDatabaseError(error: any): APIError {
  // Supabase error codes
  const errorMapping = {
    '23505': { message: 'Duplicate record', status: 409, code: 'DUPLICATE_ERROR' },
    '23503': { message: 'Referenced record not found', status: 400, code: 'FOREIGN_KEY_ERROR' },
    '42703': { message: 'Database schema error', status: 500, code: 'SCHEMA_ERROR' },
    'PGRST204': { message: 'Record not found', status: 404, code: 'NOT_FOUND' },
    'PGRST301': { message: 'Database constraint violation', status: 400, code: 'CONSTRAINT_ERROR' },
  };

  const mapped = errorMapping[error.code as keyof typeof errorMapping];
  
  if (mapped) {
    return new APIError(mapped.message, mapped.status, mapped.code, { 
      originalError: error.message,
      hint: error.hint,
      details: error.details 
    });
  }

  // Generic database error
  return new APIError(
    'Database operation failed',
    500,
    'DATABASE_ERROR',
    { 
      code: error.code,
      message: error.message,
      hint: error.hint,
      details: error.details
    }
  );
}

// API error response helper
export function createErrorResponse(error: unknown): NextResponse {
  if (error instanceof APIError) {
    return error.toResponse();
  }

  if (error instanceof ZodError) {
    return handleValidationError(error).toResponse();
  }

  if (error instanceof CallProcessingError) {
    return new APIError(
      error.message,
      500,
      error.code,
      {
        callSid: error.callSid,
        severity: error.severity,
        retryable: error.retryable,
        context: error.context,
      }
    ).toResponse();
  }

  // Handle database errors (Supabase/PostgreSQL)
  if (error && typeof error === 'object' && 'code' in error) {
    return handleDatabaseError(error).toResponse();
  }

  // Generic error
  const logger = new Logger('ErrorHandler');
  logger.error('Unhandled error', error as Error);

  return new APIError(
    'Internal server error',
    500,
    'INTERNAL_ERROR'
  ).toResponse();
}

// Rate limiting helper
export function createRateLimitResponse(resetTime: Date): NextResponse {
  return NextResponse.json(
    {
      error: {
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        details: {
          resetTime: resetTime.toISOString(),
        },
      },
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Reset': resetTime.toISOString(),
        'Retry-After': Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString(),
      },
    }
  );
}

// Memory cleanup helper for audio processing
export async function withMemoryCleanup<T>(
  operation: () => Promise<T>,
  logger?: Logger
): Promise<T> {
  const initialMemory = process.memoryUsage();
  
  try {
    const result = await operation();
    return result;
  } catch (error) {
    throw error;
  } finally {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage();
    const memoryDiff = {
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
      rss: finalMemory.rss - initialMemory.rss,
    };

    if (logger) {
      logger.debug('Memory usage after operation', {
        initialMemory,
        finalMemory,
        diff: memoryDiff,
      });
    }

    // Warn if memory usage is growing significantly
    if (memoryDiff.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
      if (logger) {
        logger.warn('High memory usage detected', { memoryDiff });
      }
    }
  }
}

// Health check helper
export function createHealthCheckResponse(status: 'healthy' | 'degraded' | 'unhealthy', details?: Record<string, any>): NextResponse {
  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 206 : 503;
  
  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    details: details || {},
  }, { status: statusCode });
}