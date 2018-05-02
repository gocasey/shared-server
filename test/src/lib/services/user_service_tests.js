const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const UserServiceModule = '../../../../src/lib/services/user_service.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const mockUserModel = {
  findByUsername: sinon.stub(),
  update: sinon.stub(),
  create: sinon.stub(),
};

const mockDigest = sinon.stub();

const mockCrypto = {
  createHmac: function() {
    return {
      update: function() {
        return {
          digest: mockDigest,
        };
      },
    };
  },
};

function setupUserService() {
  let mocks = {
    'crypto': mockCrypto,
    '../../models/user_model.js': function() {
 return mockUserModel;
},
  };
  let UserService = proxyquire(UserServiceModule, mocks);
  return new UserService(mockLogger);
}


describe('UserService Tests', function() {
  let userService;

  before(function() {
    userService = setupUserService();
  });

  describe('#authenticateWithPassword', function() {
    describe('user found', function() {
      before(function() {
        mockUserModel.findByUsername.callsArgWith(1, null, { username: 'username', password: 'password' });
      });

      describe('valid password', function() {
        before(function() {
          mockDigest.returns('password');
        });

        it('does not return error', function(done) {
          userService.authenticateWithPassword('username', 'password', function(err) {
            expect(err).to.be.null;
            done();
          });
        });
      });

      describe('invalid password', function() {
        before(function() {
          mockDigest.returns('another_hash');
        });

        it('returns error', function(done) {
          userService.authenticateWithPassword('username', 'password', function(err) {
            expect(err).to.be.ok();
            done();
          });
        });
      });
    });

    describe('user not found', function() {
      before(function() {
        mockUserModel.findByUsername.callsArgWith(1, 'user not found');
      });

      it('returns error', function(done) {
        userService.authenticateWithPassword('username', 'password', function(err) {
          expect(err).to.be.ok();
          done();
        });
      });
    });
  });

  describe('#createUser', function() {
    let mockBody = {
      username: 'username',
      password: 'pass',
    };

    describe('create success', function() {
      before(function() {
        mockUserModel.create.callsArgWith(1, null, { user_id: 1, username: 'username' });
      });

      it('does not return error', function(done) {
        userService.createUser(mockBody, function(err) {
          expect(err).to.be.null;
          done();
        });
      });

      it('returns user', function(done) {
        userService.createUser(mockBody, function(err, user) {
          expect(user).to.be.ok();
          expect(user.user_id).to.be(1);
          expect(user.username).to.be('username');
          done();
        });
      });
    });

    describe('create failure', function() {
      before(function() {
        mockUserModel.create.callsArgWith(1, 'Creation error');
      });

      describe('user found', function() {
        before(function() {
          mockUserModel.findByUsername.callsArgWith(1, null, { username: 'username', password: 'password' });
        });

        it('returns error', function(done) {
          userService.createUser(mockBody, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });
      });

      describe('user not found', function() {
        before(function() {
          mockUserModel.findByUsername.callsArgWith(1, 'user not found');
        });

        it('returns error', function(done) {
          userService.createUser(mockBody, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });
      });
    });
  });
});
