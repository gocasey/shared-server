const BusinessUserCredentialsSchemaValidator = require('../schema_validators/business_user_credentials_schema_validator.js');
const PasswordAuthenticator = require('../../middleware/authenticators/password_authenticator.js');
const UserService = require('../../lib/services/user_service.js');
const TokenResponseBuilder = require('../../middleware/response_builders/token_response_builder.js');

function UsersRouter(app, logger, postgrePool) {
    let _logger = logger;
    let _businessUserCredentialsSchemaValidator = new BusinessUserCredentialsSchemaValidator();
    let _passwordAuthenticator = new PasswordAuthenticator(logger, postgrePool);
    let _userService = new UserService(logger, postgrePool);
    let _tokenResponseBuilder = new TokenResponseBuilder(logger);

    app.post('/api/token',
        _businessUserCredentialsSchemaValidator.validateRequest,
        _passwordAuthenticator.authenticate,
        function(req, res, next) {
            let username = req.body.username;
            _userService.generateToken(username, function(err, user) {
                if (err) {
                    _logger.error('An error ocurred while generating the token for username: %s', username);
                    res.status(500).json({ code: 500, message: 'Internal Server Error' });
                } else {
                    res.data = user;
                }
                next();
            });
        },
        _tokenResponseBuilder.buildResponse
    );
}


module.exports = UsersRouter;
