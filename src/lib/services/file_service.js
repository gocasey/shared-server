const FileModel = require('../../models/file_model.js');

function FileService(logger, postgrePool) {
  let _logger = logger;
  let _fileModel = new FileModel(logger, postgrePool);

  this.createFile = function(body, callback) {
    let fileData = {
      name: body.name,
    };
    _fileModel.create(fileData, function(createErr, file) {
      if (createErr) {
        _fileModel.findByFileName(fileData.name, function(findErr) {
          if (findErr) {
            _logger.error('An error happened while creating the file with name: \'%s\'', fileData.name);
            callback('File creation error');
          } else {
            _logger.error('There is already a file with name: \'%s\'', fileData.name);
            callback('File name already in usage');
          }
        });
      } else {
        callback(null, file);
      }
    });
  };
}

module.exports = FileService;
