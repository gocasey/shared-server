const UserService = require('../../lib/services/user_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function TokenAuthenticator(logger, postgrePool) {
  let _userService = new UserService(logger, postgrePool);

  function getToken(req){
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    } else return null;
  }

  this.authenticate = async (req, res, next) => {
    let token = getToken(req);
    if (token) {
      _userService.authenticateWithToken(req.body.username, token, function (err) {
        if (err) {
          let error = new BaseHttpError('Unauthorized', 401);
          next(error);
        } else {
          next();
        }
      });
    } else {
      let error = new BaseHttpError('Unauthorized', 401);
      next(error);
    }
  };
}

module.exports = TokenAuthenticator;
