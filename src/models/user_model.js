function UserModel(logger, postgrePool){

    var _logger = logger;
    var _postgrePool = postgrePool;

    this.findByUsername = function(username, callback){
        var query = 'SELECT username, password, token FROM users WHERE username = $1;';
        var values = [username];
        executeQuery(query, values, function(err, rows){
           if (err){
             _logger.error('Error looking for username:\'%s\' in the database', username);
             callback(err);
           }
           else if (rows.length == 0){
               _logger.info('User with username:\'%s\' not found', username);
               callback('User not found');
           }
           else if (rows.length > 1){
               _logger.warn('More than a user found for username: %s');
           }
           else{
               _logger.info('User with username:\'%s\' found', username);
               callback(null, rows[0]);
           }
        });
    };

    this.save = function(user, callback){
      var query = 'INSERT INTO users(username, password, token) VALUES ($1, $2, $3);'
      var values = [ user.username, user.password, user.token];
      executeQuery(query, values, function(err, rows){
        if (err){
          _logger.error('Error saving user with username:\'%s\' to database');
          callback(err);
        }
        else{
          _logger.info('User: \'%s\' saved successfully', user.username);
          _logger.debug('User saved to the db: %j', rows[0]);
          callback(null, rows[0]);
        }
      });
    };

    function executeQuery(query, values, callback){
        _postgrePool.query(query, values, function(err, res){
            if(err){
                return callback(err);
            }
            return callback(null, res.rows);
        });
    }
}

module.exports = UserModel;
