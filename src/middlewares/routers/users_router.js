const BusinessUserCredentialsSchemaValidator = require('../schema_validators/business_user_credentials_schema_validator.js');
const PasswordAuthenticator = require('../authenticators/password_authenticator.js');
const UserService = require('../../lib/services/user_service.js');
const TokenResponseBuilder = require('../response_builders/token_response_builder.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function UsersRouter(app, logger, postgrePool) {
    let _logger = logger;
    let _businessUserCredentialsSchemaValidator = new BusinessUserCredentialsSchemaValidator(logger);
    let _passwordAuthenticator = new PasswordAuthenticator(logger, postgrePool);
    let _userService = new UserService(logger, postgrePool);
    let _tokenResponseBuilder = new TokenResponseBuilder(logger);

    app.post('/api/token',
        _businessUserCredentialsSchemaValidator.validateRequest,
        _passwordAuthenticator.authenticate,
        function(req, res, next) {
            let user = res.user;
            _userService.generateToken(user, function(err, user) {
                if (err) {
                    _logger.error('An error ocurred while generating the token for username: %s', user.username);
                    var error = new BaseHttpError('Internal Server Error', 'Internal Server Error', 500);
                    next(error);
                } else {
                    res.data = user;
                    next();
                }
            });
        },
        _tokenResponseBuilder.buildResponse
    );
}


module.exports = UsersRouter;
