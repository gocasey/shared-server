const winston = require("winston");

function Logger(){
    const level = process.env.LOG_LEVEL || 'debug';

    const logger = new winston.Logger({
        transports: [
            new winston.transports.File({
                level: level,
                filename: './logs/all-logs.log'
            }),
            new winston.transports.Console({
                level: level,
                timestamp: function () {
                    return (new Date()).toISOString();
                }
            })
        ]
    });

    this.error = function(){
        logger.error.apply(null, arguments);
    }

    this.info = function(){
        logger.info.apply(null, arguments);
    }

    this.debug = function(){
        logger.debug.apply(null, arguments);
    }

    this.warn = function(){
        logger.warn.apply(null, arguments);
    }
}

module.exports = Logger