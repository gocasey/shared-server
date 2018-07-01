function MainErrorHandler(app, logger) {
  let _logger = logger;
  app.use(errorMiddleware);

  function errorMiddleware(err, req, res, next) {
    res.status(err.statusCode || 500).json({
      code: err.statusCode,
      message: err.message,
    });
    _logger.error('Shared Server Error. Status Code: %s. Message: %s', err.statusCode, err.message);
  };
}

module.exports = MainErrorHandler;
