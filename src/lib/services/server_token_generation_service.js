const TokenGenerationService = require('../services/token_generation_service.js');

function ServerTokenGenerationService(logger) {

  let _tokenGenerationService = new TokenGenerationService(logger);

  function getServerData(server) {
    return {
      id: server.id,
      name: server.name,
      is_admin: false,
    };
  }

  this.generateToken = async (server) => {
    let serverData = getServerData(server);
    let serverExpiration = '12h';
    try {
      let token = await _tokenGenerationService.generateToken(serverData, serverExpiration);
      _logger.info('Token created for server: \'%s\'', server.name);
      return token;
    } catch (err) {
      _logger.error('Error creating token for server: \'%s\'', server.name);
      throw err;
    }
  }

  function isValidOwner(decodedData, owner) {
    return decodedData && (decodedData.id == owner.id) && (decodedData.name == owner.name) && (decodedData.is_admin == owner.is_admin);
  }

  this.validateTokenWithServer = async (token, server) => {
    try {
      let validatedToken = await _tokenGenerationService.validateToken(token, (decodedData) => {
        return isValidOwner(decodedData, getServerData(user));
      });
      _logger.info('Token validated for server: \'%s\'', server.name);
      return validatedToken;
    } catch (err) {
      _logger.error('Error validating token for server: \'%s\'', server.name);
      throw err;
    }
  }

  this.getServerIdFromToken = async (token) => {
    let decodedTokenData = await _tokenGenerationService.decodeTokenData(token);
    if (decodedTokenData.is_admin) {
      throw new Error('invalid token');
    }
    else {
      return decodedTokenData.id;
    }
  }
}

module.exports = ServerTokenGenerationService;