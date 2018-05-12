const Pool = require('pg').Pool;
const connectionString = process.env.DATABASE_URL || 'postgres://pqjyeqaijafusn:e98fa09f1a4e049674037a98dc4c1f3a956702400f306f9395a280923f38d7c0' +
  '@ec2-54-163-240-54.compute-1.amazonaws.com:5432/dbhchlmki72u4a?ssl=true';

function ConnectionPoolFactory(logger) {
  let _logger = logger;

  this.createPool = function() {
    let connectionSettings = {
      connectionString: connectionString,
    };
    let pool = new Pool(connectionSettings);
    _logger.debug('Database connection settings: %j', connectionSettings);
    return pool;
  };
}

module.exports = ConnectionPoolFactory;
