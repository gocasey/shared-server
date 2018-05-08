const expect = require('expect.js');
const sinon = require('sinon');
const UserRegistrationResponseBuilder = require('../../../../src/middlewares/response_builders/user_registration_response_builder.js');

const mockLogger = {
  debug: sinon.stub(),
};

describe('UserRegistrationResponseBuilder Tests', function() {
  let userRegistrationResponseBuilder = new UserRegistrationResponseBuilder(mockLogger);

  describe('#buildResponse', function() {
    let mockRequest = {};
    let mockResponse = {
      data: {
        user_id: 123456789,
        username: 'username',
        _rev: 'rev',
      },
      json: sinon.stub(),
    };

    beforeEach(function() {
      mockLogger.debug.resetHistory();
      userRegistrationResponseBuilder.buildResponse(mockRequest, mockResponse);
    });

    it('passes response', function() {
      expect(mockResponse.json.calledWith(sinon.match({ metadata: { version: '1.0.0' },
        user: { id: 123456789, _rev: 'rev', applicationOwner: 'mockAppOwner', username: 'username' } })));
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql( { metadata: { version: '1.0.0' },
        user: { id: 123456789, _rev: 'rev', applicationOwner: 'mockAppOwner', username: 'username' } } );
    });
  });
});
