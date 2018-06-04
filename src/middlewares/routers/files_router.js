const FileController = require('../../controllers/file_controller.js');
const FileResponseBuilder = require('../../middlewares/response_builders/file_response_builder.js');

function FilesRouter(app, logger, postgrePool) {
  let _fileController = new FileController(logger, postgrePool);
  let _fileResponseBuilder = new FileResponseBuilder(logger);

  // Usuario sube archivo
  app.post('/api/files/upload',
    _fileController.createFile,
    _fileResponseBuilder.buildResponse
  );

  // Actualizacion de archivo
  app.put('/api/files/:fileId',
    _fileController.updateFile,
    _fileResponseBuilder.buildResponse
  );
}


module.exports = FilesRouter;
