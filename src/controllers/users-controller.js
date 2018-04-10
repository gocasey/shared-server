var ApplicationUserCredentialsSchemaValidator = require('../schema_validators/application_user_credentials_schema_validator.js');
var BusinessUserCredentialsSchemaValidator = require('../schema_validators/business_user_credentials_schema_validator.js');

async function generateToken(req, res) {
  res.send('Hit POST token');
}

async function authorizeUser(req, res) {
  res.send('Hit POST authorize');
}

module.exports = {
  generateToken,
  authorizeUser,
};


var ApplicationUserCredentialsSchemaValidator = require('../schema_validators/application_user_credentials_schema_validator.js');
var BusinessUserCredentialsSchemaValidator = require('../schema_validators/business_user_credentials_schema_validator.js');
var PasswordAuthenticator = require('../../middleware/authenticators/password_authenticator.js');
var TokenAuthenticator = require('../../middleware/authenticators/token_authenticator.js');
var FacebookAuthenticator = require('../../middleware/authenticators/facebook_authenticator.js');
var UserService = require('../../lib/services/user_service.js');
var TokenResponseBuilder = require('../../middleware/response_builders/token_response_builder.js');

function UsersRouter(app, logger, postgrePool) {

  var _logger = logger;
  var _applicationUserCredentialsSchemaValidator = new ApplicationUserCredentialsSchemaValidator();
  var _businessUserCredentialsSchemaValidator = new BusinessUserCredentialsSchemaValidator();
  var _passwordAuthenticator = new PasswordAuthenticator(logger, postgrePool);
  var _tokenAuthenticator = new TokenAuthenticator(logger, postgrePool);
  var _facebookAuthenticator = new FacebookAuthenticator(logger, postgrePool);
  var _userService = new UserService(logger, postgrePool);
  var _tokenResponseBuilder = new TokenResponseBuilder(logger);

  app.post('/api/new_user', function(req, res, next){

  });

  app.post('/api/token',
    _businessUserCredentialsSchemaValidator.validateRequest,
    _passwordAuthenticator.authenticate,
    function (req, res, next) {
      var username = req.body.username;
      _userService.generateToken(username, function(err, user){
        if (err){
          _logger.error('An error ocurred while generating the token for username: %s', username);
          res.status(500).json({ code: 500, message: 'Internal Server Error' });
        }
        else{
          res.data = user;
        }
        next();
      });
    },
    _tokenResponseBuilder.buildResponse
  );

  app.post('/api/authorize',
    _applicationUserCredentialsSchemaValidator.validateRequest,
    _tokenAuthenticator.authenticate,
    _facebookAuthenticator.authenticate,
    _userResponseBuilder.buildResponse
  );
}


module.exports = UsersRouter;
