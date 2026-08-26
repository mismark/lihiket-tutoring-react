/**
 * Custom operational error class.
 * Thrown from controllers/services to produce structured HTTP error responses.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
