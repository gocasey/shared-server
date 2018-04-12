var UserModel = require('../../models/user_model.js');
var TokenGenerationService = require('./token_generation_service');

function UserService(logger, postgrePool){

    var _logger = logger;
    var _userModel = new UserModel(logger, postgrePool);
    var _tokenGenerationService = new TokenGenerationService();

    function generateNewTokenForUser(user, callback){
      _tokenGenerationService.generateToken(user.username, function(err, token){
        if (err) callback (err);
        else {
          user.token = token;
          _userModel.save(user);
          callback(null, user);
        }
      });
    }

    this.generateToken = function(username, callback){
        _userModel.findByUsername(username, function(err, user){
            if (err) return callback(err);
            else{
                if (user.token){
                  _tokenGenerationService.validateToken(user.token, user.username, function(err){
                    if (err){
                      _logger.info('User: \'%s\' already has a token but it is not valid, generating new token', username);
                      generateNewTokenForUser(user, callback);
                    }
                    else{
                      _logger.info('User: \'%s\' already has a valid token, skipping token generation', username);
                      callback();
                    }
                  })
                }
                else{
                  _logger.info('User: \'%s\' does not have a token, generating one');
                  generateNewTokenForUser(user, callback);
                }
            }
        });
    };

    this.authenticateWithPassword = function(username, password, callback){
        _userModel.findByUsername(username, function(err, user){
            if (hash(password) == user.password){
                _logger.info('Password validated succesfully for username: %s', username);
                callback(null, user);
            }
            else{
                _logger.error('Wrong password for username: %s', username);
                callback('Password incorrect');
            }
        });
    };

    this.authenticateWithToken = function(username, token, callback){
        _userModel.findByUsername(username, function(err, user){
            if (token == user.token){
                if (user.tokenExpiration < DateTime.now()){
                    _logger.error('Token expired for username: %s', username);
                    callback('Token expired');
                }
                else {
                    _logger.info('Token validated succesfully for username: %s', username);
                    callback(null, user);
                }
            }
            else{
                _logger.error('Wrong token for username: %s', username);
                callback('Token incorrect');
            }
        });
    };
}

module.exports = UserService
