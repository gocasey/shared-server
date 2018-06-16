const ServerTokenService = require('../../lib/services/server_token_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function ServerTokenAuthenticator(logger, postgrePool) {
  let _serverTokenService = new ServerTokenService(logger, postgrePool);

  function getTokenFromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else return null;
  }

  async function authenticate(token, next) {
    if (token) {
      try {
        await _serverTokenService.validateToken(token);
        return next();
      } catch (err) {
        let error = new BaseHttpError('Unauthorized', 401);
        return next(error);
      }
    } else {
      let error = new BaseHttpError('Unauthorized', 401);
      return next(error);
    }
  }

  this.authenticateFromHeader = async (req, res, next) => {
    let token = getTokenFromHeader(req);
    await authenticate(token, next);
  };

  this.authenticateFromQuerystring = async (req, res, next) => {
    let token = getTokenFromQuerystring(req);
    await authenticate(token, next);
  };
}

module.exports = ServerTokenAuthenticator;
