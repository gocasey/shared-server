function UserModel(logger, postgrePool) {
    let _logger = logger;
    let _postgrePool = postgrePool;

    this.findByUsername = function(username, callback) {
        let query = 'SELECT username, password, token FROM users WHERE username = $1;';
        let values = [username];
        executeQuery(query, values, function(err, res) {
           if (err) {
             _logger.error('Error looking for username:\'%s\' in the database', username);
             callback(err);
           } else if (res.rows.length == 0) {
               _logger.info('User with username:\'%s\' not found', username);
               callback('User not found');
           } else if (res.rows.length > 1) {
               _logger.warn('More than a user found for username: %s');
           } else {
               _logger.info('User with username:\'%s\' found', username);
               callback(null, res.rows[0]);
           }
        });
    };

    this.create = function(user, callback) {
      let query = 'INSERT INTO users(username, password) VALUES ($1, $2) RETURNING user_id, username;';
      let values = [user.username, user.password];
      executeQuery(query, values, function(err, res) {
        if (err) {
          _logger.error('Error creating user with username:\'%s\' to database', user.username);
          callback(err);
        } else {
          _logger.info('User: \'%s\' created successfully', user.username);
          _logger.debug('User created in db: %j', res.rows[0]);
          callback(null, res.rows[0]);
        }
      });
    };

    this.update = function(user, callback) {
      let query = 'UPDATE users SET password=$1, token=$2 WHERE username=$3 RETURNING user_id, username, token;';
      let values = [user.password, user.token, user.username];
      executeQuery(query, values, function(err, res) {
        if (err) {
          _logger.error('Error updating user with username:\'%s\' to database');
          callback(err);
        } else {
          _logger.info('User: \'%s\' updated successfully', user.username);
          _logger.debug('User updated in db: %j', res.rows[0]);
          callback();
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
