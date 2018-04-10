var SchemaValidator = require('../../utils/schema_validator.js');

function BusinessUserCredentialsSchemaValidator(){

    this.validateRequest = function(req, res, next){
        var validator = new SchemaValidator();
        validator.validateJson(req.body, 'business_user_credentials_request.json', function(err){
            if (err) next(err);
            next();
        });
    };
}

module.exports = BusinessUserCredentialsSchemaValidator