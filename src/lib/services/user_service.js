const crypto = require('crypto');
const UserModel = require('../../models/user_model.js');
const TokenGenerationService = require('./token_generation_service');

function UserService(logger, postgrePool) {
    let _logger = logger;
    let _userModel = new UserModel(logger, postgrePool);
    let _tokenGenerationService = new TokenGenerationService(logger);

    function generateNewTokenForUser(user, callback) {
      _tokenGenerationService.generateToken(user.username, function(err, token) {
        if (err) callback(err);
        else {
          user.token = token.token;
          _userModel.update(user, function(err){
            if (err) callback (err);
            else {
              user.tokenExpiration = token.expiredAt;
              callback(null, user);
            }
          });
        }
      });
    }

    this.generateToken = function(user, callback) {
      if (user.token) {
        _tokenGenerationService.validateToken(user.token, user.username, function(err, token) {
          if (err) {
            _logger.info('User: \'%s\' already has a token but it is not valid, generating new token', user.username);
            generateNewTokenForUser(user, callback);
          } else {
            _logger.info('User: \'%s\' already has a valid token, skipping token generation', user.username);
            user.tokenExpiration = token.expiresAt;
            callback(null, user);
          }
        });
      } else {
        _logger.info('User: \'%s\' does not have a token, generating one', user.username);
        generateNewTokenForUser(user, callback);
      }
    };

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

    this.authenticateWithToken = function(username, token, callback) {
        _userModel.findByUsername(username, function(err, user) {
            if (token == user.token) {
                if (user.tokenExpiration < DateTime.now()) {
                    _logger.error('Token expired for username: %s', username);
                    callback('Token expired');
                } else {
                    _logger.info('Token validated successfully for username: %s', username);
                    callback(null, user);
                }
            } else {
                _logger.error('Wrong token for username: %s', username);
                callback('Token incorrect');
            }
        });
    };
}

module.exports = UserService;
