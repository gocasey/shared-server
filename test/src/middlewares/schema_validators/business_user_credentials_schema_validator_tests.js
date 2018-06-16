const expect = require('expect.js');
const sinon = require('sinon');
const BusinessUserCredentialsSchemaValidator = require('../../../../src/middlewares/schema_validators/application_user_credentials_schema_validator.js');

const mockLogger = {
  debug: sinon.stub(),
  error: sinon.stub(),
  info: sinon.stub(),
};

const mockResponse = {
  status: function() {
    return { json: sinon.stub() };
  },
};

const businessUserCredentailsSchemaValidator = new BusinessUserCredentialsSchemaValidator(mockLogger);

describe('BusinessUserCredentialsSchemaValidator Tests', function() {
  describe('#validateRequest', function() {
    describe('valid request', function() {
      let request = {
        body: {
          'username': 'username',
          'password': 'password',
        },
      };

      it('does not return error', function(done) {
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.null;
          done();
        });
      });
    });

    describe('invalid request with password and token', function() {
      let request = {
        body: {
          'username': 'username',
          'password': 'password',
          'token': 'token',
        },
      };

      it('returns error', function(done) {
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('invalid request with token', function() {
      let request = {
        body: {
          'username': 'username',
          'token': 'token',
        },
      };

      it('returns error', function(done) {
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('request with empty body', function() {
      let request = {
        body: {},
      };

      it('returns error', function(done) {
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('request with null body', function() {
      let request = {};

      it('returns error', function(done) {
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });
});

