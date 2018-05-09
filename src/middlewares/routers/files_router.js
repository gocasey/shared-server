const FileController = require('../../controllers/file_controller.js');
const FileResponseBuilder = require('../../middlewares/response_builders/file_response_builder.js');

function FilesRouter(app, logger, postgrePool) {
  let _fileController = new FileController(logger, postgrePool);
  let _fileResponseBuilder = new FileResponseBuilder(logger);

  app.post('/api/files/upload',
    _fileController.createFile,
    _fileController.generateToken,
    _fileResponseBuilder.buildResponse
  );
}


module.exports = FilesRouter;
