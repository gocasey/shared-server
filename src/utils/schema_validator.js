const fs = require('fs');
const path = require('path');
const Validator = require('jsonschema').Validator;

function SchemaValidator() {
    const schemasDirectory = '../models/schemas';

    this.validateJson = function(jsonToValidate, schemaFilename, callback) {
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
