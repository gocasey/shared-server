const UserService = require('../lib/services/user_service.js');
const UserTokenService = require('../lib/services/user_token_service.js');
const BaseHttpError = require('../errors/base_http_error.js');

function UserController(logger, postgrePool) {
  let _logger = logger;
  let _userService = new UserService(logger, postgrePool);
  let _userTokenService = new UserTokenService(logger, postgrePool);

  this.generateToken = function(req, res, next) {
    let user = res.user;
    _userTokenService.generateToken(user, function(err, token) {
      if (err) {
        _logger.error('An error ocurred while generating the token for username: %s', user.username);
        let error = new BaseHttpError('Internal Server Error', 'Internal Server Error', 500);
        next(error);
      } else {
        res.data = token;
        next();
      }
    });
  };

  this.createUser = function(req, res, next) {
    _userService.createUser(req.body, function(err, user) {
      if (err) {
        _logger.error('An error ocurred while creating user with username: %s', req.body.username);
        let error = new BaseHttpError('Internal Server Error', 'Internal Server Error', 500);
        next(error);
      } else {
        res.data = user;
        next();
      }
    });
  };
}

module.exports = UserController;
