const ServerController = require('../../controllers/server_controller.js');
const ServerResponseBuilder = require('../../middlewares/response_builders/server_response_builder.js');

function ServersRouter(app, logger, postgrePool) {
  let _serverController = new ServerController(logger, postgrePool);
  let _serverResponseBuilder = new ServerResponseBuilder(logger);

  // Alta de servidor
  app.post('/api/servers',
    _serverController.createServer,
    _serverController.generateToken,
    _serverResponseBuilder.buildSingleResponse
  );

  // Consulta de servidor
  app.get('/api/servers/:serverId',
    _serverController.findServer,
    _serverController.retrieveToken,
    _serverResponseBuilder.buildSingleResponse
  );

  // Consulta de todos los servidores
  app.get('/api/servers',
    _serverController.getAllServers,
    _serverResponseBuilder.buildSetResponse
  );

  // Reseteo de token
  app.post('/api/servers/:serverId',
    _serverController.findServer,
    _serverController.generateToken,
    _serverResponseBuilder.buildSingleResponse
  );

  // Modificacion de servidor
  app.put('/api/servers/:serverId',
    _serverController.updateServer,
    _serverController.generateToken,
    _serverResponseBuilder.buildSingleResponse
  );
}

module.exports = ServersRouter;
