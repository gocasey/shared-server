function UserTokenModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;

  this.findByUser = function(user, callback) {
    let query = 'SELECT token_id, user_id, token FROM users_tokens WHERE user_id = $1;';
    let values = [user.user_id];
    executeQuery(query, values, function(err, res) {
      if (err) {
        _logger.error('Error looking for token for username:\'%s\' in the database', user.username);
        callback(err);
      } else if (res.rows.length == 0) {
        _logger.info('Token for username:\'%s\' not found', user.username);
        callback();
      } else if (res.rows.length > 1) {
        _logger.warn('More than a token found for username: \'%s\'', user.username);
      } else {
        _logger.info('Token for username:\'%s\' found', user.username);
        callback(null, res.rows[0]);
      }
    });
  };

  this.createOrUpdate = function(user, token, callback) {
    let query = 'INSERT INTO users_tokens(user_id, token) VALUES ($1, $2) ' +
      'ON CONFLICT(user_id) DO UPDATE ' +
      'SET token = excluded.token ' +
      'RETURNING token_id, user_id, token;';
    let values = [user.user_id, token.token];
    executeQuery(query, values, function(err, res) {
      if (err) {
        _logger.error('Error creating token for username:\'%s\' to database', user.username);
        callback(err);
      } else {
        _logger.info('Token for username: \'%s\' created successfully', user.username);
        _logger.debug('Token created in db: %j', res.rows[0]);
        callback(null, res.rows[0]);
      }
    });
  };

  function executeQuery(query, values, callback) {
    _postgrePool.query(query, values, function(err, res) {
      if (err) {
        _logger.error('DB error: %j', err);
        return callback(err);
      } else {
        _logger.debug('Postgre response: %j', res);
        return callback(null, res);
      }
    });
  }
}

module.exports = UserTokenModel;
