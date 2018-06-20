const FileController = require('../../controllers/file_controller.js');
const ServerController = require('../../controllers/server_controller.js');
const FileCreationResponseBuilder = require('../../middlewares/response_builders/file_creation_response_builder.js');
const FileFindResponseBuilder = require('../../middlewares/response_builders/file_find_response_builder.js');
const ServerTokenAuthenticator = require('../../middlewares/authenticators/server_token_authenticator.js');
const ApplicationUserTokenAuthenticator = require('../authenticators/application_user_token_authenticator.js');

function FilesRouter(app, logger, postgrePool) {
  let _serverTokenAuthenticator = new ServerTokenAuthenticator(logger, postgrePool);
  let _applicationUserTokenAuthenticator = new ApplicationUserTokenAuthenticator(logger, postgrePool);
  let _fileController = new FileController(logger, postgrePool);
  let _serverController = new ServerController(logger, postgrePool);
  let _fileCreationResponseBuilder = new FileCreationResponseBuilder(logger);
  let _fileFindResponseBuilder = new FileFindResponseBuilder(logger);

  // Consulta de archivos de un server
  app.get('/api/files',
    _serverTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _fileController.findServerFiles,
    _fileFindResponseBuilder.buildSetResponse
  );

  // Usuario sube archivo en formato multipart
  app.post('/api/files/upload_multipart',
    _applicationUserTokenAuthenticator.authenticateFromHeader,
    _fileController.createFileFromMultipart,
    _fileCreationResponseBuilder.buildResponse
  );

  // Alta de archivo para server
  app.post('/api/files',
    _serverTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _fileController.assignOwnership,
    _fileFindResponseBuilder.buildResponse
  );

  // Consulta de archivo
  app.get('/api/files/:fileId',
    _serverTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _fileController.findFile,
    _fileController.checkOwnership,
    _fileFindResponseBuilder.buildResponse
  );

  // Actualizacion de archivo
  app.put('/api/files/:fileId',
    _serverTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _fileController.findFile,
    _fileController.checkOwnership,
    _fileController.updateFile,
    _fileFindResponseBuilder.buildResponse
  );
}


module.exports = FilesRouter;
