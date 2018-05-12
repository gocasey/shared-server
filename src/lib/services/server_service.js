const ServerModel = require('../../models/server_model.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function ServerService(logger, postgrePool) {
  let _logger = logger;
  let _serverModel = new ServerModel(logger, postgrePool);

  this.createServer = async (body) => {
    let serverData = {
      name: body.name,
    };
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
}

module.exports = ServerService;
