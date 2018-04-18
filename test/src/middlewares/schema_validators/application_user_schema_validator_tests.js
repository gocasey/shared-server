const expect = require('expect.js');
const sinon = require('sinon');
const ApplicationUserRegistrationSchemaValidator = require('../../../../src/middlewares/schema_validators/application_user_registration_schema_validator.js');

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

const applicationUserRegistrationSchemaValidator = new ApplicationUserRegistrationSchemaValidator(mockLogger);

describe('ApplicationUserRegistrationSchemaValidator Tests', function() {
  describe('#validateRequest', function() {
    describe('valid request', function() {
      let request = {
        body: {
          'username': 'username',
          'password': 'password',
          'applicationOwner': 'app1',
        },
      };

      it('does not return error', function(done) {
        applicationUserRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.null;
          done();
        });
      });
    });

    describe('invalid request with token', function() {
      let request = {
        body: {
          'username': 'username',
          'password': 'password',
          'token': 'token',
        },
      };

      it('returns error', function(done) {
        applicationUserRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('invalid request without password', function() {
      let request = {
        body: {
          'username': 'username',
          'applicationOwner': 'app1',
        },
      };

      it('returns error', function(done) {
        applicationUserRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
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
        applicationUserRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });

    describe('request with null body', function() {
      let request = {};

      it('returns error', function(done) {
        applicationUserRegistrationSchemaValidator.validateRequest(request, mockResponse, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });
});

