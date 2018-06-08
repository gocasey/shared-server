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

  describe('#decodeToken', function() {
    it('returns token with expiration', async () => {
      let decodedToken = await tokenGenerationService.decodeToken('token');
      expect(decodedToken).to.be.ok();
      expect(decodedToken.token).to.be('token');
      expect(decodedToken.expiresAt).to.be('12345678');
    });
  });

  describe('#generateToken', function() {
    describe('jwt sign success', function() {
      beforeEach(function() {
        mockJwt.sign.resolves('token');
      });

      it('returns token', async function() {
        let token = await tokenGenerationService.generateToken(mockOwner);
        expect(token).to.be.ok();
        expect(token.token).to.be('token');
        expect(token.expiresAt).to.be('12345678');
      });

      it('logs success', async function() {
        await tokenGenerationService.generateToken(mockOwner);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Token was created successfully for owner name: \'%s\'');
        expect(mockLogger.info.getCall(0).args[1]).to.be('name');
      });

      it('does not log error', async function() {
        await tokenGenerationService.generateToken(mockOwner);
        expect(mockLogger.error.notCalled);
      });
    });


    describe('jwt sign failure', function() {
      beforeEach(function() {
        mockJwt.sign.rejects(new Error('Error generating token'));
      });

      it('returns error', async function() {
        let err;
        try {
          await tokenGenerationService.generateToken(mockOwner);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('Error generating token');
      });

      it('logs failure', async function() {
        try {
          await tokenGenerationService.generateToken(mockOwner);
        } catch (err) { }
        expect(mockLogger.error.calledOnce);
        expect(mockLogger.error.getCall(0).args[0]).to.be('Token generation for owner name \'%s\' failed');
        expect(mockLogger.error.getCall(0).args[1]).to.be('name');
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
          mockJwt.verify.resolves({ data: { id: idDecoded, name: nameDecoded } });
        });

        it('logs success', async function() {
          await tokenGenerationService.validateToken('token', mockOwner);
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('Token was validated successfully for owner name: \'%s\'');
          expect(mockLogger.info.getCall(0).args[1]).to.be(mockOwner.name);
        });

        it('does not log error', async function() {
          await tokenGenerationService.validateToken('token', mockOwner);
          expect(mockLogger.error.notCalled);
        });
      });

      describe('wrong data', function() {
        before(function() {
          idDecoded = 'id';
          nameDecoded = 'another_name';
          mockJwt.verify.resolves({ data: { id: idDecoded, name: nameDecoded } });
        });

        it('returns error', async function() {
          let err;
          try {
            await tokenGenerationService.validateToken('token', mockOwner);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('Token validation failed');
        });

        it('logs failure', async function() {
          try {
            await tokenGenerationService.validateToken('token', mockOwner);
          } catch (err) { }
          expect(mockLogger.error.calledOnce);
          expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated for owner name: \'%s\'');
          expect(mockLogger.error.getCall(0).args[1]).to.be('name');
        });
      });
    });

    describe('jwt verify error', function() {
      beforeEach(function() {
        mockJwt.verify.rejects(new Error('jwt error'));
      });

      it('returns error', async function() {
        let functionSpy = sinon.spy(tokenGenerationService.validateToken);
        try {
          await functionSpy('token', mockOwner);
          throw new Error('Exception was not thrown');
        } catch (err) { }
        expect(functionSpy.threw(new Error('jwt expired')));
      });

      it('logs failure', async function() {
        try {
          await tokenGenerationService.validateToken('token', mockOwner);
        } catch (err) { }
        expect(mockLogger.error.calledOnce);
        expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated due to a failure: %s');
        expect(mockLogger.error.getCall(0).args[1]).to.be('jwt error');
      });
    });
  });
});
