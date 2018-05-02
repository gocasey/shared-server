const expect = require('expect.js');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const TokenGenerationServiceModule = '../../../../src/lib/services/token_generation_service.js';


describe('TokenGenerationService Tests', function() {
    let mockLogger = {
        info: sinon.stub(),
        error: sinon.stub(),
    };

    let mockJwt = {
      sign: sinon.stub(),
      verify: sinon.stub(),
      decode: sinon.stub(),
    };

    let tokenGenerationService;

    function setupTokenGenerationService() {
      let mocks = {};
      mocks['jsonwebtoken'] = mockJwt;
      let TokenGenerationService = proxyquire(TokenGenerationServiceModule, mocks);
      return new TokenGenerationService(mockLogger);
    }

    before(function() {
      mockJwt.decode.returns({ exp: '12345678' });
      tokenGenerationService = setupTokenGenerationService();
    });

    beforeEach(function() {
      mockLogger.info.resetHistory();
      mockLogger.error.resetHistory();
    });

    let mockOwner = {
      id: 'id',
      name: 'name',
    };

    describe('#generateToken', function() {
      describe('jwt sign success', function() {
        beforeEach(function() {
          mockJwt.sign.callsArgWith(3, null, 'token');
        });

        it('returns token', function(done) {
          tokenGenerationService.generateToken(mockOwner, function(err, token) {
            expect(token).to.be.ok();
            done();
          });
        });

        it('logs success', function(done) {
          tokenGenerationService.generateToken(mockOwner, function() {
            expect(mockLogger.info.calledOnce);
            expect(mockLogger.info.getCall(0).args[0]).to.be('Token was created successfully for owner name: \'%s\'');
            expect(mockLogger.info.getCall(0).args[1]).to.be('name');
            done();
          });
        });

        it('does not return error', function(done) {
          tokenGenerationService.generateToken(mockOwner, function(err) {
            expect(err).to.be.null;
            done();
          });
        });

        it('does not log error', function(done) {
          tokenGenerationService.generateToken(mockOwner, function() {
            expect(mockLogger.error.notCalled);
            done();
          });
        });
      });


      describe('jwt sign failure', function() {
        beforeEach(function() {
          mockJwt.sign.callsArgWith(3, 'Error generating token');
        });

        it('does not return token', function(done) {
          tokenGenerationService.generateToken(mockOwner, function(err, token) {
            expect(token).to.be.null;
            done();
          });
        });

        it('logs failure', function(done) {
          tokenGenerationService.generateToken(mockOwner, function() {
            expect(mockLogger.error.calledOnce);
            expect(mockLogger.error.getCall(0).args[0]).to.be('Token generation for owner name \'%s\' failed');
            expect(mockLogger.error.getCall(0).args[1]).to.be('name');
            done();
          });
        });

        it('returns error', function(done) {
          tokenGenerationService.generateToken(mockOwner, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });
      });
    });

  describe('#validateToken', function() {
    describe('jwt verify success', function() {
      let idDecoded;
      let nameDecoded;

      describe('correct data', function() {
        before(function() {
          idDecoded = 'id';
          nameDecoded = 'name';
          mockJwt.verify.callsArgWith(2, null, { data: { id: idDecoded, name: nameDecoded } });
        });

        it('logs success', function(done) {
          tokenGenerationService.validateToken('token', mockOwner, function() {
            expect(mockLogger.info.calledOnce);
            expect(mockLogger.info.getCall(0).args[0]).to.be('Token was validated successfully for owner name: \'%s\'');
            expect(mockLogger.info.getCall(0).args[1]).to.be(mockOwner.name);
            done();
          });
        });

        it('does not log error', function(done) {
          tokenGenerationService.validateToken('token', mockOwner, function() {
            expect(mockLogger.error.notCalled);
            done();
          });
        });

        it('does not return error', function(done) {
          tokenGenerationService.validateToken('token', mockOwner, function(err) {
            expect(err).to.be.null;
            done();
          });
        });
      });

      describe('wrong data', function() {
        before(function() {
          idDecoded = 'id';
          nameDecoded = 'another_name';
          mockJwt.verify.callsArgWith(2, null, { data: { id: idDecoded, name: nameDecoded } });
        });

        it('returns error', function(done) {
          tokenGenerationService.validateToken('token', mockOwner, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });

        it('logs failure', function(done) {
          tokenGenerationService.validateToken('token', mockOwner, function() {
            expect(mockLogger.error.calledOnce);
            expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated for owner name: \'%s\'');
            expect(mockLogger.error.getCall(0).args[1]).to.be('name');
            done();
          });
        });
      });
    });

    describe('jwt verify token expired', function() {
      beforeEach(function() {
        mockJwt.verify.callsArgWith(2, { name: 'TokenExpiredError', message: 'jwt expired' });
      });

      it('returns error', function(done) {
        tokenGenerationService.validateToken('token', mockOwner, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs failure', function(done) {
        tokenGenerationService.validateToken('token', mockOwner, function() {
          expect(mockLogger.error.calledOnce);
          expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated due to a failure: %s');
          expect(mockLogger.error.getCall(0).args[1]).to.be('jwt expired');
          done();
        });
      });
    });

    describe('jwt verify error', function() {
      beforeEach(function() {
        mockJwt.verify.callsArgWith(2, { name: 'JsonWebTokenError', message: 'jwt malformed' });
      });

      it('returns error', function(done) {
        tokenGenerationService.validateToken('token', mockOwner, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs failure', function(done) {
        tokenGenerationService.validateToken('token', mockOwner, function() {
          expect(mockLogger.error.calledOnce);
          expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated due to a failure: %s');
          expect(mockLogger.error.getCall(0).args[1]).to.be('jwt malformed');
          done();
        });
      });
    });
  });
});
