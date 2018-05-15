const jwt = require('jsonwebtoken');

function TokenGenerationService(logger) {
  let _logger = logger;

  this.generateToken = async (data, expiration) => {
    // replace hardcoded secret with private key
    try {
      let token = await jwt.sign({ data: data }, 'secret', { expiresIn: expiration } );
      _logger.info('Token created successfully');
      let tokenData = jwt.decode(token);
      return { token: token, expiresAt: tokenData.exp };
    } catch (err) {
      _logger.error('Token generation failed');
      throw err;
    }
  };

  async function decodeToken(token){
    // replace hardcoded secret with private key
    try {
      let decoded = await jwt.verify(token, 'secret');
      return decoded;
    } catch (err) {
      _logger.error('Token could not be validated due to a failure: %s', err.message);
      throw err;
    }
  }

  this.decodeTokenData = async (token) => {
    let decoded = await decodeToken(token);
    return decoded.data;
  };

  this.validateToken = async (token, validateFunction) => {
    let decoded = await decodeToken(token);
    if (validateFunction(decoded.data)) {
      _logger.info('Token was validated successfully');
      return { token: token, expiresAt: decoded.exp };
    } else {
      _logger.error('Token could not be validated');
      throw new Error('Token validation failed');
    }
  };
}

module.exports = TokenGenerationService;
