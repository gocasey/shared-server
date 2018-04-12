const jwt = require('jsonwebtoken');

function TokenGenerationService(logger) {
    let _logger = logger;

    this.generateToken = function(username, callback) {
      // replace hardcoded secret with private key
      jwt.sign({
        data: username,
      }, 'secret', { expiresIn: '1h' }, function(err, token) {
        if (err) {
          _logger.error('Token generation for username %s failed', username);
          callback(err);
        } else {
          _logger.info('Token was created successfully for username %s', username);
          let tokenData = jwt.decode(token);
          callback(null, { token: token, expiresAt: tokenData.exp });
        }
      });
    };

    this.validateToken = function(token, username, callback) {
      // replace hardcoded secret with private key
      jwt.verify(token, 'secret', function(err, decoded) {
        if (err) {
          _logger.error('Token could not be validated due to a failure: %s', err.message);
          callback(err);
        } else if ((decoded.data) && (decoded.data == username)) {
            _logger.info('Token was validated successfully for username %s', username);
            callback();
        } else {
            _logger.error('Token could not be validated for username %s', username);
            callback('Token validation failed');
        }
      });
    };
}

module.exports = TokenGenerationService;
