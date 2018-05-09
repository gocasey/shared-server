function ServerTokenModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;

  this.findByServer = function(server, callback) {
    let query = 'SELECT token_id, server_id, token FROM servers_tokens WHERE server_id = $1;';
    let values = [server.id];
    executeQuery(query, values, function(err, res) {
      if (err) {
        _logger.error('Error looking for token for server name:\'%s\' in the database', server.name);
        callback(err);
      } else if (res.rows.length == 0) {
        _logger.info('Token for server name:\'%s\' not found', server.name);
        callback();
      } else if (res.rows.length > 1) {
        _logger.warn('More than a token found for server name: \'%s\'', server.name);
      } else {
        _logger.info('Token for server name:\'%s\' found', server.name);
        callback(null, res.rows[0]);
      }
    });
  };

  this.createOrUpdate = function(server, token, callback) {
    let query = 'INSERT INTO servers_tokens(server_id, token) VALUES ($1, $2) ' +
      'ON CONFLICT(server_id) DO UPDATE ' +
      'SET token = excluded.token ' +
      'RETURNING token_id, server_id, token;';
    let values = [server.id, token.token];
    executeQuery(query, values, function(err, res) {
      if (err) {
        _logger.error('Error creating token for server name:\'%s\' to database', server.name);
        callback(err);
      } else {
        _logger.info('Token for server name: \'%s\' created successfully', server.name);
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

module.exports = ServerTokenModel;
