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

describe('UserTokenModel Tests', () => {
  beforeEach(() => {
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

  describe('#findByUser', () => {
    describe('token found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [mockToken] });
      });

      it('returns token', async () => {
        let token = await userTokenModel.findByUser(mockUser);
        expect(token).to.be.ok();
        expect(token.user_id).to.be(12345);
        expect(token.token_id).to.be(6789);
        expect(token.token).to.be('token');
      });

      it('logs success', async () => {
        await userTokenModel.findByUser(mockUser);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Token for username:\'%s\' found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('username');
      });
    });

    describe('token not found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [] });
      });

      it('does not return token', async () => {
        let token = await userTokenModel.findByUser(mockUser);
        expect(token).to.be.null;
      });

      it('logs token not found', async () => {
        await userTokenModel.findByUser(mockUser);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Token for username:\'%s\' not found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('username');
      });
    });

    describe('db error', () => {
      before(() => {
        mockPool.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let err;
        try {
          await userTokenModel.findByUser(mockUser);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('DB error');
      });

      it('logs db failure', async () => {
        try {
          await userTokenModel.findByUser(mockUser);
        } catch (err) {}
        expect(mockLogger.error.calledTwice);
        expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
        expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
        expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for token for username:\'%s\' in the database');
        expect(mockLogger.error.getCall(1).args[1]).to.be('username');
      });
    });
  });

  describe('#createOrUpdate', () => {
    describe('success', () => {
      before(() => {
        mockPool.query.resolves({ rows: [mockToken] });
      });

      it('returns token', async () => {
        let token = await userTokenModel.createOrUpdate(mockUser, mockToken);
        expect(token).to.be.ok();
        expect(token.user_id).to.be(12345);
        expect(token.token_id).to.be(6789);
        expect(token.token).to.be('token');
      });
    });


    describe('db error', () => {
      before(() => {
        mockPool.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let err;
        try {
          await userTokenModel.createOrUpdate(mockUser, mockToken);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('DB error');
      });
    });
  });
});
