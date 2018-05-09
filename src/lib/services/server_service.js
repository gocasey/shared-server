const ServerModel = require('../../models/server_model.js');

function ServerService(logger, postgrePool) {
  let _logger = logger;
  let _serverModel = new ServerModel(logger, postgrePool);

  this.createServer = function(body, callback) {
    let serverData = {
      name: body.name,
    };
    _serverModel.create(serverData, function(createErr, server) {
      if (createErr) {
        _serverModel.findByServerName(serverData.name, function(findErr) {
          if (findErr) {
            _logger.error('An error happened while creating the server with name: \'%s\'', serverData.name);
            callback('Server creation error');
          } else {
            _logger.error('There is already a server with name: \'%s\'', serverData.name);
            callback('Server name already in usage');
          }
        });
      } else {
        callback(null, server);
      }
    });
  };
}

module.exports = ServerService;
