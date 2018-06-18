const pjson = require('../../../package.json');

function ServerResponseBuilder(logger) {
  let _logger = logger;

  this.buildSingleResponse = function(req, res, successStatusCode) {
    let server = res.server;
    let serverToken = res.serverToken;
    //let user = res.userAuthenticated;

    let response = getBasicSingleResponse();
    response.metadata.version = pjson.version;
    response.server.server.id = server.id;
    response.server.server.name = server.name;
    response.server.server._rev = server._rev;
    response.server.server.createdBy = server.createdBy;
    response.server.server.createdTime = server.createdTime;
    response.server.server.lastConnection = server.lastConnection;
    response.server.token.expiresAt = serverToken.tokenExpiration;
    response.server.token.token = serverToken.token;

    _logger.debug('Response: %j', response);
    res.status(successStatusCode).json(response);
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
          createdBy: '',
          createdTime: '',
          lastConnection: '',
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
      serverResponse.createdBy = server.createdBy;
      serverResponse.createdTime = server.createdTime;
      serverResponse.lastConnection = server.lastConnection;
      response.servers.push(serverResponse);
    });

    _logger.debug('Response: %j', response);
    res.status(200).json(response);
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
