const UserService = require('../../lib/services/user_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function PasswordAuthenticator(logger, postgrePool) {
    let _userService = new UserService(logger, postgrePool);

    this.authenticate = async (req, res, next) => {
      try {
        let user = await _userService.authenticateWithPassword(req.body.username, req.body.password);
        res.user = user;
        next();
      } catch (err) {
        let error = new BaseHttpError('Unauthorized', 401);
        next(error);
      }
    };
}

module.exports = PasswordAuthenticator;
