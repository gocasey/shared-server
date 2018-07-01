const FileResponseBuilder = require('./file_response_builder.js');

function FileFindResponseBuilder(logger) {
  let _fileResponseBuilder = new FileResponseBuilder(logger);

  this.buildResponse = function(req, res) {
    _fileResponseBuilder.buildSingleResponse(req, res, 200);
  };

  this.buildSetResponse = function(req, res) {
    _fileResponseBuilder.buildSetResponse(req, res);
  };
}

module.exports = FileFindResponseBuilder;
