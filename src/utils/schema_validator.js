const fs = require('fs');
const path = require('path');
const Validator = require('jsonschema').Validator;

function SchemaValidator() {
    const schemasDirectory = path.join(__dirname, '..', 'models', 'schemas');

    this.validateJson = function(jsonToValidate, schemaFilename, callback) {
        if (! jsonToValidate) return callback('undefined json to validate');
        let validator = new Validator();
        let schemaFilePath = path.join(schemasDirectory, schemaFilename);
        fs.readFile(schemaFilePath, 'utf8', function(err, data) {
            if (err) callback(err);
            else {
              let jsonSchema = JSON.parse(data);
              if (!validator.validate(jsonToValidate, jsonSchema).valid) {
                callback('Schema validation failed');
              } else {
                callback();
              }
            }
        });
    };
}

module.exports = SchemaValidator;
