/**
 * =================================
 * ASYNC ROUTE WRAPPER
 * =================================
 * 
 * Wraps async route handlers to catch unhandled rejections
 * Passes errors to global error handler middleware
 * 
 * Usage:
 * router.get('/path', asyncHandler(async (req, res) => {
 *   // ... route code
 * }));
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(`[ASYNC HANDLER] Error in ${req.method} ${req.path}:`, err.message);
      next(err); // Pass to error handler middleware
    });
  };
};

module.exports = asyncHandler;
