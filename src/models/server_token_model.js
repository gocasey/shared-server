function ServerTokenModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;

  this.findByServer = async (server) => {
    let query = 'SELECT token_id, server_id, token FROM servers_tokens WHERE server_id = $1;';
    let values = [server.id];
    try {
      let res = await executeQuery(query, values);
      if (res.rows.length == 0) {
        _logger.info('Token for server name:\'%s\' not found', server.name);
        return;
      } else if (res.rows.length > 1) {
        _logger.warn('More than a token found for server name: \'%s\'', server.name);
        return res.rows[0];
      } else {
        _logger.info('Token for server name:\'%s\' found', server.name);
        return res.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for token for server name:\'%s\' in the database', server.name);
      throw err;
    }
  };

  this.findByServerId = async (serverId) => {
    let query = 'SELECT token_id, server_id, token FROM servers_tokens WHERE server_id = $1;';
    let values = [serverId];
    try {
      let response = await executeQuery(query, values);
      if (response.rows.length == 0) {
        _logger.info('Token for server_id:\'%s\' not found', serverId);
        return;
      } else {
        _logger.info('Token for server_id:\'%s\' found', serverId);
        return response.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for token for server_id:\'%s\' in the database', serverId);
      throw err;
    }
  };

  this.createOrUpdate = async (server, token) => {
    let query = 'INSERT INTO servers_tokens(server_id, token) VALUES ($1, $2) ' +
      'ON CONFLICT(server_id) DO UPDATE ' +
      'SET token = excluded.token ' +
      'RETURNING token_id, server_id, token;';
    let values = [server.id, token.token];
    try {
      let res = await executeQuery(query, values);
      _logger.info('Token for server name: \'%s\' created successfully', server.name);
      _logger.debug('Token created in db: %j', res.rows[0]);
      return res.rows[0];
    } catch (err) {
      _logger.error('Error creating token for server name:\'%s\' to database', server.name);
      throw err;
    }
  };

  async function executeQuery(query, values) {
    try {
      let response = await _postgrePool.query(query, values);
      _logger.debug('Postgre response: %j', response);
      return response;
    } catch (err) {
      _logger.error('DB error: %j', err.message);
      throw err;
    }
  }
}

module.exports = ServerTokenModel;
