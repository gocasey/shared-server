const expect = require('expect.js');
const sinon = require('sinon');
const UserModel = require('../../../src/models/user_model.js');

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub(),
};

const mockPool = {
  query: sinon.stub(),
};

const userModel = new UserModel(mockLogger, mockPool);

describe('UserModel Tests', function() {
  beforeEach(function() {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockPool.query.resetHistory();
  });

  describe('#findByUsername', function() {
    describe('user found', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [{ username: 'name', password: 'pass' }] });
      });

      it('returns user', function(done) {
        userModel.findByUsername('name', function(err, user) {
          expect(user).to.be.ok();
          expect(user.username).to.be('name');
          expect(user.password).to.be('pass');
          done();
        });
      });

      it('logs success', function(done) {
        userModel.findByUsername('name', function() {
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('User with username:\'%s\' found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('name');
          done();
        });
      });
    });

    describe('user not found', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [] } );
      });

      it('returns error', function(done) {
        userModel.findByUsername('name', function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs user not found', function(done) {
        userModel.findByUsername('name', function() {
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('User with username:\'%s\' not found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('name');
          done();
        });
      });
    });

    describe('db error', function() {
      before(function() {
        mockPool.query.callsArgWith(2, 'DB error');
      });

      it('returns error', function(done) {
        userModel.findByUsername('name', function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs db failure', function(done) {
        userModel.findByUsername('name', function() {
          expect(mockLogger.error.calledTwice);
          expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
          expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
          expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for username:\'%s\' in the database');
          expect(mockLogger.error.getCall(1).args[1]).to.be('name');
          done();
        });
      });
    });
  });

  describe('#update', function() {
    let mockUser = {
      username: 'name',
      password: 'pass',
    };

    describe('success', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [mockUser] });
      });

      it('passes correct values to query', function(done) {
        userModel.update(mockUser, function() {
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['pass', 'name']);
          done();
        });
      });

      it('does not return error', function(done) {
        userModel.update(mockUser, function(err) {
          expect(err).to.be.null;
          done();
        });
      });
    });


    describe('db error', function() {
      before(function() {
        mockPool.query.callsArgWith(2, 'DB error');
      });

      it('returns error', function(done) {
        userModel.update(mockUser, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });


  describe('#create', function() {
    let mockUser = {
      username: 'name',
      password: 'pass',
    };

    describe('success', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [mockUser] });
      });

      it('does not return error', function(done) {
        userModel.create(mockUser, function(err) {
          expect(err).to.be.null;
          done();
        });
      });
    });


    describe('db error', function() {
      before(function() {
        mockPool.query.callsArgWith(2, 'DB error');
      });

      it('returns error', function(done) {
        userModel.create(mockUser, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });
});
