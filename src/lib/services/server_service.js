const ServerModel = require('../../models/server_model.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function ServerService(logger, postgrePool) {
  let _logger = logger;
  let _serverModel = new ServerModel(logger, postgrePool);

  this.createServer = async (serverData) => {
    let err;
    try {
      return await _serverModel.create(serverData);
    } catch (createErr) {
      err = createErr;
    }
    if (err) {
      let server;
      try {
        server = await _serverModel.findByServerName(serverData.name);
      } catch (findErr) {
        _logger.error('An error happened while creating the server with name: \'%s\'', serverData.name);
        throw new BaseHttpError('Server creation error', 500);
      }
      if (server) {
        _logger.error('There is already a server with name: \'%s\'', serverData.name);
        throw new BaseHttpError('Server name already exists', 400);
      } else throw new BaseHttpError('Server creation error', 500);
    }
  };

  this.findServer = async (serverId) => {
    let server;
    try {
      server = await _serverModel.findByServerId(serverId);
    } catch (findErr) {
      _logger.error('An error happened while looking for the server with id: \'%s\'', serverId);
      throw new BaseHttpError('Server find error', 500);
    }
    if (server) {
      return server;
    } else {
      _logger.error('The server with id: \'%s\' was not found', serverId);
      throw new BaseHttpError('Server does not exist', 404);
    }
  };

  this.getAllServers = async () => {
    try {
      return await _serverModel.getAllServers();
    } catch (findErr) {
      _logger.error('An error happened while retrieving all the servers');
      throw new BaseHttpError('Servers retrieval error', 500);
    }
  };

  this.updateServer = async (serverData) => {
    try {
      return await _serverModel.update(serverData);
    } catch (updateErr) {
      _logger.error('An error happened while updating the server with id: \'%s\'', serverData.id);
      if (updateErr.message == 'Server does not exist') {
        throw new BaseHttpError(updateErr.message, 404);
      } else if (updateErr.message == 'Integrity check error') {
        throw new BaseHttpError(updateErr.message, 409);
      } else throw new BaseHttpError('Server update error', 500);
    }
  };
}

module.exports = ServerService;
