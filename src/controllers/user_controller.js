const UserService = require('../lib/services/user_service.js');
const UserTokenService = require('../lib/services/user_token_service.js');
const UserTokenGenerationServiceFactory = require('../lib/factories/user_token_generation_service_factory.js');

function UserController(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;
  let _userService = new UserService(logger, postgrePool);
  let _userTokenGenerationServiceFactory = new UserTokenGenerationServiceFactory(logger);

  this.generateTokenForApplicationUser = async (req, res, next) => {
    let tokenGenerationService = _userTokenGenerationServiceFactory.getApplicationUserTokenGenerationService();
    await generateToken(req, res, next, tokenGenerationService);
  };

  this.generateTokenForAdminUser = async (req, res, next) => {
    let tokenGenerationService = _userTokenGenerationServiceFactory.getAdminUserTokenGenerationService();
    await generateToken(req, res, next, tokenGenerationService);
  };

  async function generateToken(req, res, next, tokenGenerationService) {
    let userTokenService = new UserTokenService(_logger, _postgrePool, tokenGenerationService);
    let user = res.user;
    try {
      let token = await userTokenService.generateToken(user);
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
