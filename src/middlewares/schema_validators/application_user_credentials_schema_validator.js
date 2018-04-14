const SchemaValidator = require('../../utils/schema_validator.js');

function ApplicationUserCredentialsSchemaValidator(logger) {
    let _logger = logger;

    this.validateRequest = function(req, res, next) {
        _logger.debug('Request received: %j', req.body);
        let validator = new SchemaValidator();
        validator.validateJson(req.body, 'application_user_credentials_request.json', function(err) {
            if (err) {
                _logger.error('The request is invalid');
                let error = new BaseHttpError('The request is invalid', 'The request is invalid', 400);
                res.status(400).json(error);
                next(error);
            } else {
                _logger.info('The request was validated successfully');
                next();
            }
        });
    };
}

module.exports = ApplicationUserCredentialsSchemaValidator;