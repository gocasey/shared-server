const FileService = require('../lib/services/file_service.js');
const BaseHttpError = require('../errors/base_http_error.js');

function FileController(logger, postgrePool) {
  let _logger = logger;
  let _fileService = new FileService(logger, postgrePool);

  this.createFile = function(req, res, next) {
    _fileService.createFile(req.body, function(err, file) {
      if (err) {
        _logger.error('An error ocurred while creating file with name: %s', req.body.name);
        let error = new BaseHttpError('Internal Server Error', 'Internal Server Error', 500);
        next(error);
      } else {
        res.file = file;
        next();
      }
    });
  };
}

module.exports = FileController;
