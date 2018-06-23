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

  function getTokenFromBody(req) {
    if (req.body && req.body.token) {
      return req.body.token;
    } else return null;
  }

  async function authenticate(token) {
    if (token) {
      let userId = await _userTokenService.validateToken(token);
      if (userId) {
        return await _userService.findUser(userId);
      }
    }
    throw new BaseHttpError('Unauthorized', 401);
  }

  this.authenticateFromHeader = async (req, res, next) => {
    let token = getTokenFromHeader(req);
    let userAuthenticated;
    try {
      userAuthenticated = await authenticate(token);
    } catch (error) {
      return next(error);
    }
    res.userAuthenticated = userAuthenticated;
    return next();
  };

  this.authenticateFromBody = async (req, res, next) => {
    let token = getTokenFromBody(req);
    let userAuthenticated;
    try {
      userAuthenticated = await authenticate(token);
    } catch (error) {
      return next(error);
    }
    res.userAuthenticated = userAuthenticated;
    res.token = await _userTokenService.retrieveToken(userAuthenticated);
    return next();
  };
}

module.exports = ApplicationUserTokenAuthenticator;
