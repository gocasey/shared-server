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
        name: 'name',
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockUserService.createUser.resolves({ id: 123, name: 'name', _rev: 'rev', applicationOwner: 'appOwner' });
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
        expect(mockResponse.data).to.be.ok();
        expect(mockResponse.data.id).to.be(123);
        expect(mockResponse.data.name).to.be('name');
        expect(mockResponse.data._rev).to.be('rev');
        expect(mockResponse.data.applicationOwner).to.be('appOwner');
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
        expect(mockUserResponse.data).to.be.ok();
        expect(mockUserResponse.data.token_id).to.be(456);
        expect(mockUserResponse.data.user_id).to.be(123);
        expect(mockUserResponse.data.token).to.be('token');
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
