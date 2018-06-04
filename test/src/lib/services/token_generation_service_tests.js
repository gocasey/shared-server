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

  let mockData = {
    id: 'id',
    name: 'name',
    is_admin: false,
  };

  describe('#generateToken', function() {
    describe('jwt sign success', function() {
      beforeEach(function() {
        mockJwt.sign.resolves('token');
      });

      it('returns token', async function() {
        let token = await tokenGenerationService.generateTokenForApplicationUser(mockData);
        expect(token).to.be.ok();
        expect(token.token).to.be('token');
        expect(token.expiresAt).to.be('12345678');
      });

      it('logs success', async function() {
        await tokenGenerationService.generateTokenForApplicationUser(mockData);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Token created successfully');
      });

      it('does not log error', async function() {
        await tokenGenerationService.generateTokenForApplicationUser(mockData);
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
          await tokenGenerationService.generateTokenForApplicationUser(mockData);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('Error generating token');
      });

      it('logs failure', async function() {
        try {
          await tokenGenerationService.generateTokenForApplicationUser(mockData);
        } catch (err) { }
        expect(mockLogger.error.calledOnce);
        expect(mockLogger.error.getCall(0).args[0]).to.be('Token generation failed');
      });
    });
  });

  describe('#validateToken', function() {
    let validateFunction;

    describe('jwt verify success', function() {
      let idDecoded;
      let nameDecoded;

      describe('correct data', function() {
        before(function() {
          idDecoded = 'id';
          nameDecoded = 'name';
          mockJwt.verify.resolves({ data: { id: idDecoded, name: nameDecoded } });
          validateFunction = () => {
 return true;
};
        });

        it('logs success', async function() {
          await tokenGenerationService.validateToken('token', validateFunction);
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('Token was validated successfully');
        });

        it('does not log error', async function() {
          await tokenGenerationService.validateToken('token', validateFunction);
          expect(mockLogger.error.notCalled);
        });
      });

      describe('wrong data', function() {
        before(function() {
          idDecoded = 'id';
          nameDecoded = 'another_name';
          mockJwt.verify.resolves({ data: { id: idDecoded, name: nameDecoded } });
          validateFunction = () => {
 return false;
};
        });

        it('returns error', async function() {
          let err;
          try {
            await tokenGenerationService.validateToken('token', validateFunction);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('Token validation failed');
        });

        it('logs failure', async function() {
          try {
            await tokenGenerationService.validateToken('token', validateFunction);
          } catch (err) { }
          expect(mockLogger.error.calledOnce);
          expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated');
        });
      });
    });

    describe('jwt verify error', function() {
      before(function() {
        mockJwt.verify.rejects(new Error('jwt error'));
      });

      it('returns error', async function() {
        let err;
        try {
          await tokenGenerationService.validateToken('token', validateFunction);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('jwt error');
      });

      it('logs failure', async function() {
        try {
          await tokenGenerationService.validateToken('token', validateFunction);
        } catch (err) { }
        expect(mockLogger.error.calledOnce);
        expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated due to a failure: %s');
        expect(mockLogger.error.getCall(0).args[1]).to.be('jwt error');
      });
    });
  });
});
