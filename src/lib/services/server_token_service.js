const ServerTokenModel = require('../../models/server_token_model.js');
const TokenGenerationService = require('./token_generation_service');
const BaseHttpError = require('../../errors/base_http_error.js');

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

  async function generateNewTokenForServer(server) {
    let owner = getOwnerFromServer(server);
    let token = await _tokenGenerationService.generateToken(owner);
    await _serverTokenModel.createOrUpdate(server, token);
    let serverToken = {
      token: token.token,
      tokenExpiration: token.expiresAt,
    };
    return serverToken;
  }

  this.retrieveToken = async (server) => {
    let dbToken = await _serverTokenModel.findByServer(server);
    if (dbToken) {
      let decodedToken = _tokenGenerationService.decodeToken(dbToken.token);
      let serverToken = {
        token: decodedToken.token,
        tokenExpiration: decodedToken.expiresAt,
      };
      return serverToken;
    } else {
      _logger.error('Token for server with name: \'%s\' was not found', server.name);
      throw new BaseHttpError('Server does not have token', 500);
    }
  };

  this.generateToken = async (server) => {
    let token = await _serverTokenModel.findByServer(server);
    if (token) {
      let owner = getOwnerFromServer(server);
      try {
        let validatedToken = await _tokenGenerationService.validateToken(token.token, owner);
        _logger.info('Server with name: \'%s\' already has a valid token, skipping token generation', server.name);
        let serverToken = {
          token: validatedToken.token,
          tokenExpiration: validatedToken.expiresAt,
        };
        return serverToken;
      } catch (err) {
        _logger.info('Server with name: \'%s\' already has a token but it is not valid, generating new token', server.name);
        return await generateNewTokenForServer(server);
      }
    } else {
      _logger.info('Server with name: \'%s\' does not have a token, generating one', server.name);
      return await generateNewTokenForServer(server);
    }
  };
}

module.exports = ServerTokenService;
