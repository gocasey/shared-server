const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const UserTokenServiceModule = '../../../../src/lib/services/user_token_service.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const mockUserTokenModel = {
  findByUser: sinon.stub(),
  createOrUpdate: sinon.stub(),
};

const mockTokenGenerationService = {
  generateToken: sinon.stub(),
  validateToken: sinon.stub(),
};

function setupUserTokenService() {
  let mocks = {
    '../../models/user_token_model.js': function() {
      return mockUserTokenModel;
    },
    './token_generation_service': function() {
      return mockTokenGenerationService;
    },
  };
  let UserTokenService = proxyquire(UserTokenServiceModule, mocks);
  return new UserTokenService(mockLogger);
}


describe('UserTokenService Tests', function() {
  let userTokenService;

  let mockUser = {
    user_id: 12345,
    username: 'username',
  };

  before(function() {
    userTokenService = setupUserTokenService();
  });

  describe('#generateToken', function() {
    describe('user has token', function() {
      before(function() {
        mockUserTokenModel.findByUser.callsArgWith(1, null, { token_id: 6789, user_id: 12345, token: 'token' });
      });

      describe('token valid', function() {
        before(function() {
          mockTokenGenerationService.validateToken.callsArgWith(2, null, { token: 'token', expiresAt: 123456789 });
        });

        it('does not return error', function(done) {
          userTokenService.generateToken(mockUser, function(err) {
            expect(err).to.be.null;
            done();
          });
        });

        it('returns token', function(done) {
          userTokenService.generateToken(mockUser, function(err, token) {
            expect(token).to.be.ok();
            expect(token.token).to.be('token');
            expect(token.tokenExpiration).to.be(123456789);
            done();
          });
        });
      });

      describe('token invalid', function() {
        before(function() {
          mockTokenGenerationService.validateToken.callsArgWith(2, 'token invalid');
          mockTokenGenerationService.generateToken.callsArgWith(1, 'token');
        });

        it('does not return error', function(done) {
          userTokenService.generateToken(mockUser, function(err) {
            expect(err).to.be.null;
            done();
          });
        });
      });
    });

    describe('user does not have token', function() {
      before(function() {
        mockUserTokenModel.findByUser.callsArgWith(1);
      });

      describe('token creation success', function() {
        before(function() {
          mockTokenGenerationService.generateToken.callsArgWith(1, null, { token: 'token', expiresAt: 123456789 });
        });

        describe('token update success', function() {
          before(function() {
            mockUserTokenModel.createOrUpdate.callsArgWith(2);
          });

          it('does not return error', function(done) {
            userTokenService.generateToken(mockUser, function(err) {
              expect(err).to.be.null;
              done();
            });
          });

          it('returns token', function(done) {
            userTokenService.generateToken(mockUser, function(err, token) {
              expect(token).to.be.ok();
              expect(token.token).to.be('token');
              expect(token.tokenExpiration).to.be(123456789);
              done();
            });
          });
        });

        describe('token update failure', function() {
          before(function() {
            mockUserTokenModel.createOrUpdate.callsArgWith(2, 'update error');
          });

          it('returns error', function(done) {
            userTokenService.generateToken(mockUser, function(err) {
              expect(err).to.be.ok();
              done();
            });
          });
        });
      });

      describe('token creation failure', function() {
        before(function() {
          mockTokenGenerationService.generateToken.callsArgWith(1, 'token error');
        });

        it('returns error', function(done) {
          userTokenService.generateToken(mockUser, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });
      });
    });
  });
});
