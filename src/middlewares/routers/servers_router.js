const ServerController = require('../../controllers/server_controller.js');
const ServerCreationResponseBuilder = require('../../middlewares/response_builders/server_creation_response_builder.js');
const ServerFindResponseBuilder = require('../../middlewares/response_builders/server_find_response_builder.js');
const AdminUserTokenAuthenticator = require('../../middlewares/authenticators/admin_user_token_authenticator.js');

function ServersRouter(app, logger, postgrePool) {
  let _serverController = new ServerController(logger, postgrePool);
  let _serverCreationResponseBuilder = new ServerCreationResponseBuilder(logger);
  let _serverFindResponseBuilder = new ServerFindResponseBuilder(logger);
  let _adminUserTokenAuthenticator = new AdminUserTokenAuthenticator(logger, postgrePool);

  // Alta de servidor
  app.post('/api/servers',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _serverController.createServer,
    _serverController.generateToken,
    _serverCreationResponseBuilder.buildResponse
  );

  // Consulta de servidor
  app.get('/api/servers/:serverId',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _serverController.findServer,
    _serverController.retrieveToken,
    _serverFindResponseBuilder.buildResponse
  );

  // Consulta de todos los servidores
  app.get('/api/servers',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _serverController.getAllServers,
    _serverFindResponseBuilder.buildSetResponse
  );

  // Reseteo de token
  app.post('/api/servers/:serverId',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _serverController.findServer,
    _serverController.generateToken,
    _serverFindResponseBuilder.buildResponse
  );

  // Modificacion de servidor
  app.put('/api/servers/:serverId',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _serverController.updateServer,
    _serverController.generateToken,
    _serverFindResponseBuilder.buildResponse
  );
}

module.exports = ServersRouter;
