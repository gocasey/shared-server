const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const UserTokenServiceModule = '../../../../src/lib/services/user_token_service.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const mockPostgrePool = {};

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
  };
  let UserTokenService = proxyquire(UserTokenServiceModule, mocks);
  return new UserTokenService(mockLogger, mockPostgrePool, mockTokenGenerationService);
}

describe('UserTokenService Tests', () => {
  let userTokenService;

  let mockUser = {
    user_id: 12345,
    username: 'username',
  };

  before(() => {
    userTokenService = setupUserTokenService();
  });

  describe('#generateToken', () => {
    describe('user has token', () => {
      before(() => {
        mockUserTokenModel.findByUser.resolves({ token_id: 6789, user_id: 12345, token: 'token' });
      });

      describe('token valid', () => {
        before(() => {
          mockTokenGenerationService.validateToken.resolves({ token: 'token', expiresAt: 123456789 });
        });

        it('returns token', async () => {
          let token = await userTokenService.generateToken(mockUser);
          expect(token).to.be.ok();
          expect(token.token).to.be('token');
          expect(token.tokenExpiration).to.be(123456789);
        });
      });

      describe('token invalid', () => {
        before(() => {
          mockTokenGenerationService.validateToken.rejects(new Error('token invalid'));
          mockTokenGenerationService.generateToken.resolves({ token: 'new token', expiresAt: 123456789 });
        });

        it('returns new token', async () => {
          let token = await userTokenService.generateToken(mockUser);
          expect(token).to.be.ok();
          expect(token.token).to.be('new token');
          expect(token.tokenExpiration).to.be(123456789);
        });
      });
    });

    describe('user does not have token', () => {
      before(() => {
        mockUserTokenModel.findByUser.resolves();
      });

      describe('token creation success', () => {
        before(() => {
          mockTokenGenerationService.generateToken.resolves({ token: 'token', expiresAt: 123456789 });
        });

        describe('token update success', () => {
          before(() => {
            mockUserTokenModel.createOrUpdate.resolves();
          });

          it('returns token', async () => {
            let token = await userTokenService.generateToken(mockUser);
            expect(token).to.be.ok();
            expect(token.token).to.be('token');
            expect(token.tokenExpiration).to.be(123456789);
          });
        });

        describe('token update failure', () => {
          before(() => {
            mockUserTokenModel.createOrUpdate.rejects(new Error('update error'));
          });

          it('returns error', async () => {
            let err;
            try {
              await userTokenService.generateToken(mockUser);
            } catch (ex) {
              err = ex;
            }
            expect(err).to.be.ok();
            expect(err.message).to.be('update error');
          });
        });
      });

      describe('token creation failure', () => {
        before(() => {
          mockTokenGenerationService.generateToken.rejects(new Error('token error'));
        });

        it('returns error', async () => {
          let err;
          try {
            await userTokenService.generateToken(mockUser);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('token error');
        });
      });
    });
  });
});
