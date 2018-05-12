const ServerController = require('../../controllers/server_controller.js');
const ServerResponseBuilder = require('../../middlewares/response_builders/server_response_builder.js');

function ServersRouter(app, logger, postgrePool) {
  let _serverController = new ServerController(logger, postgrePool);
  let _serverResponseBuilder = new ServerResponseBuilder(logger);

  app.post('/api/servers',
    _serverController.createServer,
    _serverController.generateToken,
    _serverResponseBuilder.buildResponse
  );
}

module.exports = ServersRouter;
