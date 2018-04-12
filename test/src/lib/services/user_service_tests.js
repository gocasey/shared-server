const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const UserServiceModule = '../../../../src/lib/services/user_service.js';

var mockLogger = {
  info: sinon.stub(),
  error: sinon.stub()
};

var mockUserModel = {
  findByUsername: sinon.stub(),
  save: sinon.stub()
};

var mockTokenGenerationService = {
  generateToken: sinon.stub(),
  validateToken: sinon.stub()
};

function setupUserService(){
  var mocks = {
    '../../models/user_model.js' : function(){ return mockUserModel },
    './token_generation_service' : function(){ return mockTokenGenerationService }
  };
  var UserService = proxyquire(UserServiceModule, mocks);
  return new UserService(mockLogger);
}


describe('UserService Tests', function(){

  var userService;

  before(function(){
    userService = setupUserService();
  });

  describe('#generateToken', function(){

    describe('user found', function(){


      describe('user has token', function(){

        before(function(){
          mockUserModel.findByUsername.callsArgWith(1, null, { username: 'username', password: 'password', token: 'token'});
        });

        describe('token valid', function(){
          before(function(){
            mockTokenGenerationService.validateToken.callsArgWith(2);
          });

          it('does not return error', function(done){
            userService.generateToken('username', function(err){
              expect(err).to.be.null;
              done();
            });
          });

        });

        describe('token invalid', function(){
          before(function(){
            mockTokenGenerationService.validateToken.callsArgWith(2, 'token invalid');
            mockTokenGenerationService.generateToken.callsArgWith(1, 'token');
          });

          it('does not return error', function(done){
            userService.generateToken('username', function(err){
              expect(err).to.be.null;
              done();
            });
          });
        });

      });

      describe('user does not have token', function(){
        before(function(){
          mockUserModel.findByUsername.callsArgWith(1, null, { username: 'username', password: 'password'});
          mockTokenGenerationService.generateToken.callsArgWith(1, 'token');
        });

        it('does not return error', function(done){
          userService.generateToken('username', function(err){
            expect(err).to.be.null;
            done();
          });
        });
      });

    });

    describe('user not found', function(){
      before(function(){
        mockUserModel.findByUsername.callsArgWith(1, 'user not found');
      });

      it('returns error', function(done){
        userService.generateToken('username', function(err){
          expect(err).to.be.ok();
          done();
        });
      });
    });

  });

  describe('#authenticateWithPassword', function(){

  });

});
