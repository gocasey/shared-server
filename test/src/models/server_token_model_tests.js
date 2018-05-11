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
        mockPool.query.resolves({ rows: [mockToken] });
      });

      it('returns token', async function() {
        let token = await serverTokenModel.findByServer(mockServer);
        expect(token).to.be.ok();
        expect(token.server_id).to.be(12345);
        expect(token.token_id).to.be(6789);
        expect(token.token).to.be('token');
      });

      it('logs success', async function() {
        await serverTokenModel.findByServer(mockServer);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Token for server name:\'%s\' found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('name');
      });
    });

    describe('token not found', function() {
      before(function() {
        mockPool.query.resolves({ rows: [] } );
      });

      it('returns null', async function() {
        let token = await serverTokenModel.findByServer(mockServer);
        expect(token).to.be.null;
      });

      it('logs token not found', async function() {
        await serverTokenModel.findByServer(mockServer);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Token for server name:\'%s\' not found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('name');
      });
    });

    describe('db error', function() {
      before(function() {
        mockPool.query.rejects(new Error('DB error'));
      });

      it('returns error', async function() {
        let err;
        try {
          await serverTokenModel.findByServer(mockServer);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('DB error');
      });

      it('logs db failure', async function() {
        try {
          await serverTokenModel.findByServer(mockServer);
        } catch (err) { }
        expect(mockLogger.error.calledTwice);
        expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
        expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
        expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for token for server name:\'%s\' in the database');
        expect(mockLogger.error.getCall(1).args[1]).to.be('name');
      });
    });
  });

  describe('#createOrUpdate', function() {
    describe('success', function() {
      before(function() {
        mockPool.query.resolves({ rows: [mockToken] });
      });

      it('returns token', async () => {
        let token = await serverTokenModel.createOrUpdate(mockServer, mockToken);
        expect(token).to.be.ok();
        expect(token.server_id).to.be(12345);
        expect(token.token_id).to.be(6789);
        expect(token.token).to.be('token');
      });
    });


    describe('db error', function() {
      before(function() {
        mockPool.query.rejects(new Error('DB error'));
      });

      it('returns error', async function() {
        let err;
        try {
          await serverTokenModel.createOrUpdate(mockServer, mockToken);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('DB error');
      });
    });
  });
});
