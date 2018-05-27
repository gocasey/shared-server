const FileService = require('../lib/services/file_service.js');

function FileController(logger, postgrePool) {
  let _logger = logger;
  let _fileService = new FileService(logger, postgrePool);

  this.createFile = async (req, res, next) => {
    let fileUploaded;
    try {
      fileUploaded = await _fileService.createFile(req.body);
    } catch (err) {
      _logger.error('An error ocurred while creating the file');
      return next(err);
    }
    res.file = fileUploaded;
    return next();
  };
}

module.exports = FileController;
