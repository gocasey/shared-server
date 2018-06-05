const pjson = require('../../../package.json');

function ServerResponseBuilder(logger) {
  let _logger = logger;

  this.buildSingleResponse = function(req, res) {
    let server = res.server;
    let serverToken = res.serverToken;

    let response = getBasicSingleResponse();
    response.metadata.version = pjson.version;
    response.server.server.id = server.id;
    response.server.server.name = server.name;
    response.server.server._rev = server._rev;
    response.server.server.createdTime = server.createdTime;
    response.server.token.expiresAt = serverToken.tokenExpiration;
    response.server.token.token = serverToken.token;

    _logger.debug('Response: %j', response);
    res.status(201).json(response);
  };

  function getBasicSingleResponse() {
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
          createdTime: '',
          // lastConnection: 0
        },
        token: {
          expiresAt: 0,
          token: '',
        },
      },
    };
  }

  this.buildSetResponse = function(req, res) {
    let servers = res.servers;

    let response = getBasicSetResponse();
    response.metadata.version = pjson.version;

    servers.forEach( (server) => {
      let serverResponse = {};
      serverResponse.id = server.id;
      serverResponse.name = server.name;
      serverResponse._rev = server._rev;
      serverResponse.createdTime = server.createdTime;
      response.servers.push(serverResponse);
    });

    _logger.debug('Response: %j', response);
    res.status(201).json(response);
  };

  function getBasicSetResponse() {
    return {
      metadata: {
        version: '',
      },
      servers: [],
    };
  }
}

module.exports = ServerResponseBuilder;
