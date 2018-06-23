const ServerTokenService = require('../../lib/services/server_token_service.js');
const ServerService = require('../../lib/services/server_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function ServerTokenAuthenticator(logger, postgrePool) {
  let _serverTokenService = new ServerTokenService(logger, postgrePool);
  let _serverService = new ServerService(logger, postgrePool);

  function getTokenFromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else return null;
  }

  async function authenticate(res, next, token) {
    if (token) {
      let serverId = await _serverTokenService.validateToken(token);
      if (serverId) {
        res.serverAuthenticated = await _serverService.findServer(serverId);
        return next();
      }
    }
    let error = new BaseHttpError('Unauthorized', 401);
    return next(error);
  }

  this.authenticateFromHeader = async (req, res, next) => {
    let token = getTokenFromHeader(req);
    await authenticate(res, next, token);
  };

  this.authenticateFromQuerystring = async (req, res, next) => {
    let token = getTokenFromQuerystring(req);
    await authenticate(res, next, token);
  };
}

module.exports = ServerTokenAuthenticator;
