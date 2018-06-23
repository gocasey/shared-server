const TokenResponseBuilder = require('./token_response_builder.js');

function TokenFindResponseBuilder(logger) {
  let _tokenResponseBuilder = new TokenResponseBuilder(logger);

  this.buildResponse = function(req, res) {
    _tokenResponseBuilder.buildResponse(req, res, 200);
  };
}

module.exports = TokenFindResponseBuilder;
