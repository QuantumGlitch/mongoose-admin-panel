const { logError } = require('../models/log');

// This middleware will handles errors
module.exports = function (app) {
  app.use((err, req, res, next) => {
    console.error(err);

    // handle form validation errors
    if (err.name === 'ValidationError') {
      res.status(200).json({
        ok: false,
        errors: err.errors,
        message: err.message,
      });
    } else {
      logError(err);
      res.status(500).json({
        ok: false,
        message: typeof err == 'string' ? err : err.message || 'UNKNOWN_ERROR',
        error: err,
      });
    }
  });
};

/**
 * Transform an express' route handler to an express' route handler with handled errors
 * @param {Function} routeHandler
 */
module.exports.makeRoute = function (routeHandler) {
  return async function (req, res, next) {
    try {
      await new Promise((resolve, reject) => {
        const routeResult = routeHandler(req, res, next);
        if (routeResult instanceof Promise) routeResult.then(resolve).catch(reject);
        else resolve();
      });
    } catch (e) {
      next(e);
    }
  };
};
