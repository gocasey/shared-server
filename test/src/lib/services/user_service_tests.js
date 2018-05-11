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


describe('UserService Tests', () => {
  let userService;

  before(() => {
    userService = setupUserService();
  });

  describe('#authenticateWithPassword', () => {
    describe('user found', () => {
      before(() => {
        mockUserModel.findByUsername.resolves({ username: 'username', password: 'password' });
      });

      describe('valid password', () => {
        before(() => {
          mockDigest.returns('password');
        });

        it('returns user', async () => {
          let user = await userService.authenticateWithPassword('username', 'password');
          expect(user.username).to.be('username');
          expect(user.password).to.be('password');
        });
      });

      describe('invalid password', () => {
        before(() => {
          mockDigest.returns('another_hash');
        });

        it('returns error', async () => {
          let err;
          try {
            await userService.authenticateWithPassword('username', 'password');
          }
          catch(ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('Password incorrect');
        });
      });
    });

    describe('user not found', () => {
      before(() => {
        mockUserModel.findByUsername.rejects(new Error('user not found'));
      });

      it('returns error', async () => {
        let err;
        try {
          await userService.authenticateWithPassword('username', 'password');
        }
        catch(ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('user not found');
      });
    });
  });

  describe('#createUser', () => {
    let mockBody = {
      username: 'username',
      password: 'pass',
      applicationOwner: 'appOwner',
    };

    describe('create success', () => {
      before(() => {
        mockUserModel.create.resolves({ user_id: 1, username: 'username', password: 'pass', applicationOwner: 'appOwner' });
      });

      it('returns user', async () => {
        let user = await userService.createUser(mockBody);
        expect(user).to.be.ok();
        expect(user.user_id).to.be(1);
        expect(user.username).to.be('username');
        expect(user.password).to.be('pass');
        expect(user.applicationOwner).to.be('appOwner');
      });
    });

    describe('create failure', () => {
      before(() => {
        mockUserModel.create.rejects(new Error('Creation error'));
      });

      describe('user found', () => {
        before(() => {
          mockUserModel.findByUsername.resolves({ username: 'username', password: 'password' });
        });

        it('returns error', async () => {
          let err;
          try {
            await userService.createUser(mockBody);
          }
          catch(ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('User creation error');
        });
      });

      describe('user not found', () => {
        before(() => {
          mockUserModel.findByUsername.rejects(new Error('user not found'));
        });

        it('returns error', async () => {
          let err;
          try {
            await userService.createUser(mockBody);
          }
          catch(ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('User creation error');
        });
      });
    });
  });
});
