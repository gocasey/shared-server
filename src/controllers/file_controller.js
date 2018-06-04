const FileService = require('../lib/services/file_service.js');

function FileController(logger, postgrePool) {
  let _logger = logger;
  let _fileService = new FileService(logger, postgrePool);

  this.createFile = async (req, res, next) => {
    let fileDataToCreate = {
      encodedFile: req.body.file,
      name: req.body.metadata.name,
    };
    let fileUploaded;
    try {
      fileUploaded = await _fileService.createFile(fileDataToCreate);
    } catch (err) {
      _logger.error('An error ocurred while creating the file');
      return next(err);
    }
    res.file = fileUploaded;
    return next();
  };

  this.updateFile = async (req, res, next) => {
    let fileDataToUpdate = {
      id: req.params.fileId,
      filename: req.body.filename,
      _rev: req.body._rev,
      size: req.body.size,
      resource: req.body.resource,
    };
    let fileModified;
    try {
      fileModified = await _fileService.updateFile(fileDataToUpdate);
    } catch (err) {
      _logger.error('An error ocurred while updating the file');
      return next(err);
    }
    res.file = fileModified;
    return next();
  };
}

module.exports = FileController;
