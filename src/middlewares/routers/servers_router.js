const ServerController = require('../../controllers/server_controller.js');
const UserController = require('../../controllers/user_controller.js');
const ServerCreationResponseBuilder = require('../../middlewares/response_builders/server_creation_response_builder.js');
const ServerFindResponseBuilder = require('../../middlewares/response_builders/server_find_response_builder.js');
const GenericDeleteResponseBuilder = require('../../middlewares/response_builders/generic_delete_response_builder.js');
const AdminUserTokenAuthenticator = require('../../middlewares/authenticators/admin_user_token_authenticator.js');

function ServersRouter(app, logger, postgrePool) {
  let _serverController = new ServerController(logger, postgrePool);
  let _userController = new UserController(logger, postgrePool);
  let _serverCreationResponseBuilder = new ServerCreationResponseBuilder(logger);
  let _serverFindResponseBuilder = new ServerFindResponseBuilder(logger);
  let _adminUserTokenAuthenticator = new AdminUserTokenAuthenticator(logger, postgrePool);
  let _genericDeleteResponseBuilder = new GenericDeleteResponseBuilder(logger);

  // Alta de servidor
  app.post('/api/servers',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _userController.updateLastConnection,
    _serverController.createServer,
    _serverController.generateToken,
    _serverCreationResponseBuilder.buildResponse
  );

  // Consulta de servidor
  app.get('/api/servers/:serverId',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _userController.updateLastConnection,
    _serverController.findServer,
    _serverController.retrieveToken,
    _serverFindResponseBuilder.buildResponse
  );

  // Consulta de todos los servidores
  app.get('/api/servers',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _userController.updateLastConnection,
    _serverController.getAllServers,
    _serverFindResponseBuilder.buildSetResponse
  );

  // Reseteo de token
  app.post('/api/servers/:serverId',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _userController.updateLastConnection,
    _serverController.findServer,
    _serverController.generateToken,
    _serverFindResponseBuilder.buildResponse
  );

  // Modificacion de servidor
  app.put('/api/servers/:serverId',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _userController.updateLastConnection,
    _serverController.updateServer,
    _serverController.generateToken,
    _serverFindResponseBuilder.buildResponse
  );

  // Borrado de servidor
  app.delete('/api/servers/:serverId',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _userController.updateLastConnection,
    _serverController.deleteToken,
    _serverController.deleteFilesOwnedByServer,
    _serverController.deleteServer,
    _genericDeleteResponseBuilder.buildResponse
  );
}

module.exports = ServersRouter;
