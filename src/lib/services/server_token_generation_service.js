const TokenGenerationService = require('../services/token_generation_service.js');

function ServerTokenGenerationService(logger) {
  let _logger = logger;
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
  };

  function isValidOwner(decodedData, owner) {
    return decodedData && (decodedData.id == owner.id) && (decodedData.name == owner.name) && (decodedData.is_admin == owner.is_admin);
  }

  this.validateToken = async (token, server) => {
    let validatedToken;
    try {
      validatedToken = await _tokenGenerationService.validateToken(token, (decodedData) => {
        return isValidOwner(decodedData, getServerData(server));
      });
    } catch (err) {
      _logger.error('Error validating token for server: \'%s\'', server.name);
      throw err;
    }
    _logger.info('Token validated for server: \'%s\'', server.name);
    return validatedToken;
  };

  this.validatePermissions = async (token) => {
    let decodedTokenData = await _tokenGenerationService.decodeTokenData(token);
    return ! decodedTokenData.is_admin;
  };

  this.getServerIdFromToken = async (token) => {
    let decodedTokenData = await _tokenGenerationService.decodeTokenData(token);
    return decodedTokenData.id;
  };
}

module.exports = ServerTokenGenerationService;
