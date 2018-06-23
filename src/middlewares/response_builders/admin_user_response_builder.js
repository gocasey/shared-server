const pjson = require('../../../package.json');

function AdminUserResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let user = res.user;
    let userToken = res.token;

    let response = getBasicResponse();
    response.metadata.version = pjson.version;
    response.user.user.id = user.user_id;
    response.user.user._rev = user._rev;
    response.user.user.username = user.username;
    response.user.token.expiresAt = userToken.tokenExpiration;
    response.user.token.token = userToken.token;

    _logger.debug('Response: %j', response);
    res.status(201).json(response);
  };

  function getBasicResponse() {
    return {
      metadata: {
        version: '',
      },
      user: {
        user: {
          id: '',
          _rev: '',
          username: '',
        },
        token: {
          expiresAt: 0,
          token: '',
        },
      },
    };
  }
}

module.exports = AdminUserResponseBuilder;
