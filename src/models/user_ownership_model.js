function UserOwnershipModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;

  this.findByUser = async (user) => {
    let query = 'SELECT id, user_id, server_id FROM users_ownership WHERE user_id = $1;';
    let values = [user.user_id];
    try {
      let response = await executeQuery(query, values);
      if (response.rows.length == 0) {
        _logger.info('Token for username:\'%s\' not found', user.username);
        return;
      } else {
        _logger.info('Token for username:\'%s\' found', user.username);
        return response.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for ownership of username:\'%s\' in the database', user.username);
      throw err;
    }
  };

  this.findByUserId = async (userId) => {
    let query = 'SELECT id, user_id, server_id FROM users_ownership WHERE user_id = $1;';
    let values = [userId];
    try {
      let response = await executeQuery(query, values);
      if (response.rows.length == 0) {
        _logger.info('Token for user_id:\'%s\' not found', userId);
        return;
      } else {
        _logger.info('Token for user_id:\'%s\' found', userId);
        return response.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for ownership for user_id:\'%s\' in the database', userId);
      throw err;
    }
  };

  this.createOrUpdate = async (user, server) => {
    let query = 'INSERT INTO users_ownership(user_id, server_id) VALUES ($1, $2) ' +
      'ON CONFLICT(user_id) DO UPDATE ' +
      'SET server_id = excluded.server_id ' +
      'RETURNING id, user_id, server_id;';
    let values = [user.user_id, server.server_id];
    try {
      let response = await executeQuery(query, values);
      _logger.info('Ownership for username: \'%s\' set successfully', user.username);
      _logger.debug('Ownership set in db: %j', response.rows[0]);
      return response.rows[0];
    } catch (err) {
      _logger.error('Error setting ownership for username:\'%s\' in database', user.username);
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

module.exports = UserOwnershipModel;
