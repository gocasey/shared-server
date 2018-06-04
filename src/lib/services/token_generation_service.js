const jwt = require('jsonwebtoken');

function TokenGenerationService(logger) {
  let _logger = logger;

  this.decodeToken = (token) => {
    let tokenData = jwt.decode(token);
    return { token: token, expiresAt: tokenData.exp };
  };

  this.generateToken = async (owner) => {
    // replace hardcoded secret with private key
    try {
      let token = await jwt.sign({
        data: {
          id: owner.id,
          name: owner.name,
        },
      }, 'secret', { expiresIn: '1h' } );
      _logger.info('Token was created successfully for owner name: \'%s\'', owner.name);
      return this.decodeToken(token);
    } catch (err) {
      _logger.error('Token generation for owner name \'%s\' failed', owner.name);
      throw err;
    }
  };

  function isValidOwner(data, owner) {
    return data && (data.id == owner.id) && (data.name == owner.name);
  }

  this.validateToken = async (token, owner) => {
    // replace hardcoded secret with private key
    let decoded;
    try {
      decoded = await jwt.verify(token, 'secret');
    } catch (err) {
      _logger.error('Token could not be validated due to a failure: %s', err.message);
      throw err;
    }
    if (isValidOwner(decoded.data, owner)) {
      _logger.info('Token was validated successfully for owner name: \'%s\'', owner.name);
      return { token: token, expiresAt: decoded.exp };
    } else {
      _logger.error('Token could not be validated for owner name: \'%s\'', owner.name);
      throw new Error('Token validation failed');
    }
  };
}

module.exports = TokenGenerationService;
