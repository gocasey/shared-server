const Pool = require('pg').Pool;
const config = require('../../../config/default.js');

function ConnectionPoolFactory(logger) {
  let _logger = logger;

  this.createPool = function() {
    let connectionSettings = {
      connectionString: config.DATABASE_URL,
    };
    let pool = new Pool(connectionSettings);
    _logger.debug('Database connection settings: %j', connectionSettings);
    return pool;
  };
}

module.exports = ConnectionPoolFactory;
