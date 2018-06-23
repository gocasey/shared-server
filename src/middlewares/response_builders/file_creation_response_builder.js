const FileResponseBuilder = require('./file_response_builder.js');

function FileCreationResponseBuilder(logger) {
  let _fileResponseBuilder = new FileResponseBuilder(logger);

  this.buildResponse = function(req, res) {
    _fileResponseBuilder.buildSingleResponse(req, res, 201);
  };
}

module.exports = FileCreationResponseBuilder;
