const expect = require('expect.js');
const sinon = require('sinon');
const BusinessUserCredentialsSchemaValidator = require('../../../../src/middlewares/schema_validators/business_user_credentials_schema_validator.js');

var mockLogger = {
  debug: sinon.stub(),
  error: sinon.stub(),
  info: sinon.stub()
};

var mockResponse = {
  status : function(){
    return { json: sinon.stub() };
  }
};

var businessUserCredentailsSchemaValidator = new BusinessUserCredentialsSchemaValidator(mockLogger);

describe('BusinessUserCredentialsSchemaValidator Tests', function(){

  describe('#validateRequest', function(){

    describe('valid request', function(){

      var request = {
        body : {
          username: 'username',
          password: 'password'
        }
      };

      it('does not return error', function(done){
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err){
          expect(err).to.be.null;
          done();
        })
      });

    });

    describe('invalid request with password and token', function(){
      var request = {
        body : {
          username: 'username',
          password: 'password',
          token: 'token'
        }
      };

      it('returns error', function(done){
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err){
          expect(err).to.be.ok();
          done();
        })
      });
    });

    describe('invalid request with token', function(){
      var request = {
        body : {
          username: 'username',
          token: 'token'
        }
      };

      it('returns error', function(done){
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err){
          expect(err).to.be.ok();
          done();
        })
      });
    });

    describe('request with empty body', function(){
      var request = {
        body : {}
      };

      it('returns error', function(done){
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err){
          expect(err).to.be.ok();
          done();
        })
      });
    });

    describe('request with null body', function(){
      var request = {};

      it('returns error', function(done){
        businessUserCredentailsSchemaValidator.validateRequest(request, mockResponse, function(err){
          expect(err).to.be.ok();
          done();
        })
      });
    });

  });

});

