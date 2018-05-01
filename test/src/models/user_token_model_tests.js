const expect = require('expect.js');
const sinon = require('sinon');
const UserTokenModel = require('../../../src/models/user_token_model.js');

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub(),
};

const mockPool = {
  query: sinon.stub(),
};

const userTokenModel = new UserTokenModel(mockLogger, mockPool);

describe('UserTokenModel Tests', function() {
  beforeEach(function() {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockPool.query.resetHistory();
  });

  let mockUser = {
    user_id: 12345,
    username: 'username',
  };

  let mockToken = {
    token_id: 6789,
    user_id: 12345,
    token: 'token',
  };

  describe('#findByUser', function() {
    describe('token found', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [mockToken] });
      });

      it('returns token', function(done) {
        userTokenModel.findByUser(mockUser, function(err, token) {
          expect(token).to.be.ok();
          expect(token.user_id).to.be(12345);
          expect(token.token_id).to.be(6789);
          expect(token.token).to.be('token');
          done();
        });
      });

      it('logs success', function(done) {
        userTokenModel.findByUser(mockUser, function() {
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('Token for username:\'%s\' found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('username');
          done();
        });
      });
    });

    describe('token not found', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [] } );
      });

      it('does not return error', function(done) {
        userTokenModel.findByUser(mockUser, function(err, token) {
          expect(err).to.be.null;
          expect(token).to.be.null;
          done();
        });
      });

      it('logs token not found', function(done) {
        userTokenModel.findByUser(mockUser, function() {
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('Token for username:\'%s\' not found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('username');
          done();
        });
      });
    });

    describe('db error', function() {
      before(function() {
        mockPool.query.callsArgWith(2, 'DB error');
      });

      it('returns error', function(done) {
        userTokenModel.findByUser(mockUser, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs db failure', function(done) {
        userTokenModel.findByUser(mockUser, function() {
          expect(mockLogger.error.calledTwice);
          expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
          expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
          expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for token for username:\'%s\' in the database');
          expect(mockLogger.error.getCall(1).args[1]).to.be('username');
          done();
        });
      });
    });
  });

  describe('#createOrUpdate', function() {
    describe('success', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [mockToken] });
      });

      it('does not return error', function(done) {
        userTokenModel.createOrUpdate(mockUser, mockToken, function(err) {
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
        userTokenModel.createOrUpdate(mockUser, mockToken, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });
});
