const UserTokenService = require('../../lib/services/user_token_service.js');
const UserService = require('../../lib/services/user_service.js');
const UserTokenGenerationFactory = require('../../lib/factories/user_token_generation_service_factory.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function ApplicationUserTokenAuthenticator(logger, postgrePool) {
  let _userTokenGenerationFactory = new UserTokenGenerationFactory(logger);
  let _userTokenService = new UserTokenService(logger, postgrePool, _userTokenGenerationFactory.getApplicationUserTokenGenerationService());
  let _userService = new UserService(logger, postgrePool);

  function getTokenFromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else return null;
  }

  function getTokenFromQuerystring(req) {
    if (req.query && req.query.token) {
      return req.query.token;
    } else return null;
  }

  async function authenticate(res, next, token) {
    if (token) {
      let userId = await _userTokenService.validateToken(token);
      if (userId) {
        res.userAuthenticated = await _userService.findUser(userId);
        return next();
      }
    }
    let error = new BaseHttpError('User Unauthorized', 401);
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

module.exports = ApplicationUserTokenAuthenticator;
