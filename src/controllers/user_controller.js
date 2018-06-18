const UserService = require('../lib/services/user_service.js');
const UserTokenService = require('../lib/services/user_token_service.js');
const UserTokenGenerationServiceFactory = require('../lib/factories/user_token_generation_service_factory.js');
const UserOwnershipService = require('../lib/services/user_ownership_service.js');

function UserController(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;
  let _userService = new UserService(logger, postgrePool);
  let _userTokenGenerationServiceFactory = new UserTokenGenerationServiceFactory(logger);
  let _userOwnershipService = new UserOwnershipService(logger, postgrePool);

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
      res.token = token;
      return next();
    } catch (err) {
      _logger.error('An error occurred while generating the token for username: %s', user.username);
      return next(err);
    }
  };

  this.createUser = async (req, res, next) => {
    try {
      let user = await _userService.createUser(req.body);
      res.user = user;
      return next();
    } catch (err) {
      _logger.error('An error occurred while creating user with username: %s', req.body.username);
      return next(err);
    }
  };

  this.setOwnership = async (req, res, next) => {
    try {
      await _userOwnershipService.setOwnership(res.user, res.serverOwner);
    } catch (err) {
      _logger.error('An error occurred while setting ownership for user with username: %s', res.user.username);
      return next(err);
    }
    return next();
  };
}

module.exports = UserController;
