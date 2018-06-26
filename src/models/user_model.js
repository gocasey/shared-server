const IntegrityValidator = require('../../src/utils/integrity_validator.js');

function UserModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;
  let integrityValidator = new IntegrityValidator(logger);

  function getBusinessUser(dbUser) {
    return {
      user_id: dbUser.user_id,
      username: dbUser.username,
      password: dbUser.password,
      _rev: dbUser._rev,
      last_connection: dbUser.last_connection,
    };
  };

  async function findByUsernameReturnAllParams(username) {
    let query = 'SELECT user_id, username, password, _rev, last_connection FROM users WHERE username = $1;';
    let values = [username];
    try {
      let response = await executeQuery(query, values);
      if (response.rows.length == 0) {
        _logger.info('User with username:\'%s\' not found', username);
        return;
      } else if (response.rows.length > 1) {
        _logger.warn('More than a user found for username: %s');
        return response.rows[0];
      } else {
        _logger.info('User with username:\'%s\' found', username);
        return response.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for username:\'%s\' in the database', username);
      throw err;
    }
  }

  async function findByUserIdReturnAllParams(userId) {
    let query = 'SELECT user_id, username, password, _rev, last_connection FROM users WHERE user_id = $1;';
    let values = [userId];
    try {
      let res = await executeQuery(query, values);
      if (res.rows.length == 0) {
        _logger.info('User with id:\'%s\' not found', userId);
        return;
      } else {
        _logger.info('User with id:\'%s\' found', userId);
        return res.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for user id:\'%s\' in the database', userId);
      throw err;
    }
  }

  this.findByUsername = async (username) => {
    let user = await findByUsernameReturnAllParams(username);
    return user ? getBusinessUser(user) : null;
  };

  this.findByUserId = async (serverId) => {
    let dbUser = await findByUserIdReturnAllParams(serverId);
    return dbUser ? getBusinessUser(dbUser) : null;
  };

  async function updateUserRev(username, rev) {
    let query = 'UPDATE users SET _rev=$1 WHERE username=$2 RETURNING user_id, username, password, _rev, last_connection;';
    let values = [rev, username];
    try {
      let response = await executeQuery(query, values);
      _logger.info('Hash for user: \'%s\' updated successfully', username);
      return getBusinessUser(response.rows[0]);
    } catch (err) {
      _logger.error('Error updating rev for username:\'%s\'');
      throw err;
    }
  }

  this.create = async (user) => {
    let query = 'INSERT INTO users(username, password) VALUES ($1, $2) RETURNING user_id, username, password, last_connection;';
    let values = [user.username, user.password];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      _logger.error('Error creating user with username:\'%s\' to database', user.username);
      throw err;
    }
    _logger.info('User: \'%s\' created successfully', user.username);
    _logger.debug('User created in db: %j', response.rows[0]);
    // integrity hash is created here since we now know the user_id
    let rev = integrityValidator.createHash(response.rows[0]);
    return await updateUserRev(user.username, rev);
  };

  async function executeUpdate(user) {
    let currentRev = integrityValidator.createHash(user);
    let query = 'UPDATE users SET password=$1, _rev=$2 WHERE username=$3 RETURNING user_id, username, password, _rev, last_connection;';
    let values = [user.password, currentRev, user.username];
    try {
      let response = await executeQuery(query, values);
      _logger.info('User: \'%s\' updated successfully', user.username);
      _logger.debug('User updated in db: %j', response.rows[0]);
      return getBusinessUser(response.rows[0]);
    } catch (err) {
      _logger.error('Error updating user with username:\'%s\' to database');
      throw err;
    }
  }

  this.update = async (user) => {
    let dbUser = await findByUsernameReturnAllParams(user.username);
    if (dbUser) {
      if (dbUser._rev === user._rev) {
        _logger.info('The integrity check for user: \'%s\' was successful. Proceeding with update.', user.username);
        return await executeUpdate(user);
      } else {
        _logger.error('The integrity check for user: \'%s\' failed. Aborting update.', user.username);
        throw new Error('Error updating');
      }
    } else {
      _logger.error('Update cannot be completed, user: \'%s\' does not exist', user.username);
      throw new Error('User does not exist');
    }
  };

  this.updateLastConnection = async (user) => {
    let query = 'UPDATE users SET last_connection=NOW() ' +
      'WHERE user_id=$1 RETURNING user_id, username, password, _rev, last_connection;';
    let values = [user.user_id];
    try {
      let res = await executeQuery(query, values);
      _logger.info('Last connection for user with name: \'%s\' updated successfully', user.username);
      _logger.debug('Last connection for user updated in db: %j', res.rows[0]);
      return getBusinessUser(res.rows[0]);
    } catch (err) {
      _logger.error('Error updating last connection for user with name:\'%s\' to database', user.username);
      throw err;
    }
  };

  this.getTotalUsersCountByServer = async () => {
    let query = 'SELECT s.server_id, COUNT(uo.server_id) FROM servers AS s ' +
                'LEFT JOIN users_ownership AS uo ON s.server_id = uo.server_id ' +
                'GROUP BY s.server_id ORDER BY s.server_id ASC;';
    try {
      let res = await executeQuery(query);
      if (res.rows.length == 0) {
        _logger.info('There are no servers created');
        return [];
      } else {
        _logger.info('Total users count by server retrieved: %j', res.rows);
        return res.rows;
      }
    } catch (err) {
      _logger.error('Error retrieving the total users count from the database');
      throw err;
    }
  };

  this.getActiveUsersCountByServer = async () => {
    let query = 'SELECT s.server_id, COUNT(active_users.server_id) FROM servers AS s ' +
      'LEFT JOIN ( SELECT * FROM users_ownership AS uo ' +
      'INNER JOIN users AS u ON u.user_id = uo.user_id ' +
      'WHERE DATE_PART(\'day\', NOW() - u.last_connection) * 24 * 60  + ' +
      'DATE_PART(\'hour\', NOW() - u.last_connection) * 60 + ' +
      'DATE_PART(\'minute\', NOW() - u.last_connection) < 60 ) AS active_users ' +
      'ON active_users.server_id = s.server_id ' +
      'GROUP BY s.server_id ORDER BY s.server_id ASC;';
    try {
      let res = await executeQuery(query);
      if (res.rows.length == 0) {
        _logger.info('There are no servers created');
        return [];
      } else {
        _logger.info('Active users count by server retrieved: %j', res.rows);
        return res.rows;
      }
    } catch (err) {
      _logger.error('Error retrieving the active users count from the database');
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

module.exports = UserModel;
