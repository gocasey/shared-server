const pjson = require('../../../package.json');

function ServerResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let server = res.server;
    let serverToken = res.serverToken;

    let response = getBasicResponse();
    response.metadata.version = pjson.version;
    response.server.server.id = server.id;
    response.server.server.name = server.name;
    response.server.server._rev = server._rev;
    response.server.token.expiresAt = serverToken.tokenExpiration;
    response.server.token.token = serverToken.token;

    _logger.debug('Response: %j', response);
    res.json(response);
  };

  function getBasicResponse() {
    return {
      metadata: {
        version: '',
      },
      server: {
        server: {
          id: '',
          _rev: '',
          name: '',
          // createdBy: '',
          // createdTime: 0,
          // lastConnection: 0
        },
        token: {
          expiresAt: 0,
          token: '',
        },
      },
    };
  }
}

module.exports = ServerResponseBuilder;