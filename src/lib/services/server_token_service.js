const ServerTokenModel = require('../../models/server_token_model.js');
const ServerTokenGenerationService = require('./server_token_generation_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function ServerTokenService(logger, postgrePool) {
  let _logger = logger;
  let _serverTokenModel = new ServerTokenModel(logger, postgrePool);
  let _serverTokenGenerationService = new ServerTokenGenerationService(logger);

  function getOwnerFromServer(server) {
    return {
      id: server.id,
      name: server.name,
    };
  }

  async function generateNewTokenForServer(server) {
    let owner = getOwnerFromServer(server);
    let token = await _serverTokenGenerationService.generateToken(owner);
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
      let decodedToken = await _serverTokenGenerationService.validateToken(dbToken.token, server);
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
        let validatedToken = await _serverTokenGenerationService.validateToken(token.token, owner);
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

  this.validateToken = async (token) => {
    let serverId = await _serverTokenGenerationService.getServerIdFromToken(token);
    let serverToken = await _serverTokenModel.findByServerId(serverId);
    if ((serverToken) && (token === serverToken.token)) {
      if (_serverTokenGenerationService.validatePermissions(token)) {
        _logger.info('Token was validated successfully for server_id:\'%s\'', serverId);
        return serverId;
      } else {
        _logger.error('Token does not have the required permissions');
      }
    } else {
      _logger.debug('Token was validated for server_id:\'%s\' but does not match the token saved in the database for that server', serverId);
      _logger.error('Token contains inconsistent data');
    }
    return null;
  };
}

module.exports = ServerTokenService;
