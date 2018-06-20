const ApplicationUserRegistrationSchemaValidator = require('../schema_validators/application_user_registration_schema_validator.js');
const ApplicationUserCredentialsSchemaValidator = require('../schema_validators/application_user_credentials_schema_validator.js');
const ServerTokenAuthenticator = require('../../middlewares/authenticators/server_token_authenticator.js');
const ApplicationUserTokenAuthenticator = require('../../middlewares/authenticators/application_user_token_authenticator.js');
const PasswordAuthenticator = require('../authenticators/password_authenticator.js');
const UserController = require('../../controllers/user_controller.js');
const ServerController = require('../../controllers/server_controller.js');
const TokenCreateResponseBuilder = require('../response_builders/token_create_response_builder.js');
const TokenFindResponseBuilder = require('../response_builders/token_find_response_builder.js');
const ApplicationUserResponseBuilder = require('../response_builders/application_user_response_builder.js');
const AdminUserResponseBuilder = require('../response_builders/admin_user_response_builder.js');

function UsersRouter(app, logger, postgrePool) {
  let _applicationUserCredentialsSchemaValidator = new ApplicationUserCredentialsSchemaValidator(logger);
  let _applicationUserRegistrationSchemaValidator = new ApplicationUserRegistrationSchemaValidator(logger);
  let _serverTokenAuthenticator = new ServerTokenAuthenticator(logger, postgrePool);
  let _applicationUserTokenAuthenticator = new ApplicationUserTokenAuthenticator(logger, postgrePool);
  let _passwordAuthenticator = new PasswordAuthenticator(logger, postgrePool);
  let _userController = new UserController(logger, postgrePool);
  let _serverController = new ServerController(logger, postgrePool);
  let _tokenCreateResponseBuilder = new TokenCreateResponseBuilder(logger);
  let _tokenFindResponseBuilder = new TokenFindResponseBuilder(logger);
  let _applicationUserResponseBuilder = new ApplicationUserResponseBuilder(logger);
  let _adminUserResponseBuilder = new AdminUserResponseBuilder(logger);

  app.post('/api/token',
    _applicationUserCredentialsSchemaValidator.validateRequest,
    _serverTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _passwordAuthenticator.authenticate,
    _userController.generateTokenForApplicationUser,
    _tokenCreateResponseBuilder.buildResponse
  );

  app.post('/api/token_check',
    _serverTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _applicationUserTokenAuthenticator.authenticateFromBody,
    _tokenFindResponseBuilder.buildResponse
  );

  app.post('/api/user',
    _applicationUserRegistrationSchemaValidator.validateRequest,
    _serverTokenAuthenticator.authenticateFromHeader,
    _serverController.updateLastConnection,
    _serverController.checkApplicationOwner,
    _userController.createUser,
    _userController.setOwnership,
    _applicationUserResponseBuilder.buildResponse
  );

  app.post('/api/admin-user',
    _userController.createUser,
    _userController.generateTokenForAdminUser,
    _adminUserResponseBuilder.buildResponse
  );
}


module.exports = UsersRouter;
