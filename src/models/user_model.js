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
      applicationOwner: dbUser.app_owner,
      _rev: dbUser._rev,
    };
  };

  async function findByUsernameReturnAllParams(username) {
    let query = 'SELECT user_id, username, password, _rev, app_owner FROM users WHERE username = $1;';
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

  this.findByUsername = async (username) => {
    let user = await findByUsernameReturnAllParams(username);
    return user ? getBusinessUser(user) : null;
  };

  async function updateUserRev(username, rev) {
    let query = 'UPDATE users SET _rev=$1 WHERE username=$2 RETURNING user_id, username, password, _rev, app_owner;';
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
    let query = 'INSERT INTO users(username, password, app_owner) VALUES ($1, $2, $3) RETURNING user_id, username, password, app_owner;';
    let values = [user.username, user.password, user.applicationOwner];
    try {
      let response = await executeQuery(query, values);
      _logger.info('User: \'%s\' created successfully', user.username);
      _logger.debug('User created in db: %j', response.rows[0]);
      // integrity hash is created here since we now know the user_id
      let rev = integrityValidator.createHash(user);
      return await updateUserRev(user.username, rev);
    } catch (err) {
      _logger.error('Error creating user with username:\'%s\' to database', user.username);
      throw err;
    }
  };

  async function executeUpdate(user) {
    let currentRev = integrityValidator.createHash(user);
    let query = 'UPDATE users SET password=$1, _rev=$2 WHERE username=$3 RETURNING user_id, username, password, _rev, app_owner;';
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
