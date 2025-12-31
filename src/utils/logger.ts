/**
 * Production-safe logging utility.
 * Suppresses detailed error information in production to prevent information disclosure.
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Logs an error message. In production, only logs a sanitized message without error details.
 * @param message - The error context message
 * @param error - The error object (only logged in development)
 */
export const logError = (message: string, error?: unknown): void => {
  if (isDevelopment) {
    console.error(message, error);
  } else {
    // In production, log only the message without the error object
    // This prevents Firebase error codes from appearing in browser console
    console.error(message);
  }
};

/**
 * Logs a debug message. Only logs in development.
 * @param message - The debug message
 * @param data - Optional data to log
 */
export const logDebug = (message: string, data?: unknown): void => {
  if (isDevelopment) {
    console.log(message, data);
  }
};
