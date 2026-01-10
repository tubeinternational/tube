/**
 * =================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * =================================
 * 
 * CRITICAL: Mount this LAST in index.js, after all routes
 * 
 * Catches:
 * - Unhandled Promise rejections from async routes
 * - Thrown errors from any middleware
 * - Express errors
 * 
 * Prevents generic 500s by logging real errors
 */

module.exports = function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';
  const timestamp = new Date().toISOString();
  
  // Determine HTTP status code
  const statusCode = err.status || err.statusCode || 500;
  
  // Log with full context (for debugging in PM2 logs)
  console.error(`\n❌ [${timestamp}] ERROR HANDLER TRIGGERED`, {
    statusCode,
    method: req.method,
    path: req.path,
    query: req.query,
    message: err.message,
    code: err.code, // DB error code if applicable
    // Stack only in development
    ...(isDev && { stack: err.stack }),
  });

  // Only send error details to client in development
  if (isDev) {
    return res.status(statusCode).json({
      error: err.message,
      code: err.code,
      stack: err.stack,
    });
  }

  // Production: never expose internals
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
};
