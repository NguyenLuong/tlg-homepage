/**
 * Centralized error logging utility
 *
 * Logs errors to console in development and optionally sends to
 * error tracking service (e.g., Sentry) in production.
 *
 * @example
 * ```typescript
 * import { logError, logWarning } from '@/lib/monitoring/error-logger';
 *
 * try {
 *   await dangerousOperation();
 * } catch (error) {
 *   logError(error, {
 *     context: 'DangerousOperation',
 *     userId: session?.userId,
 *     metadata: { operationId: 123 }
 *   });
 * }
 * ```
 */

export interface ErrorContext {
  /** Where the error occurred (e.g., component name, API route) */
  context?: string;
  /** Current user ID if available */
  userId?: string;
  /** Current user email if available */
  userEmail?: string;
  /** Additional metadata to include with error */
  metadata?: Record<string, unknown>;
  /** HTTP request URL if applicable */
  url?: string;
  /** HTTP method if applicable */
  method?: string;
}

export interface ErrorLogEntry {
  message: string;
  stack?: string;
  context?: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  environment: string;
  url?: string;
  method?: string;
}

/**
 * Extract error message from Error object or string
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Extract error stack trace from Error object
 */
function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Build structured error log entry
 */
function buildLogEntry(error: unknown, context?: ErrorContext): ErrorLogEntry {
  return {
    message: getErrorMessage(error),
    stack: getErrorStack(error),
    context: context?.context,
    userId: context?.userId,
    userEmail: context?.userEmail,
    metadata: context?.metadata,
    url: context?.url,
    method: context?.method,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  };
}

/**
 * Log error to console in development
 */
function logToConsole(level: "error" | "warn", logEntry: ErrorLogEntry): void {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) {
    const prefix = `[${level.toUpperCase()}]`;
    const contextInfo = logEntry.context ? ` [${logEntry.context}]` : "";
    const userInfo = logEntry.userId ? ` User: ${logEntry.userId}` : "";

    console.group(`${prefix}${contextInfo} ${logEntry.message}`);

    if (logEntry.stack) {
      console.error("Stack trace:", logEntry.stack);
    }

    if (userInfo) {
      console.log(userInfo);
    }

    if (logEntry.url) {
      console.log(`URL: ${logEntry.method || "GET"} ${logEntry.url}`);
    }

    if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
      console.log("Metadata:", logEntry.metadata);
    }

    console.groupEnd();
  } else {
    // In production, use structured JSON logging
    const logLevel = level === "error" ? console.error : console.warn;
    logLevel(JSON.stringify(logEntry));
  }
}

/**
 * Send error to external tracking service (Sentry, etc.)
 *
 * This is a placeholder for production error tracking integration.
 * To enable Sentry:
 * 1. Install: npm install @sentry/nextjs
 * 2. Initialize: npx @sentry/wizard@latest -i nextjs
 * 3. Set SENTRY_DSN environment variable
 * 4. Uncomment the Sentry code below
 */
async function sendToErrorTracking(logEntry: ErrorLogEntry): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const sentryDsn = process.env.SENTRY_DSN;

  // Only send to error tracking in production if configured
  if (!isProduction || !sentryDsn) {
    return;
  }

  try {
    // Sentry integration (uncomment when Sentry is configured)
    // const Sentry = await import('@sentry/nextjs');
    //
    // Sentry.captureException(new Error(logEntry.message), {
    //   level: 'error',
    //   tags: {
    //     context: logEntry.context,
    //     environment: logEntry.environment,
    //   },
    //   user: logEntry.userId ? {
    //     id: logEntry.userId,
    //     email: logEntry.userEmail,
    //   } : undefined,
    //   extra: {
    //     ...logEntry.metadata,
    //     url: logEntry.url,
    //     method: logEntry.method,
    //     timestamp: logEntry.timestamp,
    //   },
    // });

    // Placeholder: Log that error would be sent to tracking service
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[ErrorLogger] Would send to error tracking service:",
        logEntry.message,
      );
    }
  } catch (trackingError) {
    // Fail silently - don't let error tracking failures break the app
    console.error(
      "[ErrorLogger] Failed to send error to tracking service:",
      trackingError,
    );
  }
}

/**
 * Log an error with context information
 *
 * @param error - Error object, string, or unknown error
 * @param context - Additional context about where/why the error occurred
 *
 * @example
 * ```typescript
 * try {
 *   await fetchUserData(userId);
 * } catch (error) {
 *   logError(error, {
 *     context: 'UserDataFetch',
 *     userId: userId,
 *     metadata: { endpoint: '/api/users' }
 *   });
 * }
 * ```
 */
export function logError(error: unknown, context?: ErrorContext): void {
  const logEntry = buildLogEntry(error, context);

  // Always log to console
  logToConsole("error", logEntry);

  // Send to error tracking service in production
  void sendToErrorTracking(logEntry);
}

/**
 * Log a warning (less severe than error)
 *
 * @param message - Warning message
 * @param context - Additional context information
 *
 * @example
 * ```typescript
 * if (!user.emailVerified) {
 *   logWarning('User email not verified', {
 *     context: 'EmailVerification',
 *     userId: user.id,
 *     metadata: { email: user.email }
 *   });
 * }
 * ```
 */
export function logWarning(message: string, context?: ErrorContext): void {
  const logEntry = buildLogEntry(message, context);

  // Log warnings in non-production environments only
  if (process.env.NODE_ENV !== "production") {
    logToConsole("warn", logEntry);
  }
}

/**
 * Create error logger with pre-defined context
 *
 * Useful for creating component-specific or route-specific loggers
 *
 * @example
 * ```typescript
 * const logger = createErrorLogger({ context: 'JobEditor', userId: '123' });
 *
 * try {
 *   await saveJob();
 * } catch (error) {
 *   logger.logError(error, { metadata: { jobId: 456 } });
 * }
 * ```
 */
export function createErrorLogger(baseContext: ErrorContext) {
  return {
    logError: (error: unknown, additionalContext?: ErrorContext) => {
      logError(error, { ...baseContext, ...additionalContext });
    },
    logWarning: (message: string, additionalContext?: ErrorContext) => {
      logWarning(message, { ...baseContext, ...additionalContext });
    },
  };
}

/**
 * Log error from caught error boundary
 *
 * @param error - The error that was caught
 * @param errorInfo - React error info with component stack
 * @param context - Additional context
 *
 * @example
 * ```typescript
 * componentDidCatch(error, errorInfo) {
 *   logErrorBoundary(error, errorInfo, {
 *     context: 'AppErrorBoundary',
 *     userId: this.props.userId
 *   });
 * }
 * ```
 */
export function logErrorBoundary(
  error: unknown,
  errorInfo: { componentStack?: string },
  context?: ErrorContext,
): void {
  const enhancedContext = {
    ...context,
    metadata: {
      ...context?.metadata,
      componentStack: errorInfo.componentStack,
    },
  };

  logError(error, enhancedContext);
}

/**
 * Log API error with request details
 *
 * @param error - The error that occurred
 * @param request - The HTTP request object (if available)
 * @param context - Additional context
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   try {
 *     return Response.json(data);
 *   } catch (error) {
 *     logApiError(error, request, {
 *       context: 'JobsAPI',
 *       metadata: { query: searchParams }
 *     });
 *     return ApiResponse.error(...);
 *   }
 * }
 * ```
 */
export function logApiError(
  error: unknown,
  request?: Request,
  context?: ErrorContext,
): void {
  const enhancedContext: ErrorContext = {
    ...context,
    url: request?.url,
    method: request?.method,
  };

  logError(error, enhancedContext);
}
