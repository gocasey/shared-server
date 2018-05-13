const UserService = require('../lib/services/user_service.js');
const UserTokenService = require('../lib/services/user_token_service.js');

function UserController(logger, postgrePool) {
  let _logger = logger;
  let _userService = new UserService(logger, postgrePool);
  let _userTokenService = new UserTokenService(logger, postgrePool);

  this.generateToken = async (req, res, next) => {
    let user = res.user;
    try {
      let token = await _userTokenService.generateToken(user);
      res.data = token;
      return next();
    } catch (err) {
      _logger.error('An error ocurred while generating the token for username: %s', user.username);
      return next(err);
    }
  };

  this.createUser = async (req, res, next) => {
    try {
      let user = await _userService.createUser(req.body);
      res.data = user;
      return next();
    } catch (err) {
      _logger.error('An error ocurred while creating user with username: %s', req.body.username);
      return next(err);
    }
  };
}

module.exports = UserController;
