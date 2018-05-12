const winston = require('winston');
const logFilename = 'all-logs.log';

function Logger() {
  const level = process.env.LOG_LEVEL || 'debug';

  const logger = new winston.Logger({
    transports: [
      new winston.transports.File({
        level: level,
        filename: logFilename,
      }),
      new winston.transports.Console({
        level: level,
        timestamp: function() {
          return (new Date()).toISOString();
        },
      }),
    ],
  });

  this.error = function(...args) {
    logger.error.apply(null, args);
  };

  this.info = function(...args) {
    logger.info.apply(null, args);
  };

  this.debug = function(...args) {
    logger.debug.apply(null, args);
  };

  this.warn = function(...args) {
    logger.warn.apply(null, args);
  };
}

module.exports = Logger;
