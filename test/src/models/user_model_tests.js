const expect = require('expect.js');
const sinon = require('sinon');
const UserModel = require('../../../src/models/user_model.js');

var mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub()
};

var mockPool = {
  query: sinon.stub()
}

var userModel = new UserModel(mockLogger, mockPool);

describe('UserModel Tests', function(){

  beforeEach(function(){
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
  });

  describe('#findByUsername', function(){

    describe('user found', function(){
      before(function(){
        mockPool.query.callsArgWith(2, null, { rows: [ { username: 'name', password: 'pass', token: 'token' }]});
      });

      it('returns user', function(done){
        userModel.findByUsername('name', function(err, user){
          expect(user).to.be.ok();
          expect(user.username).to.be('name');
          expect(user.password).to.be('pass');
          expect(user.token).to.be('token');
          done();
        });
      });

      it('logs success', function(done){
        userModel.findByUsername('name', function(){
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('User with username:\'%s\' found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('name');
          done();
        });
      });

    });

    describe('user not found', function(){
      before(function(){
        mockPool.query.callsArgWith(2, null, { rows: [] } );
      });

      it('returns error', function(done){
        userModel.findByUsername('name', function(err){
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs user not found', function(done){
        userModel.findByUsername('name', function(){
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('User with username:\'%s\' not found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('name');
          done();
        });
      });
    });

    describe('db error', function(){
      before(function(){
        mockPool.query.callsArgWith(2, 'DB error');
      });

      it('returns error', function(done){
        userModel.findByUsername('name', function(err){
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs db failure', function(done){
        userModel.findByUsername('name', function(){
          expect(mockLogger.error.calledOnce);
          expect(mockLogger.error.getCall(0).args[0]).to.be('Error looking for username:\'%s\' in the database');
          expect(mockLogger.error.getCall(0).args[1]).to.be('name');
          done();
        });
      });
    });

  });
});
