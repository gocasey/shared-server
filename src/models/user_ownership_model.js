function UserOwnershipModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;

  this.createOrUpdate = async (user, server) => {
    let query = 'INSERT INTO users_ownership(user_id, server_id) VALUES ($1, $2) ' +
      'ON CONFLICT(user_id) DO UPDATE ' +
      'SET server_id = excluded.server_id ' +
      'RETURNING id, user_id, server_id;';
    let values = [user.user_id, server.id];
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
    const client = await _postgrePool.connect();
    try {
      let response = await client.query(query, values);
      _logger.debug('Postgre response: %j', response);
      return response;
    } catch (err) {
      _logger.error('DB error: %j', err.message);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = UserOwnershipModel;
