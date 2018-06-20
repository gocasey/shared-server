const TokenResponseBuilder = require('./token_response_builder.js');

function TokenCreateResponseBuilder(logger) {
  let _tokenResponseBuilder = new TokenResponseBuilder(logger);

  this.buildResponse = function(req, res) {
    _tokenResponseBuilder.buildResponse(req, res, 201);
  };
}

module.exports = TokenCreateResponseBuilder;
