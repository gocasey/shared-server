const ServerResponseBuilder = require('./server_response_builder.js');

function ServerFindResponseBuilder(logger) {
  let _serverResponseBuilder = new ServerResponseBuilder(logger);

  this.buildResponse = function(req, res) {
    _serverResponseBuilder.buildSingleResponse(req, res, 200);
  };

  this.buildSetResponse = function(req, res) {
    _serverResponseBuilder.buildSetResponse(req, res);
  };
}

module.exports = ServerFindResponseBuilder;
