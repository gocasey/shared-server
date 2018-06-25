const UserService = require('../../lib/services/user_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function PasswordAuthenticator(logger, postgrePool) {
  let _userService = new UserService(logger, postgrePool);

  this.authenticate = async (req, res, next) => {
    let user;
    try {
      user = await _userService.authenticateWithPassword(req.body.username, req.body.password);
    } catch (err) {
      let error = new BaseHttpError('Wrong password.', 401);
      return next(error);
    }
    res.user = user;
    return next();
  };
}

module.exports = PasswordAuthenticator;
