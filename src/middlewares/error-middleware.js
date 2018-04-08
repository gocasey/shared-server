/**
 * Basic error middleware to handle any error in the API.
 * This is the last resource of the service when something happens.
 * @param {Object} err - The errors of the app
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function to call the next middleware
 */
function errorMiddleware(err, req, res, next) {
  res.status(err.status || 500).json({
    name: err.name,
    status: err.status,
    message: err.message,
    details: err.details,
  });
};

module.exports = errorMiddleware;
