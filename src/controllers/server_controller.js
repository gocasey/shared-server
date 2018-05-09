const ServerService = require('../lib/services/server_service.js');
const ServerTokenService = require('../lib/services/server_token_service.js');
const BaseHttpError = require('../errors/base_http_error.js');

function ServerController(logger, postgrePool) {
  let _logger = logger;
  let _serverService = new ServerService(logger, postgrePool);
  let _serverTokenService = new ServerTokenService(logger, postgrePool);

  this.createServer = function(req, res, next) {
    _serverService.createServer(req.body, function(err, server) {
      if (err) {
        _logger.error('An error ocurred while creating server with name: %s', req.body.name);
        let error = new BaseHttpError('Internal Server Error', 'Internal Server Error', 500);
        next(error);
      } else {
        res.server = server;
        next();
      }
    });
  };

  this.generateToken = function(req, res, next) {
    let server = res.server;
    _serverTokenService.generateToken(server, function(err, token) {
      if (err) {
        _logger.error('An error ocurred while generating the token for server name: %s', server.name);
        let error = new BaseHttpError('Internal Server Error', 'Internal Server Error', 500);
        next(error);
      } else {
        res.serverToken = token;
        next();
      }
    });
  };
}

module.exports = ServerController;
