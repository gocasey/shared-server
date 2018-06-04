const ServerService = require('../lib/services/server_service.js');
const ServerTokenService = require('../lib/services/server_token_service.js');

function ServerController(logger, postgrePool) {
  let _logger = logger;
  let _serverService = new ServerService(logger, postgrePool);
  let _serverTokenService = new ServerTokenService(logger, postgrePool);

  this.createServer = async (req, res, next) => {
    let serverData = {
      name: req.body.name,
    };
    let serverCreated;
    try {
      serverCreated = await _serverService.createServer(serverData);
    } catch (err) {
      _logger.error('An error ocurred while creating server with name: %s', req.body.name);
      return next(err);
    }
    res.server = serverCreated;
    return next();
  };

  this.findServer = async (req, res, next) => {
    let serverFound;
    try {
      serverFound = await _serverService.findServer(req.params.fileId);
    } catch (err) {
      _logger.error('An error ocurred while finding server with id: %s', req.params.fileId);
      return next(err);
    }
    res.server = serverFound;
    return next();
  };

  this.updateServer = async (req, res, next) => {
    let serverDataToUpdate = {
      id: req.params.fileId,
      name: req.body.name,
      _rev: req.body._rev,
    };
    let serverUpdated;
    try {
      serverUpdated = await _serverService.updateServer(serverDataToUpdate);
    } catch (err) {
      _logger.error('An error ocurred while updating server with id: %s', serverDataToUpdate.id);
      return next(err);
    }
    res.server = serverUpdated;
    return next();
  };

  this.generateToken = async (req, res, next) => {
    let server = res.server;
    let token;
    try {
      token = await _serverTokenService.generateToken(server);
    } catch (err) {
      _logger.error('An error ocurred while generating the token for server name: %s', server.name);
      return next(err);
    }
    res.serverToken = token;
    return next();
  };

  this.retrieveToken = async (req, res, next) => {
    let server = res.server;
    let token;
    try {
      token = await _serverTokenService.retrieveToken(server);
    } catch (err) {
      _logger.error('An error ocurred while retrieving the token for server name: %s', server.name);
      return next(err);
    }
    res.serverToken = token;
    return next();
  };
}

module.exports = ServerController;
