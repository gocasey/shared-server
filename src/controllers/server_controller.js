const ServerService = require('../lib/services/server_service.js');
const ServerTokenService = require('../lib/services/server_token_service.js');

function ServerController(logger, postgrePool) {
  let _logger = logger;
  let _serverService = new ServerService(logger, postgrePool);
  let _serverTokenService = new ServerTokenService(logger, postgrePool);

  this.createServer = async (req, res, next) => {
    try {
      let server = await _serverService.createServer(req.body);
      res.server = server;
      return next();
    } catch (err) {
      _logger.error('An error ocurred while creating server with name: %s', req.body.name);
      return next(err);
    }
  };

  this.generateToken = async (req, res, next) => {
    let server = res.server;
    try {
      let token = await _serverTokenService.generateToken(server);
      res.serverToken = token;
      return next();
    } catch (err) {
      _logger.error('An error ocurred while generating the token for server name: %s', server.name);
      return next(err);
    }
  };
}

module.exports = ServerController;
