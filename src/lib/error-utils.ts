/**
 * Utility functions for handling errors in a type-safe way
 */

/**
 * Safely extracts error message from unknown error type
 * @param error - The caught error (unknown type)
 * @returns A string error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'Unknown error occurred';
}

/**
 * Creates a standardized error response object
 * @param message - The main error message
 * @param error - The original error (optional)
 * @returns Standardized error object
 */
export function createErrorResponse(message: string, error?: unknown) {
  return {
    message,
    error: error ? getErrorMessage(error) : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Logs error with consistent formatting
 * @param context - Context where the error occurred
 * @param error - The error to log
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}] Error:`, error);
  
  if (error instanceof Error) {
    console.error(`[${context}] Stack:`, error.stack);
  }
}
