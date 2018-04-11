const fs = require('fs');
const path = require('path');
const Validator = require('jsonschema').Validator;

function SchemaValidator(){

    const schemasDirectory = '../models/schemas';

    this.validateJson = function(jsonToValidate, schemaFilename, callback){
        var validator = new Validator();
        var schemaFilePath = path.join(schemasDirectory, schemaFilename);
        fs.readFile(schemaFilePath, 'utf8', function (err, data) {
            if (err) callback(err);
            var jsonSchema = JSON.parse(data);
            if (! validator.validate(jsonToValidate, jsonSchema).valid){
                callback("Schema validation failed");
            }
            else{
                callback();
            }
        });
    };
}

module.exports = SchemaValidator
