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

const mockPool = {
  query: sinon.stub(),
};

const mockIntegrityValidator = {
  createHash: sinon.stub(),
};

function createUserModel() {
  mockIntegrityValidator.createHash.returns('newRev');
  let mocks = { '../../src/utils/integrity_validator.js': function(){
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
    mockPool.query.resetHistory();
  });

  describe('#findByUsername', () => {
    describe('user found', () => {
      before(() => {
        mockPool.query.resolves({ rows:
            [{ user_id: 123, username: 'name', password: 'pass', _rev: 'rev', app_owner: 'appOwner' }] });
      });

      it('returns user', async () => {
        let user = await userModel.findByUsername('name');
        expect(user).to.be.ok();
        expect(user.user_id).to.be(123);
        expect(user.username).to.be('name');
        expect(user.password).to.be('pass');
        expect(user._rev).to.be('rev');
        expect(user.applicationOwner).to.be('appOwner');
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
        mockPool.query.resolves({ rows: [] } );
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
        mockPool.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let functionSpy = sinon.spy(userModel.findByUsername);
        try{
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
      applicationOwner: 'appOwner',
      _rev: 'oldRev',
    };

    let dbUserFound = {
      user_id: 123,
      username: 'name',
      password: 'oldPass',
      app_owner: 'appOwner',
      _rev: 'oldRev',
    };

    let dbUserFoundModified = {
      user_id: 123,
      username: 'name',
      password: 'oldPass',
      app_owner: 'appOwner',
      _rev: 'anotherRev',
    };

    let dbUserUpdated = {
      user_id: 123,
      username: 'name',
      password: 'newPass',
      app_owner: 'appOwner',
      _rev: 'newRev',
    };

    describe('user found', () => {
      describe('user not modified', () => {
        before(() => {
          mockPool.query.onFirstCall().resolves({ rows: [dbUserFound] });
        });

        describe('update success', () => {
          before(() => {
            mockPool.query.onSecondCall().resolves({ rows: [dbUserUpdated] });
          });

          it('passes correct values to find query', async () => {
            await userModel.update(mockUser);
            expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
          });

          it('passes correct values to update query', async () => {
            await userModel.update(mockUser);
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newPass', 'newRev', 'name']);
          });

          it('returns updated user', async () => {
            let user = await userModel.update(mockUser);
            expect(user.user_id).to.be(123);
            expect(user.username).to.be('name');
            expect(user.password).to.be('newPass');
            expect(user.applicationOwner).to.be('appOwner');
            expect(user._rev).to.be('newRev');
          });
        });


        describe('db error on update', () => {
          before(() => {
            mockPool.query.onSecondCall().rejects(new Error('DB error on update'));
          });

          it('passes correct values to update query', async () => {
            try {
              await userModel.update(mockUser);
            } catch (err) { }
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newPass', 'newRev', 'name']);
          });

          it('returns error', async () => {
            let err;
            try {
              await userModel.update(mockUser);
            }
            catch(ex) {
              err = ex;
            }
            expect(err).to.be.ok();
            expect(err.message).to.be('DB error on update');
          });
        });
      });

      describe('user modified', () => {
        before(() => {
          mockPool.query.onFirstCall().resolves({ rows: [dbUserFoundModified] });
        });

        it('passes correct values to find query', async () => {
          try {
            await userModel.update(mockUser);
          } catch (err) { }
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
        });

        it('returns error', async () => {
          let err;
          try {
            await userModel.update(mockUser);
          }
          catch(ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('Error updating');
        });
      });
    });

    describe('user not found', () => {
      before(() => {
        mockPool.query.onFirstCall().resolves({ rows: [] });
      });

      it('passes correct values to find query', async () => {
        try {
          await userModel.update(mockUser);
        } catch (err) { }
        expect(mockPool.query.calledOnce);
        expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
      });

      it('returns error', async function() {
        let err;
        try {
          await userModel.update(mockUser);
        }
        catch(ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('User does not exist');
      });
    });

    describe('db failure on find', () => {
      before(() => {
        mockPool.query.onFirstCall().rejects(new Error('db failure on find'));
      });

      it('passes correct values to find query', async () => {
        try {
          await userModel.update(mockUser);
        } catch (err) { }
        expect(mockPool.query.calledOnce);
        expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
      });

      it('returns error', async () => {
        let err;
        try {
          await userModel.update(mockUser);
        }
        catch(ex) {
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
      applicationOwner: 'appOwner',
    };

    let mockDbUser = {
      username: 'name',
      password: 'pass',
      user_id: 123,
      app_owner: 'appOwner',
    };

    let mockDbUserUpdated = {
      username: 'name',
      password: 'pass',
      user_id: 123,
      _rev: 'newRev',
      app_owner: 'appOwner',
    };

    describe('insert success', () => {
      before(() => {
        mockPool.query.onFirstCall().resolves({ rows: [mockDbUser] });
      });

      describe('update success', () => {
        before(() => {
          mockPool.query.onSecondCall().resolves({ rows: [mockDbUserUpdated] });
        });

        it('passes correct values to insert query', async () => {
          await userModel.create(mockUser);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name', 'pass', 'appOwner']);
        });

        it('passes correct values to update query', async () => {
          await userModel.create(mockUser);
          expect(mockPool.query.calledTwice);
          expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
        });

        it('returns updated user', async () => {
          let user = await userModel.create(mockUser);
          expect(user.user_id).to.be(123);
          expect(user.username).to.be('name');
          expect(user.password).to.be('pass');
          expect(user.applicationOwner).to.be('appOwner');
          expect(user._rev).to.be('newRev');
        });
      });

      describe('db error on update', () => {
        before(() => {
          mockPool.query.onSecondCall().rejects(new Error('DB error'));
        });

        it('passes correct values to update query', async () => {
          try {
            await userModel.create(mockUser);
          } catch (err) { }
          expect(mockPool.query.calledTwice);
          expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
        });

        it('returns error', async () => {
          let err;
          try {
            await userModel.create(mockUser);
          }
          catch(ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('DB error');
        });
      });
    });

    describe('insert failure', () => {
      before(() => {
        mockPool.query.onFirstCall().rejects(new Error('db error on insert'));
      });

      it('passes correct values to insert query', async () => {
        try {
          await userModel.create(mockUser);
        } catch (err) { }
        expect(mockPool.query.calledOnce);
        expect(mockPool.query.getCall(0).args[1]).to.eql(['name', 'pass', 'appOwner']);
      });

      it('returns error', async function() {
        let err;
        try {
          await userModel.create(mockUser);
        }
        catch(ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db error on insert');
      });
    });
  });
});
