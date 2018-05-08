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
  let mocks = { '../../src/utils/integrity_validator.js': function() {
 return mockIntegrityValidator;
} };
  let UserModel = proxyquire(UserModelModule, mocks);
  return new UserModel(mockLogger, mockPool);
}

const userModel = createUserModel();

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
        mockPool.query.callsArgWith(2, null, { rows: [{ user_id: 123, username: 'name', password: 'pass', _rev: 'rev' }] });
      });

      it('returns user', function(done) {
        userModel.findByUsername('name', function(err, user) {
          expect(user).to.be.ok();
          expect(user.user_id).to.be(123);
          expect(user.username).to.be('name');
          expect(user.password).to.be('pass');
          expect(user._rev).to.be('rev');
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

    describe('user found', function() {
      describe('user not modified', function() {
        before(function() {
          mockPool.query.onFirstCall().callsArgWith(2, null, { rows: [dbUserFound] });
        });

        it('passes correct values to find query', function(done) {
          userModel.update(mockUser, function() {
            expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
            done();
          });
        });

        describe('update success', function() {
          before(function() {
            mockPool.query.onSecondCall().callsArgWith(2, null, { rows: [dbUserUpdated] });
          });

          it('passes correct values to update query', function(done) {
            userModel.update(mockUser, function() {
              expect(mockPool.query.calledTwice);
              expect(mockPool.query.getCall(1).args[1]).to.eql(['newPass', 'newRev', 'name']);
              done();
            });
          });

          it('does not return error', function(done) {
            userModel.update(mockUser, function(err) {
              expect(err).to.be.null;
              done();
            });
          });

          it('returns updated user', function(done) {
            userModel.update(mockUser, function(err, user) {
              expect(user.user_id).to.be(123);
              expect(user.username).to.be('name');
              expect(user._rev).to.be('newRev');
              done();
            });
          });
        });


        describe('db error on update', function() {
          before(function() {
            mockPool.query.onSecondCall().callsArgWith(2, 'DB error on update');
          });

          it('passes correct values to update query', function(done) {
            userModel.update(mockUser, function() {
              expect(mockPool.query.calledTwice);
              expect(mockPool.query.getCall(1).args[1]).to.eql(['newPass', 'newRev', 'name']);
              done();
            });
          });

          it('returns error', function(done) {
            userModel.update(mockUser, function(err) {
              expect(err).to.be.ok();
              done();
            });
          });

          it('does not return user', function(done) {
            userModel.update(mockUser, function(err, user) {
              expect(user).to.be.null;
              done();
            });
          });
        });
      });

      describe('user modified', function() {
        before(function() {
          mockPool.query.onFirstCall().callsArgWith(2, null, { rows: [dbUserFoundModified] });
        });

        it('passes correct values to find query', function(done) {
          userModel.update(mockUser, function() {
            expect(mockPool.query.calledOnce);
            expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
            done();
          });
        });

        it('returns error', function(done) {
          userModel.update(mockUser, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });

        it('does not return user', function(done) {
          userModel.update(mockUser, function(err, user) {
            expect(user).to.be.null;
            done();
          });
        });
      });
    });

    describe('user not found', function() {
      before(function() {
        mockPool.query.onFirstCall().callsArgWith(2, null, { rows: [] });
      });

      it('passes correct values to find query', function(done) {
        userModel.update(mockUser, function() {
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
          done();
        });
      });

      it('returns error', function(done) {
        userModel.update(mockUser, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('does not return user', function(done) {
        userModel.update(mockUser, function(err, user) {
          expect(user).to.be.null;
          done();
        });
      });
    });

    describe('db failure on find', function() {
      before(function() {
        mockPool.query.onFirstCall().callsArgWith(2, 'db failure on find');
      });

      it('passes correct values to find query', function(done) {
        userModel.update(mockUser, function() {
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
          done();
        });
      });

      it('returns error', function(done) {
        userModel.update(mockUser, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('does not return user', function(done) {
        userModel.update(mockUser, function(err, user) {
          expect(user).to.be.null;
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

    describe('insert success', function() {
      before(function() {
        mockPool.query.onFirstCall().callsArgWith(2, null, { rows: [mockDbUser] });
      });

      it('passes correct values to insert query', function(done) {
        userModel.create(mockUser, function() {
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name', 'pass']);
          done();
        });
      });

      describe('update success', function() {
        before(function() {
          mockPool.query.onSecondCall().callsArgWith(2, null, { rows: [mockDbUserUpdated] });
        });

        it('passes correct values to update query', function(done) {
          userModel.create(mockUser, function() {
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
            done();
          });
        });

        it('does not return error', function(done) {
          userModel.create(mockUser, function(err) {
            expect(err).to.be.null;
            done();
          });
        });

        it('returns updated user', function(done) {
          userModel.create(mockUser, function(err, user) {
            expect(user.user_id).to.be(123);
            expect(user.username).to.be('name');
            expect(user._rev).to.be('newRev');
            done();
          });
        });
      });

      describe('db error on update', function() {
        before(function() {
          mockPool.query.onSecondCall().callsArgWith(2, 'DB error');
        });

        it('passes correct values to update query', function(done) {
          userModel.create(mockUser, function() {
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
            done();
          });
        });

        it('returns error', function(done) {
          userModel.create(mockUser, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });

        it('does not return user', function(done) {
          userModel.create(mockUser, function(err, user) {
            expect(user).to.be.null;
            done();
          });
        });
      });
    });

    describe('insert failure', function() {
      before(function() {
        mockPool.query.onFirstCall().callsArgWith(2, 'db error on insert');
      });

      it('passes correct values to insert query', function(done) {
        userModel.create(mockUser, function() {
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name', 'pass']);
          done();
        });
      });

      it('returns error', function(done) {
        userModel.create(mockUser, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('does not return user', function(done) {
        userModel.create(mockUser, function(err, user) {
          expect(user).to.be.null;
          done();
        });
      });
    });
  });
});
