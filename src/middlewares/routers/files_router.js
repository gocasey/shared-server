const FileController = require('../../controllers/file_controller.js');
const FileResponseBuilder = require('../../middlewares/response_builders/file_response_builder.js');
const ServerTokenAuthenticator = require('../../middlewares/authenticators/server_token_authenticator.js');
const UserTokenAuthenticator = require('../authenticators/application_user_token_authenticator.js');

function FilesRouter(app, logger, postgrePool) {
  let _serverTokenAuthenticator = new ServerTokenAuthenticator(logger, postgrePool);
  let _userTokenAuthenticator = new UserTokenAuthenticator(logger, postgrePool);
  let _fileController = new FileController(logger, postgrePool);
  let _fileResponseBuilder = new FileResponseBuilder(logger);

  // Consulta de archivos de un server
  app.get('/api/files',
    _serverTokenAuthenticator.authenticateFromHeader,
    _fileController.findServerFiles,
    _fileResponseBuilder.buildSetResponse
  );

  // Usuario sube archivo en json
  app.post('/api/files/upload',
    _serverTokenAuthenticator.authenticateFromHeader,
    _userTokenAuthenticator.authenticateFromQuerystring,
    _fileController.createFileFromJson,
    _fileResponseBuilder.buildSingleResponse
  );

  // Usuario sube archivo en formato multipart
  app.post('/api/files/upload_multipart',
    _serverTokenAuthenticator.authenticateFromHeader,
    _userTokenAuthenticator.authenticateFromQuerystring,
    _fileController.createFileFromMultipart,
    _fileResponseBuilder.buildSingleResponse
  );

  // Alta de archivo para server
  app.post('/api/files',
    _serverTokenAuthenticator.authenticateFromHeader,
    _fileController.assignOwnership,
    _fileResponseBuilder.buildSingleResponse
  );

  // Consulta de archivo
  app.get('/api/files/:fileId',
    _serverTokenAuthenticator.authenticateFromHeader,
    _fileController.findFile,
    _fileController.checkOwnership,
    _fileResponseBuilder.buildSingleResponse
  );

  // Actualizacion de archivo
  app.put('/api/files/:fileId',
    _serverTokenAuthenticator.authenticateFromHeader,
    _fileController.findFile,
    _fileController.checkOwnership,
    _fileController.updateFile,
    _fileResponseBuilder.buildSingleResponse
  );
}


module.exports = FilesRouter;
