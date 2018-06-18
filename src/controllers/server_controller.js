const ServerService = require('../lib/services/server_service.js');
const ServerTokenService = require('../lib/services/server_token_service.js');
const BaseHttpError = require('../errors/base_http_error.js');

function ServerController(logger, postgrePool) {
  let _logger = logger;
  let _serverService = new ServerService(logger, postgrePool);
  let _serverTokenService = new ServerTokenService(logger, postgrePool);

  this.createServer = async (req, res, next) => {
    let serverData = {
      name: req.body.name,
      createdBy: res.userAuthenticated.id,
    };
    let serverCreated;
    try {
      serverCreated = await _serverService.createServer(serverData);
    } catch (err) {
      _logger.error('An error occurred while creating server with name: %s', req.body.name);
      return next(err);
    }
    res.server = serverCreated;
    return next();
  };

  this.findServer = async (req, res, next) => {
    let serverFound;
    try {
      serverFound = await _serverService.findServer(req.params.serverId);
    } catch (err) {
      _logger.error('An error occurred while finding server with id: %s', req.params.serverId);
      return next(err);
    }
    res.server = serverFound;
    return next();
  };

  this.getAllServers = async (req, res, next) => {
    let servers;
    try {
      servers = await _serverService.getAllServers();
    } catch (err) {
      _logger.error('An error occurred while retrieving all the servers');
      return next(err);
    }
    res.servers = servers;
    return next();
  };

  this.updateServer = async (req, res, next) => {
    let serverDataToUpdate = {
      id: req.params.serverId,
      name: req.body.name,
      _rev: req.body._rev,
    };
    let serverUpdated;
    try {
      serverUpdated = await _serverService.updateServer(serverDataToUpdate);
    } catch (err) {
      _logger.error('An error occurred while updating server with id: %s', serverDataToUpdate.id);
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
      _logger.error('An error occurred while generating the token for server name: %s', server.name);
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
      _logger.error('An error occurred while retrieving the token for server name: %s', server.name);
      return next(err);
    }
    res.serverToken = token;
    return next();
  };

  this.updateLastConnection = async (req, res, next) => {
    try {
      await _serverService.updateLastConnection(res.serverAuthenticated);
    } catch (err) {
      _logger.error('An error occurred while updating server last connection for server_id: %s', res.serverAuthenticated.id);
      return next(err);
    }
    return next();
  };

  this.checkApplicationOwner = async (req, res, next) => {
    let serverOwner;
    try {
      serverOwner = await _serverService.findServerByName(req.body.applicationOwner);
    } catch (err) {
      _logger.error('An error occurred while finding server with name: %s', req.body.applicationOwner);
      return next(err);
    }
    if (! serverOwner) {
      _logger.error('Application owner: \'%s\' does not exist', req.body.applicationOwner);
      throw new BaseHttpError('Application owner does not exist', 422);
    }
    res.serverOwner = serverOwner;
    return next();
  };
}

module.exports = ServerController;
