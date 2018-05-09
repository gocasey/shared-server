const ServerTokenModel = require('../../models/server_token_model.js');
const TokenGenerationService = require('./token_generation_service');

function ServerTokenService(logger, postgrePool) {
  let _logger = logger;
  let _serverTokenModel = new ServerTokenModel(logger, postgrePool);
  let _tokenGenerationService = new TokenGenerationService(logger);

  function getOwnerFromServer(server) {
    return {
      id: server.id,
      name: server.name,
    };
  }

  function generateNewTokenForServer(server, callback) {
    let owner = getOwnerFromServer(server);
    _tokenGenerationService.generateToken(owner, function(err, token) {
      if (err) callback(err);
      else {
        _serverTokenModel.createOrUpdate(server, token, function(err) {
          if (err) callback(err);
          else {
            let serverToken = {
              token: token.token,
              tokenExpiration: token.expiresAt,
            };
            callback(null, serverToken);
          }
        });
      }
    });
  }

  this.generateToken = function(server, callback) {
    _serverTokenModel.findByServer(server, function(err, token) {
      if (err) {
        callback(err);
      } else {
        if (token) {
          let owner = getOwnerFromServer(server);
          _tokenGenerationService.validateToken(token.token, owner, function(err, token) {
            if (err) {
              _logger.info('Server with name: \'%s\' already has a token but it is not valid, generating new token', server.name);
              generateNewTokenForServer(server, callback);
            } else {
              _logger.info('Server with name: \'%s\' already has a valid token, skipping token generation', server.name);
              let serverToken = {
                token: token.token,
                tokenExpiration: token.expiresAt,
              };
              callback(null, serverToken);
            }
          });
        } else {
          _logger.info('Server with name: \'%s\' does not have a token, generating one', server.name);
          generateNewTokenForServer(server, callback);
        }
      }
    });
  };
}

module.exports = ServerTokenService;
