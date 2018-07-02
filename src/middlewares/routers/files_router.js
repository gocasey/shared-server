const FileController = require('../../controllers/file_controller.js');
const ServerController = require('../../controllers/server_controller.js');
const UserController = require('../../controllers/user_controller.js');
const FileCreationResponseBuilder = require('../../middlewares/response_builders/file_creation_response_builder.js');
const FileFindResponseBuilder = require('../../middlewares/response_builders/file_find_response_builder.js');
const GenericDeleteResponseBuilder = require('../../middlewares/response_builders/generic_delete_response_builder.js');
const AdminTokenAuthenticator = require('../../middlewares/authenticators/admin_token_authenticator.js');

function FilesRouter(app, logger, postgrePool) {
  let _adminTokenAuthenticator = new AdminTokenAuthenticator(logger, postgrePool);
  let _fileController = new FileController(logger, postgrePool);
  let _serverController = new ServerController(logger, postgrePool);
  let _userController = new UserController(logger, postgrePool);
  let _fileCreationResponseBuilder = new FileCreationResponseBuilder(logger);
  let _fileFindResponseBuilder = new FileFindResponseBuilder(logger);
  let _genericDeleteResponseBuilder = new GenericDeleteResponseBuilder(logger);

  // Consulta de archivos de un server
  app.get('/api/files',
    _adminTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _userController.updateLastConnection,
    _fileController.findServerFiles,
    _fileFindResponseBuilder.buildSetResponse
  );

  // Usuario sube archivo en formato multipart
  app.post('/api/files/upload_multipart',
    _adminTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _userController.updateLastConnection,
    _fileController.createFileFromMultipart,
    _fileCreationResponseBuilder.buildResponse
  );

  // Consulta de archivo
  app.get('/api/files/:fileId',
    _adminTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _userController.updateLastConnection,
    _fileController.findFile,
    _fileController.checkOwnership,
    _fileFindResponseBuilder.buildResponse
  );

  // Actualizacion de archivo
  app.put('/api/files/:fileId',
    _adminTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _userController.updateLastConnection,
    _fileController.findFile,
    _fileController.checkOwnership,
    _fileController.updateFile,
    _fileFindResponseBuilder.buildResponse
  );

  // Borrado de archivo
  app.delete('/api/files/:fileId',
    _adminTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _userController.updateLastConnection,
    _fileController.findFile,
    _fileController.checkOwnership,
    _fileController.deleteFile,
    _genericDeleteResponseBuilder.buildResponse
  );
}


module.exports = FilesRouter;
