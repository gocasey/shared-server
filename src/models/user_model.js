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


    function findByUsernameReturnAllParams(username, callback) {
      let query = 'SELECT user_id, username, password, _rev, app_owner FROM users WHERE username = $1;';
      let values = [username];
      executeQuery(query, values, function(err, res) {
        if (err) {
          _logger.error('Error looking for username:\'%s\' in the database', username);
          callback(err);
        } else if (res.rows.length == 0) {
          _logger.info('User with username:\'%s\' not found', username);
          callback();
        } else if (res.rows.length > 1) {
          _logger.warn('More than a user found for username: %s');
        } else {
          _logger.info('User with username:\'%s\' found', username);
          callback(null, res.rows[0]);
        }
      });
    }

    this.findByUsername = function(username, callback) {
      findByUsernameReturnAllParams(username, function(err, dbUser) {
        if (err) callback(err);
        else {
          if (dbUser) {
            callback(null, getBusinessUser(dbUser));
          } else {
            callback();
          }
        }
      });
    };

    function updateUserRev(username, rev, callback) {
      let query = 'UPDATE users SET _rev=$1 WHERE username=$2 RETURNING user_id, username, password, _rev, app_owner;';
      let values = [rev, username];
      executeQuery(query, values, function(err, res) {
        if (err) {
          _logger.error('Error updating rev for username:\'%s\'');
          callback(err);
        } else {
          _logger.info('Hash for user: \'%s\' updated successfully', username);
          callback(null, getBusinessUser(res.rows[0]));
        }
      });
    };


    this.create = function(user, callback) {
      let query = 'INSERT INTO users(username, password, app_owner) VALUES ($1, $2, $3) RETURNING user_id, username, password, app_owner;';
      let values = [user.username, user.password, user.applicationOwner];
      executeQuery(query, values, function(err, res) {
        if (err) {
          _logger.error('Error creating user with username:\'%s\' to database', user.username);
          callback(err);
        } else {
          _logger.info('User: \'%s\' created successfully', user.username);
          _logger.debug('User created in db: %j', res.rows[0]);
          // integrity hash is created here since we now know the user_id
          let rev = integrityValidator.createHash(user);
          updateUserRev(user.username, rev, callback);
        }
      });
    };

    function executeUpdate(user, callback) {
      let currentRev = integrityValidator.createHash(user);
      let query = 'UPDATE users SET password=$1, _rev=$2 WHERE username=$3 RETURNING user_id, username, password, _rev, app_owner;';
      let values = [user.password, currentRev, user.username];
      executeQuery(query, values, function(err, res) {
        if (err) {
          _logger.error('Error updating user with username:\'%s\' to database');
          callback(err);
        } else {
          _logger.info('User: \'%s\' updated successfully', user.username);
          _logger.debug('User updated in db: %j', res.rows[0]);
          callback(null, getBusinessUser(res.rows[0]));
        }
      });
    };

    this.update = function(user, callback) {
      findByUsernameReturnAllParams(user.username, function(err, dbUser) {
        if (err) callback(err);
        else {
          if (dbUser) {
            if (dbUser._rev === user._rev) {
              _logger.info('The integrity check for user: \'%s\' was successful. Proceeding with update.', user.username);
              executeUpdate(user, callback);
            } else {
              _logger.error('The integrity check for user: \'%s\' failed. Aborting update.', user.username);
              callback('Error updating');
            }
          } else {
            callback('User not found');
          }
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

module.exports = UserModel;
