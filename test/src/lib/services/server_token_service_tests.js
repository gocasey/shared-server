const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
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
        mockServerTokenModel.findByServer.callsArgWith(1, null, { token_id: 6789, server_id: 12345, token: 'token' });
      });

      describe('token valid', function() {
        before(function() {
          mockTokenGenerationService.validateToken.callsArgWith(2, null, { token: 'token', expiresAt: 123456789 });
        });

        it('does not return error', function(done) {
          serverTokenService.generateToken(mockServer, function(err) {
            expect(err).to.be.null;
            done();
          });
        });

        it('returns token', function(done) {
          serverTokenService.generateToken(mockServer, function(err, token) {
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
          serverTokenService.generateToken(mockServer, function(err) {
            expect(err).to.be.null;
            done();
          });
        });
      });
    });

    describe('server does not have token', function() {
      before(function() {
        mockServerTokenModel.findByServer.callsArgWith(1);
      });

      describe('token creation success', function() {
        before(function() {
          mockTokenGenerationService.generateToken.callsArgWith(1, null, { token: 'token', expiresAt: 123456789 });
        });

        describe('token update success', function() {
          before(function() {
            mockServerTokenModel.createOrUpdate.callsArgWith(2);
          });

          it('does not return error', function(done) {
            serverTokenService.generateToken(mockServer, function(err) {
              expect(err).to.be.null;
              done();
            });
          });

          it('returns token', function(done) {
            serverTokenService.generateToken(mockServer, function(err, token) {
              expect(token).to.be.ok();
              expect(token.token).to.be('token');
              expect(token.tokenExpiration).to.be(123456789);
              done();
            });
          });
        });

        describe('token update failure', function() {
          before(function() {
            mockServerTokenModel.createOrUpdate.callsArgWith(2, 'update error');
          });

          it('returns error', function(done) {
            serverTokenService.generateToken(mockServer, function(err) {
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
          serverTokenService.generateToken(mockServer, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });
      });
    });
  });
});
