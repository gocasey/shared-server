const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const UserControllerModule = '../../../src/controllers/user_controller.js';

let mockUserService = {
  createUser: sinon.stub(),
};

let mockUserTokenService = {
  generateToken: sinon.stub(),
};

let mockLogger = {
  error: sinon.stub(),
};

function setupUserController() {
  let mocks = {
    '../lib/services/user_service.js': function() {
 return mockUserService;
},
    '../lib/services/user_token_service.js': function() {
 return mockUserTokenService;
},
  };
  let UserController = proxyquire(UserControllerModule, mocks);
  return new UserController(mockLogger);
}

describe('UserController Tests', () => {
  let userController;

  before(() => {
    userController = setupUserController();
  });

  beforeEach(() => {
    mockUserTokenService.generateToken.resetHistory();
    mockUserService.createUser.resetHistory();
  });

  describe('#createUser', () => {
    let mockUserRequest = {
      body: {
        username: 'name',
        password: 'pass',
        applicationOwner: 'appOwner',
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockUserService.createUser.resolves({ id: 123, name: 'name', _rev: 'rev'});
      });

      it('calls user service', async () => {
        await userController.createUser(mockUserRequest, mockResponse, function() {});
        expect(mockUserService.createUser.calledOnce);
      });

      it('passes correct params to user service', async () => {
        await userController.createUser(mockUserRequest, mockResponse, function() {});
        expect(mockUserService.createUser.getCall(0).args[0]).to.be.eql(mockUserRequest.body);
      });

      it('saves user in response', async () => {
        await userController.createUser(mockUserRequest, mockResponse, function() {});
        expect(mockResponse.user).to.be.ok();
        expect(mockResponse.user.id).to.be(123);
        expect(mockResponse.user.name).to.be('name');
        expect(mockResponse.user._rev).to.be('rev');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await userController.createUser(mockUserRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockUserService.createUser.rejects(new Error('creation error'));
      });

      it('calls user service', async () => {
        await userController.createUser(mockUserRequest, mockResponse, function() {});
        expect(mockUserService.createUser.calledOnce);
      });

      it('passes correct params to user service', async () => {
        await userController.createUser(mockUserRequest, mockResponse, function() {});
        expect(mockUserService.createUser.getCall(0).args[0]).to.be.eql(mockUserRequest.body);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await userController.createUser(mockUserRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('creation error')));
      });
    });
  });

  describe('#generateToken', () => {
    let mockUserResponse = {
      user: {
        id: 123,
        name: 'name',
        _rev: 'rev',
      },
    };

    let mockRequest = {};

    describe('success', () => {
      before(() => {
        mockUserTokenService.generateToken.resolves({ token_id: 456, user_id: 123, token: 'token' });
      });

      it('calls user token service', async () => {
        await userController.generateTokenForApplicationUser(mockRequest, mockUserResponse, function() {});
        expect(mockUserTokenService.generateToken.calledOnce);
      });

      it('passes correct params to user token service', async () => {
        await userController.generateTokenForApplicationUser(mockRequest, mockUserResponse, function() {});
        expect(mockUserTokenService.generateToken.getCall(0).args[0]).to.be.eql(mockUserResponse.user);
      });

      it('saves token in response', async () => {
        await userController.generateTokenForApplicationUser(mockRequest, mockUserResponse, function() {});
        expect(mockUserResponse.token).to.be.ok();
        expect(mockUserResponse.token.token_id).to.be(456);
        expect(mockUserResponse.token.user_id).to.be(123);
        expect(mockUserResponse.token.token).to.be('token');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await userController.generateTokenForApplicationUser(mockRequest, mockUserResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockUserTokenService.generateToken.rejects(new Error('token creation error'));
      });

      it('calls user token service', async () => {
        await userController.generateTokenForApplicationUser(mockRequest, mockUserResponse, function() {});
        expect(mockUserTokenService.generateToken.calledOnce);
      });

      it('passes correct params to user token service', async () => {
        await userController.generateTokenForApplicationUser(mockRequest, mockUserResponse, function() {});
        expect(mockUserTokenService.generateToken.getCall(0).args[0]).to.be.eql(mockUserResponse.user);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await userController.generateTokenForApplicationUser(mockRequest, mockUserResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('token creation error')));
      });
    });
  });
});
