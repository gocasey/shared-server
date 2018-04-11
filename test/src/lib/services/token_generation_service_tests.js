const expect = require('expect.js');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const TokenGenerationServiceModule = '../../../../src/lib/services/token_generation_service.js';


describe('TokenGenerationService Tests', function(){

    var mockLogger = {
        info: sinon.stub(),
        error: sinon.stub()
    };

    var mockJwt = {
      sign: sinon.stub(),
      verify: sinon.stub()
    }

    var tokenGenerationService;

    function setupTokenGenerationService(){
      var mocks = {};
      mocks['jsonwebtoken'] = mockJwt;
      var TokenGenerationService = proxyquire(TokenGenerationServiceModule, mocks);
      return new TokenGenerationService(mockLogger);
    }

    beforeEach(function(){
      tokenGenerationService = setupTokenGenerationService();
      mockLogger.info.resetHistory();
      mockLogger.error.resetHistory();
    });


    describe('#generateToken', function () {

      describe('jwt sign success', function(){

        beforeEach(function(){
          mockJwt.sign.callsArgWith(3, null, "token");
        });

        it('returns token', function (done) {
          tokenGenerationService.generateToken('username', function(err, token){
            expect(token).to.be.ok();
            done();
          });
        });

        it('logs success', function(done){
          tokenGenerationService.generateToken('username', function(){
            expect(mockLogger.info.calledOnce);
            expect(mockLogger.info.getCall(0).args[0]).to.be('Token was created successfully for username %s');
            expect(mockLogger.info.getCall(0).args[1]).to.be('username');
            done();
          });
        });

        it('does not return error', function(done){
          tokenGenerationService.generateToken('username', function(err){
            expect(err).to.be.null;
            done();
          });
        });

        it('does not log error', function(done){
          tokenGenerationService.generateToken('username', function(){
            expect(mockLogger.error.notCalled);
            done();
          });
        });
      });


      describe('jwt sign failure', function(){

        beforeEach(function(){
          mockJwt.sign.callsArgWith(3, "Error generating token");
        });

        it('does not return token', function (done) {
          tokenGenerationService.generateToken('username', function(err, token){
            expect(token).to.be.null;
            done();
          });
        });

        it('logs failure', function(done){
          tokenGenerationService.generateToken('username', function(){
            expect(mockLogger.error.calledOnce);
            expect(mockLogger.error.getCall(0).args[0]).to.be('Token generation for username %s failed');
            expect(mockLogger.error.getCall(0).args[1]).to.be('username');
            done();
          });
        });

        it('returns error', function(done){
          tokenGenerationService.generateToken('username', function(err){
            expect(err).to.be.ok();
            done();
          });
        });
      });

    });

  describe('#validateToken', function () {


    describe('jwt verify success', function(){

      var usernameToCheck;
      var usernameDecoded;
      var tokenToCheck;

      describe('correct username', function(){

        before(function(){
          usernameToCheck = 'username';
          usernameDecoded = 'username';
          tokenToCheck = 'token';
          mockJwt.verify.callsArgWith(2, null, { data : usernameDecoded});
        });

        it('logs success', function (done) {
          tokenGenerationService.validateToken(tokenToCheck, usernameToCheck, function(){
            expect(mockLogger.info.calledOnce);
            expect(mockLogger.info.getCall(0).args[0]).to.be('Token was validated successfully for username %s');
            expect(mockLogger.info.getCall(0).args[1]).to.be(usernameToCheck);
            done();
          });
        });

        it('does not log error', function(done){
          tokenGenerationService.validateToken(tokenToCheck, usernameToCheck, function(){
            expect(mockLogger.error.notCalled);
            done();
          });
        });

        it('does not return error', function (done) {
          tokenGenerationService.validateToken(tokenToCheck, usernameToCheck, function(err){
            expect(err).to.be.null;
            done();
          });
        });

      });

      describe('wrong username', function(){
        before(function(){
          usernameToCheck = 'username';
          usernameDecoded = 'another_username';
          tokenToCheck = 'token';
          mockJwt.verify.callsArgWith(2, null, { data : usernameDecoded});
        });

        it('returns error', function (done) {
          tokenGenerationService.validateToken(tokenToCheck, usernameToCheck, function(err){
            expect(err).to.be.ok();
            done();
          });
        });

        it('logs failure', function (done) {
          tokenGenerationService.validateToken(tokenToCheck, usernameToCheck, function(){
            expect(mockLogger.error.calledOnce);
            expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated for username %s');
            expect(mockLogger.error.getCall(0).args[1]).to.be(usernameToCheck);
            done();
          });
        });
      });



    });

    describe('jwt verify token expired', function(){

      beforeEach(function(){
        mockJwt.verify.callsArgWith(2, { name: 'TokenExpiredError', message: 'jwt expired'});
      });

      it('returns error', function (done) {
        tokenGenerationService.validateToken('token', 'username', function(err){
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs failure', function (done) {
        tokenGenerationService.validateToken('token', 'username', function(){
          expect(mockLogger.error.calledOnce);
          expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated due to a failure: %s');
          expect(mockLogger.error.getCall(0).args[1]).to.be('jwt expired');
          done();
        });
      });
    });

    describe('jwt verify error', function(){

      beforeEach(function(){
        mockJwt.verify.callsArgWith(2, { name: 'JsonWebTokenError', message: 'jwt malformed'});
      });

      it('returns error', function (done) {
        tokenGenerationService.validateToken('token', 'username', function(err){
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs failure', function (done) {
        tokenGenerationService.validateToken('token', 'username', function(){
          expect(mockLogger.error.calledOnce);
          expect(mockLogger.error.getCall(0).args[0]).to.be('Token could not be validated due to a failure: %s');
          expect(mockLogger.error.getCall(0).args[1]).to.be('jwt malformed');
          done();
        });
      });
    });

  });

});
