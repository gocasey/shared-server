const pjson = require('../../../package.json');

function TokenResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res, successStatusCode) {
    let token = res.token;

    let response = getBasicResponse();
    response.metadata.version = pjson.version;
    response.token.expiresAt = token.tokenExpiration;
    response.token.token = token.token;

    _logger.debug('Response: %j', response);
    res.status(successStatusCode).json(response);
  };

  function getBasicResponse() {
    return {
      metadata: {
        version: '',
      },
      token: {
        expiresAt: 0,
        token: '',
      },
    };
  }
}

module.exports = TokenResponseBuilder;
