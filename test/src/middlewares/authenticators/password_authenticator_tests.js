const proxyquire = require('proxyquire');
const expect = require('expect.js');
const sinon = require('sinon');
const PasswordAuthenticatorModule = '../../../../src/middlewares/authenticators/password_authenticator.js';

const mockUserService = {
  authenticateWithPassword: sinon.stub(),
};

function setupPasswordAuthenticator() {
  let mocks = {
    '../../lib/services/user_service.js': function() {
      return mockUserService;
    },
  };
  let PasswordAuthenticator = proxyquire(PasswordAuthenticatorModule, mocks);
  return new PasswordAuthenticator();
}

describe('PasswordAuthenticator Tests', function() {
  let passwordAuthenticator;

  before(function() {
    passwordAuthenticator = setupPasswordAuthenticator();
  });

  describe('#authenticate', function() {
    let request = {
      body: {
        username: 'username',
        password: 'password',
      },
    };

    let response = {
      status: function() {
        return {
          json: sinon.stub(),
        };
      },
    };

    describe('authentication success', function() {
      before(function() {
        mockUserService.authenticateWithPassword.resolves({ user_id: 1, username: 'username', password: 'pass', applicationOwner: 'appOwner' });
      });

      it('does not return error', function(done) {
        passwordAuthenticator.authenticate(request, response, function(err) {
          expect(err).to.be.null;
          done();
        });
      });

      it('saves user in response', function(done) {
        passwordAuthenticator.authenticate(request, response, function() {
          expect(response.user).to.be.ok();
          expect(response.user.user_id).to.be(1);
          expect(response.user.username).to.be('username');
          expect(response.user.password).to.be('pass');
          expect(response.user.applicationOwner).to.be('appOwner');
          done();
        });
      });
    });

    describe('authentication failure', function() {
      before(function() {
        mockUserService.authenticateWithPassword.rejects(new Error('authentication error'));
      });

      it('returns error', function(done) {
        passwordAuthenticator.authenticate(request, response, function(err) {
          expect(err).to.be.ok();
          expect(err.message).to.be('Unauthorized');
          done();
        });
      });
    });
  });
});
