const crypto = require('crypto');
const UserModel = require('../../models/user_model.js');

function UserService(logger, postgrePool) {
    let _logger = logger;
    let _userModel = new UserModel(logger, postgrePool);

    function hash(s) {
      return crypto.createHmac('sha256', 'secret').update(s).digest('hex');
    }

    this.authenticateWithPassword = function(username, password, callback) {
        _userModel.findByUsername(username, function(err, user) {
          if (err) callback(err);
          else if (hash(password) == user.password) {
            _logger.info('Password validated successfully for username: \'%s\'', username);
            callback(null, user);
          } else {
            _logger.error('Wrong password for username: \'%s\'', username);
            callback('Password incorrect');
          }
        });
    };

    this.createUser = function(body, callback) {
      let userData = {
        username: body.username,
        password: hash(body.password),
        // ignoring applicationOwner for the moment
      };
      _userModel.create(userData, function(createErr, user) {
        if (createErr) {
          _userModel.findByUsername(userData.username, function(findErr) {
            if (findErr) {
              _logger.error('An error happened while creating the user: \'%s\'', userData.username);
              callback('User creation error');
            } else {
              _logger.error('There is already a user with username: \'%s\'', userData.username);
              callback('Username already in usage');
            }
          });
        } else {
          callback(null, user);
        }
      });
    };
}

module.exports = UserService;
