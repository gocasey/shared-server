const Pool = require('pg').Pool;

function ConnectionPoolFactory(logger) {

    var _logger = logger;

    this.createPool = function () {
        var connectionSettings = {
          user: 'postgres',
          host: 'localhost',
          database: 'stories',
          password: 'admin',
          port: 5432
        };
        var pool = new Pool(connectionSettings);
        _logger.debug('Database connection settings: %j', connectionSettings);
        return pool;
    };
}

module.exports = ConnectionPoolFactory;
