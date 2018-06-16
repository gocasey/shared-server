const UserTokenService = require('../../lib/services/user_token_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function TokenAuthenticator(logger, postgrePool) {
  let _userTokenService = new UserTokenService(logger, postgrePool);

  function getToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    } else return null;
  }

  this.authenticate = async (req, res, next) => {
    let token = getToken(req);
    if (token) {
      try {
        await _userTokenService.validateToken(token);
        return next();
      }
      catch (err) {
        let error = new BaseHttpError('Unauthorized', 401);
        return next(error);
      }
    } else {
      let error = new BaseHttpError('Unauthorized', 401);
      return next(error);
    }
  };
}

module.exports = TokenAuthenticator;
