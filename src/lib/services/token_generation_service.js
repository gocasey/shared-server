const jwt = require('jsonwebtoken');

function TokenGenerationService(logger) {
    let _logger = logger;

    this.generateToken = function(owner, callback) {
      // replace hardcoded secret with private key
      jwt.sign({
        data: {
          id: owner.id,
          name: owner.name,
        },
      }, 'secret', { expiresIn: '1h' }, function(err, token) {
        if (err) {
          _logger.error('Token generation for owner name \'%s\' failed', owner.name);
          callback(err);
        } else {
          _logger.info('Token was created successfully for owner name: \'%s\'', owner.name);
          let tokenData = jwt.decode(token);
          callback(null, { token: token, expiresAt: tokenData.exp });
        }
      });
    };

    function isValidOwner(data, owner) {
      return data && (data.id == owner.id) && (data.name == owner.name);
    }

    this.validateToken = function(token, owner, callback) {
      // replace hardcoded secret with private key
      jwt.verify(token, 'secret', function(err, decoded) {
        if (err) {
          _logger.error('Token could not be validated due to a failure: %s', err.message);
          callback(err);
        } else if (isValidOwner(decoded.data, owner)) {
            _logger.info('Token was validated successfully for owner name: \'%s\'', owner.name);
            callback(null, { token: token, expiresAt: decoded.exp });
        } else {
            _logger.error('Token could not be validated for owner name: \'%s\'', owner.name);
            callback('Token validation failed');
        }
      });
    };
}

module.exports = TokenGenerationService;
