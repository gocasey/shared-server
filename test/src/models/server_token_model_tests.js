const expect = require('expect.js');
const sinon = require('sinon');
const ServerTokenModel = require('../../../src/models/server_token_model.js');

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub(),
};

const mockPool = {
  query: sinon.stub(),
};

const serverTokenModel = new ServerTokenModel(mockLogger, mockPool);

describe('ServerTokenModel Tests', function() {
  beforeEach(function() {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockPool.query.resetHistory();
  });

  let mockServer = {
    id: 12345,
    name: 'name',
    _rev: 'rev',
  };

  let mockToken = {
    token_id: 6789,
    server_id: 12345,
    token: 'token',
  };

  describe('#findByServer', function() {
    describe('token found', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [mockToken] });
      });

      it('returns token', function(done) {
        serverTokenModel.findByServer(mockServer, function(err, token) {
          expect(token).to.be.ok();
          expect(token.server_id).to.be(12345);
          expect(token.token_id).to.be(6789);
          expect(token.token).to.be('token');
          done();
        });
      });

      it('logs success', function(done) {
        serverTokenModel.findByServer(mockServer, function() {
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('Token for server name:\'%s\' found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('name');
          done();
        });
      });
    });

    describe('token not found', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [] } );
      });

      it('does not return error', function(done) {
        serverTokenModel.findByServer(mockServer, function(err, token) {
          expect(err).to.be.null;
          expect(token).to.be.null;
          done();
        });
      });

      it('logs token not found', function(done) {
        serverTokenModel.findByServer(mockServer, function() {
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('Token for server name:\'%s\' not found');
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
        serverTokenModel.findByServer(mockServer, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs db failure', function(done) {
        serverTokenModel.findByServer(mockServer, function() {
          expect(mockLogger.error.calledTwice);
          expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
          expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
          expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for token for server name:\'%s\' in the database');
          expect(mockLogger.error.getCall(1).args[1]).to.be('name');
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
        serverTokenModel.createOrUpdate(mockServer, mockToken, function(err) {
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
        serverTokenModel.createOrUpdate(mockServer, mockToken, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });
});
