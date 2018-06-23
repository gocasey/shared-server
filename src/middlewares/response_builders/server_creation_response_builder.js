const ServerResponseBuilder = require('./server_response_builder.js');

function ServerCreationResponseBuilder(logger) {
  let _serverResponseBuilder = new ServerResponseBuilder(logger);

  this.buildResponse = function(req, res) {
    _serverResponseBuilder.buildSingleResponse(req, res, 201);
  };
}

module.exports = ServerCreationResponseBuilder;
