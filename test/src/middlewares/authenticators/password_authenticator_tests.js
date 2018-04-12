const proxyquire = require('proxyquire');
const expect = require('expect.js');
const sinon = require('sinon');
const PasswordAuthenticatorModule = '../../../../src/middlewares/authenticators/password_authenticator.js';

var mockUserService = {
  authenticateWithPassword : sinon.stub()
};

function setupPasswordAuthenticator(){
  var mocks = {
    '../../lib/services/user_service.js' : function(){
      return mockUserService;
    }
  };
  var PasswordAuthenticator = proxyquire(PasswordAuthenticatorModule, mocks);
  return new PasswordAuthenticator();
}

describe('PasswordAuthenticator Tests', function(){

  var passwordAuthenticator;

  before(function(){
    passwordAuthenticator = setupPasswordAuthenticator();
  });

  describe('#authenticate', function(){

    var request = {
      body: {
        username : 'username',
        password : 'password'
      }
    };

    var response = {
      status: function(){
        return {
          json: sinon.stub()
        }
      }
    };

    describe('authentication success', function(){
      before(function(){
        mockUserService.authenticateWithPassword.callsArgWith(2);
      });

      it('does not return error', function(done){
        passwordAuthenticator.authenticate(request, response, function(err){
          expect(err).to.be.null;
          done();
        });
      });
    });

    describe('authentication failure', function(){
      before(function(){
        mockUserService.authenticateWithPassword.callsArgWith(2, 'authentication error');
      });

      it('returns error', function(done){
        passwordAuthenticator.authenticate(request, response, function(err){
          expect(err).to.be.ok();
          done();
        });
      });
    });

  });

});
