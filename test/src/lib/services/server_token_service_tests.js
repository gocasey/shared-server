const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const BaseHttpError = require('../../../../src/errors/base_http_error.js');
const ServerTokenServiceModule = '../../../../src/lib/services/server_token_service.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const mockServerTokenModel = {
  findByServer: sinon.stub(),
  createOrUpdate: sinon.stub(),
};

const mockTokenGenerationService = {
  generateToken: sinon.stub(),
  validateToken: sinon.stub(),
  decodeToken: sinon.stub(),
};

function setupServerTokenService() {
  let mocks = {
    '../../models/server_token_model.js': function() {
      return mockServerTokenModel;
    },
    './token_generation_service': function() {
      return mockTokenGenerationService;
    },
  };
  let ServerTokenService = proxyquire(ServerTokenServiceModule, mocks);
  return new ServerTokenService(mockLogger);
}


describe('ServerTokenService Tests', function() {
  let serverTokenService;

  let mockServer = {
    id: 12345,
    name: 'name',
    _rev: 'rev',
  };

  before(function() {
    serverTokenService = setupServerTokenService();
  });

  describe('#generateToken', function() {
    describe('server has token', function() {
      before(function() {
        mockServerTokenModel.findByServer.resolves({ token_id: 6789, server_id: 12345, token: 'token' });
      });

      describe('token valid', function() {
        before(function() {
          mockTokenGenerationService.validateToken.resolves({ token: 'token', expiresAt: 123456789 });
        });

        it('returns token', async function() {
          let token = await serverTokenService.generateTokenForApplicationUser(mockServer);
          expect(token).to.be.ok();
          expect(token.token).to.be('token');
          expect(token.tokenExpiration).to.be(123456789);
          });
        });

      describe('token invalid', function() {
        before(function() {
          mockTokenGenerationService.validateToken.rejects(new Error('token invalid'));
          mockTokenGenerationService.generateToken.resolves({ token: 'new token', expiresAt: 123456789 });
        });

        it('returns new token', async () => {
          let token = await serverTokenService.generateTokenForApplicationUser(mockServer);
          expect(token).to.be.ok();
          expect(token.token).to.be('new token');
          expect(token.tokenExpiration).to.be(123456789);
        });
      });
    });

    describe('server does not have token', function() {
      before(function() {
        mockServerTokenModel.findByServer.resolves();
      });

      describe('token creation success', function() {
        before(function() {
          mockTokenGenerationService.generateToken.resolves({ token: 'token', expiresAt: 123456789 });
        });

        describe('token update success', function() {
          before(function() {
            mockServerTokenModel.createOrUpdate.resolves();
          });

          it('returns token', async function() {
            let token = await serverTokenService.generateTokenForApplicationUser(mockServer);
            expect(token).to.be.ok();
            expect(token.token).to.be('token');
            expect(token.tokenExpiration).to.be(123456789);
          });
        });

        describe('token update failure', function() {
          before(function() {
            mockServerTokenModel.createOrUpdate.rejects(new Error('update error'));
          });

          it('returns error', async function() {
            let err;
            try {
              await serverTokenService.generateTokenForApplicationUser(mockServer);
            } catch (ex) {
              err = ex;
            }
            expect(err).to.be.ok();
            expect(err.message).to.be('update error');
          });
        });
      });

      describe('token creation failure', function() {
        before(function() {
          mockTokenGenerationService.generateToken.rejects(new Error('token error'));
        });

        it('returns error', async function() {
          let err;
          try {
            await serverTokenService.generateTokenForApplicationUser(mockServer);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('token error');
        });
      });
    });
  });

  describe('#retrieveToken', function() {
    describe('token found', async () => {
      before(function() {
        mockServerTokenModel.findByServer.resolves({ token_id: 6789, server_id: 12345, token: 'token' });
        mockTokenGenerationService.decodeToken.returns({ token: 'token', expiresAt: 123456789 });
      });

      it('returns token', async function() {
        let token = await serverTokenService.retrieveToken(mockServer);
        expect(token).to.be.ok();
        expect(token.token).to.be('token');
        expect(token.tokenExpiration).to.be(123456789);
      });
    });

    describe('token not found', async () => {
      before(function() {
        mockServerTokenModel.findByServer.resolves();
      });

      it('throws 500 error', async function() {
        let err;
        try {
          await serverTokenService.retrieveToken(mockServer);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(500);
        expect(err.message).to.be('Server does not have token');
      });
    });
  });
});
