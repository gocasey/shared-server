const Pool = require('pg').Pool;

function ConnectionPoolFactory(logger) {
    let _logger = logger;

    this.createPool = function() {
        let connectionSettings = {
          user: 'postgres',
          host: 'localhost',
          database: 'stories',
          password: 'admin',
          port: 5432,
        };
        let pool = new Pool(connectionSettings);
        _logger.debug('Database connection settings: %j', connectionSettings);
        return pool;
    };
}

module.exports = ConnectionPoolFactory;
