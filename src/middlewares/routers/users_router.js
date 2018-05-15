const ApplicationUserRegistrationSchemaValidator = require('../schema_validators/application_user_registration_schema_validator.js');
const BusinessUserCredentialsSchemaValidator = require('../schema_validators/business_user_credentials_schema_validator.js');
const PasswordAuthenticator = require('../authenticators/password_authenticator.js');
const UserController = require('../../controllers/user_controller.js');
const TokenResponseBuilder = require('../response_builders/token_response_builder.js');
const UserRegistrationResponseBuilder = require('../response_builders/user_registration_response_builder.js');

function UsersRouter(app, logger, postgrePool) {
  let _businessUserCredentialsSchemaValidator = new BusinessUserCredentialsSchemaValidator(logger);
  let _applicationUserRegistrationSchemaValidator = new ApplicationUserRegistrationSchemaValidator(logger);
  let _passwordAuthenticator = new PasswordAuthenticator(logger, postgrePool);
  let _userController = new UserController(logger, postgrePool);
  let _tokenResponseBuilder = new TokenResponseBuilder(logger);
  let _userRegistrationResponseBuilder = new UserRegistrationResponseBuilder(logger);

  app.post('/api/token',
    _businessUserCredentialsSchemaValidator.validateRequest,
    _passwordAuthenticator.authenticate,
    _userController.generateTokenForApplicationUser,
    _tokenResponseBuilder.buildResponse
  );

  app.post('/api/user',
    _applicationUserRegistrationSchemaValidator.validateRequest,
    _userController.createUser,
    _userRegistrationResponseBuilder.buildResponse
  );

  app.post('/api/admin-user',
    _userController.createUser,
    _userController.generateTokenForAdminUser(),
    //_userRegistrationResponseBuilder.buildResponse
  );
}


module.exports = UsersRouter;
