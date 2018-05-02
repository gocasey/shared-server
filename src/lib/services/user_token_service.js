const UserTokenModel = require('../../models/user_token_model.js');
const TokenGenerationService = require('./token_generation_service');

function UserTokenService(logger, postgrePool) {
  let _logger = logger;
  let _userTokenModel = new UserTokenModel(logger, postgrePool);
  let _tokenGenerationService = new TokenGenerationService(logger);

  function getOwnerFromUser(user) {
    return {
      id: user.user_id,
      name: user.username,
    };
  }

  function generateNewTokenForUser(user, callback) {
    let owner = getOwnerFromUser(user);
    _tokenGenerationService.generateToken(owner, function(err, token) {
      if (err) callback(err);
      else {
        _userTokenModel.createOrUpdate(user, token, function(err) {
          if (err) callback(err);
          else {
            let userToken = {
              token: token.token,
              tokenExpiration: token.expiresAt,
            };
            callback(null, userToken);
          }
        });
      }
    });
  }

  this.generateToken = function(user, callback) {
    _userTokenModel.findByUser(user, function(err, token) {
      if (err) {
        callback(err);
      } else {
        if (token) {
          let owner = getOwnerFromUser(user);
          _tokenGenerationService.validateToken(token.token, owner, function(err, token) {
            if (err) {
              _logger.info('User: \'%s\' already has a token but it is not valid, generating new token', user.username);
              generateNewTokenForUser(user, callback);
            } else {
              _logger.info('User: \'%s\' already has a valid token, skipping token generation', user.username);
              let userToken = {
                token: token.token,
                tokenExpiration: token.expiresAt,
              };
              callback(null, userToken);
            }
          });
        } else {
          _logger.info('User: \'%s\' does not have a token, generating one', user.username);
          generateNewTokenForUser(user, callback);
        }
      }
    });
  };
}

module.exports = UserTokenService;
