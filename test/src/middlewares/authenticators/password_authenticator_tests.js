const proxyquire = require('proxyquire');
const expect = require('expect.js');
const sinon = require('sinon');
const BaseHttpError = require('../../../../src/errors/base_http_error.js');
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

      it('saves user in response', async () => {
        await passwordAuthenticator.authenticate(request, response, function(err) {
          expect(err).to.be.null;
          expect(response.user).to.be.ok();
          expect(response.user.user_id).to.be(1);
          expect(response.user.username).to.be('username');
          expect(response.user.password).to.be('pass');
          expect(response.user.applicationOwner).to.be('appOwner');
        });
      });
    });

    describe('authentication failure', function() {
      before(function() {
        mockUserService.authenticateWithPassword.rejects(new Error('authentication error'));
      });

      it('returns error', async () => {
        await passwordAuthenticator.authenticate(request, response, function(err) {
          expect(err).to.be.a(BaseHttpError);
          expect(err.statusCode).to.be(401);
          expect(err.message).to.be('Wrong password.');
        });
      });
    });
  });
});
