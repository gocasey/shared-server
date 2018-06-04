function UserTokenModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;

  this.findByUser = async (user) => {
    let query = 'SELECT token_id, user_id, token FROM users_tokens WHERE user_id = $1;';
    let values = [user.user_id];
    try {
      let response = await executeQuery(query, values);
      if (response.rows.length == 0) {
        _logger.info('Token for username:\'%s\' not found', user.username);
        return;
      } else if (response.rows.length > 1) {
        _logger.warn('More than a token found for username: \'%s\'', user.username);
        return response.rows[0];
      } else {
        _logger.info('Token for username:\'%s\' found', user.username);
        return response.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for token for username:\'%s\' in the database', user.username);
      throw err;
    }
  };

  this.findByUserId = async (userId) => {
    let query = 'SELECT token_id, user_id, token FROM users_tokens WHERE user_id = $1;';
    let values = [userId];
    try {
      let response = await executeQuery(query, values);
      if (response.rows.length == 0) {
        _logger.info('Token for user_id:\'%s\' not found', userId);
        return;
      } else if (response.rows.length > 1) {
        _logger.warn('More than a token found for user_id: \'%s\'', userId);
        return response.rows[0];
      } else {
        _logger.info('Token for user_id:\'%s\' found', userId);
        return response.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for token for user_id:\'%s\' in the database', userId);
      throw err;
    }
  };

  this.createOrUpdate = async (user, token) => {
    let query = 'INSERT INTO users_tokens(user_id, token) VALUES ($1, $2) ' +
      'ON CONFLICT(user_id) DO UPDATE ' +
      'SET token = excluded.token ' +
      'RETURNING token_id, user_id, token;';
    let values = [user.user_id, token.token];
    try {
      let response = await executeQuery(query, values);
      _logger.info('Token for username: \'%s\' created successfully', user.username);
      _logger.debug('Token created in db: %j', response.rows[0]);
      return response.rows[0];
    } catch (err) {
      _logger.error('Error creating token for username:\'%s\' to database', user.username);
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

module.exports = UserTokenModel;
