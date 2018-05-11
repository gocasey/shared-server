const ServerModel = require('../../models/server_model.js');

function ServerService(logger, postgrePool) {
  let _logger = logger;
  let _serverModel = new ServerModel(logger, postgrePool);

  this.createServer = async (body) => {
    let serverData = {
      name: body.name,
    };
    try {
      return await _serverModel.create(serverData);
    } catch (createErr) {
      try {
        let server = await _serverModel.findByServerName(serverData.name);
        if (server) {
          _logger.error('There is already a server with name: \'%s\'', serverData.name);
          throw new Error('Server name already in usage');
        } else throw createErr;
      } catch (findErr) {
        _logger.error('An error happened while creating the server with name: \'%s\'', serverData.name);
        throw new Error('Server creation error');
      }
    }
  };
}

module.exports = ServerService;
