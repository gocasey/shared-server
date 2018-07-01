
function ApplicationUserTokenGenerationService(logger, tokenGenerationService) {
  let _logger = logger;
  let _tokenGenerationService = tokenGenerationService;

  function getApplicationUserData(user) {
    return {
      id: user.user_id,
      name: user.username,
      is_admin: false,
    };
  }

  this.generateToken = async (user) => {
    let applicationUserData = getApplicationUserData(user);
    let applicationUserExpiration = '1h';
    let token;
    try {
      token = await _tokenGenerationService.generateToken(applicationUserData, applicationUserExpiration);
    } catch (err) {
      _logger.error('Error creating token for user: \'%s\'', user.username);
      throw err;
    }
    _logger.info('Token created for user: \'%s\'', user.username);
    return token;
  };

  function isValidOwner(decodedData, owner) {
    return decodedData && (decodedData.id == owner.id) && (decodedData.name == owner.name) && (decodedData.is_admin == owner.is_admin);
  }

  this.validateToken = async (token, user) => {
    let validatedToken;
    try {
      validatedToken = await _tokenGenerationService.validateToken(token, (decodedData) => {
        return isValidOwner(decodedData, getApplicationUserData(user));
      });
    } catch (err) {
      _logger.error('Error validating token for user: \'%s\'', user.username);
      throw err;
    }
    _logger.info('Token validated for user: \'%s\'', user.username);
    return validatedToken;
  };

  this.validatePermissions = async (token) => {
    let decodedTokenData = await _tokenGenerationService.decodeTokenData(token);
    return ! decodedTokenData.is_admin;
  };

  this.getUserIdFromToken = async (token) => {
    let decodedTokenData = await _tokenGenerationService.decodeTokenData(token);
    return decodedTokenData.id;
  };
}

module.exports = ApplicationUserTokenGenerationService;
