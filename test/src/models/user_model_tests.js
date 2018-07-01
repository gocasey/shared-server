const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const UserModelModule = '../../../src/models/user_model.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub(),
};

const mockClient = {
  query: sinon.stub(),
  release: sinon.stub(),
};

const mockPool = {
  connect: () => {
    return mockClient;
  },
};

const mockIntegrityValidator = {
  createHash: sinon.stub(),
};

function createUserModel() {
  mockClient.release.returns();
  mockIntegrityValidator.createHash.returns('newRev');
  let mocks = { '../../src/utils/integrity_validator.js': function() {
 return mockIntegrityValidator;
} };
  let UserModel = proxyquire(UserModelModule, mocks);
  return new UserModel(mockLogger, mockPool);
}

const userModel = createUserModel();

describe('UserModel Tests', () => {
  beforeEach(() => {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockClient.query.resetHistory();
  });

  describe('#findByUsername', () => {
    describe('user found', () => {
      before(() => {
        mockClient.query.resolves({ rows:
            [{ user_id: 123, username: 'name', password: 'pass', _rev: 'rev' }] });
      });

      it('returns user', async () => {
        let user = await userModel.findByUsername('name');
        expect(user).to.be.ok();
        expect(user.user_id).to.be(123);
        expect(user.username).to.be('name');
        expect(user.password).to.be('pass');
        expect(user._rev).to.be('rev');
      });

      it('logs success', async () => {
        await userModel.findByUsername('name');
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('User with username:\'%s\' found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('name');
      });
    });

    describe('user not found', () => {
      before(() => {
        mockClient.query.resolves({ rows: [] } );
      });

      it('returns null', async () => {
        let user = await userModel.findByUsername('name');
        expect(user).to.be.null;
      });

      it('logs user not found', async () => {
        await userModel.findByUsername('name');
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('User with username:\'%s\' not found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('name');
      });
    });

    describe('db error', () => {
      before(() => {
        mockClient.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let functionSpy = sinon.spy(userModel.findByUsername);
        try {
          await functionSpy('name');
          throw new Error('Exception was not thrown');
        } catch (err) { }
        expect(functionSpy.threw(new Error('DB error')));
      });

      it('logs db failure', async () => {
        try {
          await userModel.findByUsername('name');
        } catch (err) { }
        expect(mockLogger.error.calledTwice);
        expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
        expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
        expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for username:\'%s\' in the database');
        expect(mockLogger.error.getCall(1).args[1]).to.be('name');
      });
    });
  });

  describe('#update', () => {
    let mockUser = {
      username: 'name',
      password: 'newPass',
      _rev: 'oldRev',
    };

    let dbUserFound = {
      user_id: 123,
      username: 'name',
      password: 'oldPass',
      _rev: 'oldRev',
    };

    let dbUserFoundModified = {
      user_id: 123,
      username: 'name',
      password: 'oldPass',
      _rev: 'anotherRev',
    };

    let dbUserUpdated = {
      user_id: 123,
      username: 'name',
      password: 'newPass',
      _rev: 'newRev',
    };

    describe('user found', () => {
      describe('user not modified', () => {
        before(() => {
          mockClient.query.onFirstCall().resolves({ rows: [dbUserFound] });
        });

        describe('update success', () => {
          before(() => {
            mockClient.query.onSecondCall().resolves({ rows: [dbUserUpdated] });
          });

          it('passes correct values to find query', async () => {
            await userModel.update(mockUser);
            expect(mockClient.query.getCall(0).args[1]).to.eql(['name']);
          });

          it('passes correct values to update query', async () => {
            await userModel.update(mockUser);
            expect(mockClient.query.calledTwice);
            expect(mockClient.query.getCall(1).args[1]).to.eql(['newPass', 'newRev', 'name']);
          });

          it('returns updated user', async () => {
            let user = await userModel.update(mockUser);
            expect(user.user_id).to.be(123);
            expect(user.username).to.be('name');
            expect(user.password).to.be('newPass');
            expect(user._rev).to.be('newRev');
          });
        });


        describe('db error on update', () => {
          before(() => {
            mockClient.query.onSecondCall().rejects(new Error('DB error on update'));
          });

          it('passes correct values to update query', async () => {
            try {
              await userModel.update(mockUser);
            } catch (err) { }
            expect(mockClient.query.calledTwice);
            expect(mockClient.query.getCall(1).args[1]).to.eql(['newPass', 'newRev', 'name']);
          });

          it('returns error', async () => {
            let err;
            try {
              await userModel.update(mockUser);
            } catch (ex) {
              err = ex;
            }
            expect(err).to.be.ok();
            expect(err.message).to.be('DB error on update');
          });
        });
      });

      describe('user modified', () => {
        before(() => {
          mockClient.query.onFirstCall().resolves({ rows: [dbUserFoundModified] });
        });

        it('passes correct values to find query', async () => {
          try {
            await userModel.update(mockUser);
          } catch (err) { }
          expect(mockClient.query.calledOnce);
          expect(mockClient.query.getCall(0).args[1]).to.eql(['name']);
        });

        it('returns error', async () => {
          let err;
          try {
            await userModel.update(mockUser);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('Error updating');
        });
      });
    });

    describe('user not found', () => {
      before(() => {
        mockClient.query.onFirstCall().resolves({ rows: [] });
      });

      it('passes correct values to find query', async () => {
        try {
          await userModel.update(mockUser);
        } catch (err) { }
        expect(mockClient.query.calledOnce);
        expect(mockClient.query.getCall(0).args[1]).to.eql(['name']);
      });

      it('returns error', async function() {
        let err;
        try {
          await userModel.update(mockUser);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('User does not exist');
      });
    });

    describe('db failure on find', () => {
      before(() => {
        mockClient.query.onFirstCall().rejects(new Error('db failure on find'));
      });

      it('passes correct values to find query', async () => {
        try {
          await userModel.update(mockUser);
        } catch (err) { }
        expect(mockClient.query.calledOnce);
        expect(mockClient.query.getCall(0).args[1]).to.eql(['name']);
      });

      it('returns error', async () => {
        let err;
        try {
          await userModel.update(mockUser);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db failure on find');
      });
    });
  });


  describe('#create', () => {
    let mockUser = {
      username: 'name',
      password: 'pass',
    };

    let mockDbUser = {
      username: 'name',
      password: 'pass',
      user_id: 123,
    };

    let mockDbUserUpdated = {
      username: 'name',
      password: 'pass',
      user_id: 123,
      _rev: 'newRev',
    };

    describe('insert success', () => {
      before(() => {
        mockClient.query.onFirstCall().resolves({ rows: [mockDbUser] });
      });

      describe('update success', () => {
        before(() => {
          mockClient.query.onSecondCall().resolves({ rows: [mockDbUserUpdated] });
        });

        it('passes correct values to insert query', async () => {
          await userModel.create(mockUser);
          expect(mockClient.query.getCall(0).args[1]).to.eql(['name', 'pass']);
        });

        it('passes correct values to update query', async () => {
          await userModel.create(mockUser);
          expect(mockClient.query.calledTwice);
          expect(mockClient.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
        });

        it('returns updated user', async () => {
          let user = await userModel.create(mockUser);
          expect(user.user_id).to.be(123);
          expect(user.username).to.be('name');
          expect(user.password).to.be('pass');
          expect(user._rev).to.be('newRev');
        });
      });

      describe('db error on update', () => {
        before(() => {
          mockClient.query.onSecondCall().rejects(new Error('DB error'));
        });

        it('passes correct values to update query', async () => {
          try {
            await userModel.create(mockUser);
          } catch (err) { }
          expect(mockClient.query.calledTwice);
          expect(mockClient.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
        });

        it('returns error', async () => {
          let err;
          try {
            await userModel.create(mockUser);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('DB error');
        });
      });
    });

    describe('insert failure', () => {
      before(() => {
        mockClient.query.onFirstCall().rejects(new Error('db error on insert'));
      });

      it('passes correct values to insert query', async () => {
        try {
          await userModel.create(mockUser);
        } catch (err) { }
        expect(mockClient.query.calledOnce);
        expect(mockClient.query.getCall(0).args[1]).to.eql(['name', 'pass']);
      });

      it('returns error', async function() {
        let err;
        try {
          await userModel.create(mockUser);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db error on insert');
      });
    });
  });
});
