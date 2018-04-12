var SchemaValidator = require('../../utils/schema_validator.js');
var BaseHttpError = require('../../errors/base_http_error.js');

function BusinessUserCredentialsSchemaValidator(logger){

  var _logger = logger;

  this.validateRequest = function(req, res, next){
    _logger.debug('Request received: %j', req.body);
    var validator = new SchemaValidator();
    validator.validateJson(req.body, 'business_user_credentials_request.json', function(err){
      if (err){
        _logger.error('The request is invalid');
        var error = new BaseHttpError('The request is invalid', 'The request is invalid', 400);
        res.status(400).json(error);
        next(error);
      }
      else {
        _logger.info('The request was validated successfully');
        next();
      }
    });
  };
}

module.exports = BusinessUserCredentialsSchemaValidator
