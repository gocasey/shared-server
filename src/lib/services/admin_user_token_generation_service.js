const TokenGenerationService = require('../services/token_generation_service.js');

function AdminUserTokenGenerationService(logger) {

  let _tokenGenerationService = new TokenGenerationService(logger);

  function getAdminUserData(user) {
    return {
      id: user.user_id,
      name: user.username,
      is_admin: true,
    };
  }

  this.generateToken = async (user) => {
    let adminUserData = getAdminUserData(user);
    let adminUserExpiration = '12h';
    try {
      let token = await _tokenGenerationService.generateToken(adminUserData, adminUserExpiration);
      _logger.info('Token created for admin user: \'%s\'', user.username);
      return token;
    } catch (err) {
      _logger.error('Error creating token for admin user: \'%s\'', user.username);
      throw err;
    }
  }

  function isValidOwner(decodedData, owner) {
    return decodedData && (decodedData.id == owner.id) && (decodedData.name == owner.name) && (decodedData.is_admin == owner.is_admin);
  }

  this.validateToken = async (token, user) => {
    try {
      let validatedToken = await _tokenGenerationService.validateToken(token, (decodedData) => {
        return isValidOwner(decodedData, getAdminUserData(user));
      });
      _logger.info('Token validated for admin user: \'%s\'', user.username);
      return validatedToken;
    } catch (err) {
      _logger.error('Error validating token for admin user: \'%s\'', user.username);
      throw err;
    }
  }

  this.getUserIdFromToken = async (token) => {
    let decodedTokenData = await _tokenGenerationService.decodeTokenData(token);
    if (decodedTokenData.is_admin) {
      throw new Error('invalid token');
    }
    else {
      return decodedTokenData.id;
    }
  }
}

module.exports = AdminUserTokenGenerationService;