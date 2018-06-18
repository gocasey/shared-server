const expect = require('expect.js');
const sinon = require('sinon');
const ApplicationUserResponserBuilder = require('../../../../src/middlewares/response_builders/application_user_response_builder.js');

const mockLogger = {
  debug: sinon.stub(),
};

describe('ApplicationUserResponserBuilder Tests', function() {
  let applicationUserResponseBuilder = new ApplicationUserResponserBuilder(mockLogger);

  describe('#buildResponse', function() {
    let mockRequest = {};
    let passedStatusCode;
    let returnedResponse;
    let mockResponse = {
      user: {
        user_id: 123456789,
        username: 'username',
        _rev: 'rev',
      },
      serverOwner: {
        name: 'appOwner',
      },
      status: function(statusCode) {
        passedStatusCode = statusCode;
        return {
          json: function(responseBody) {
            returnedResponse = responseBody;
          },
        };
      },
    };

    beforeEach(function() {
      mockLogger.debug.resetHistory();
      applicationUserResponseBuilder.buildResponse(mockRequest, mockResponse);
    });

    it('passes status and response', function() {
      expect(passedStatusCode).to.be(201);
      expect(returnedResponse).to.be.eql({ metadata: { version: '1.0.0' },
        user: { id: 123456789, _rev: 'rev', applicationOwner: 'appOwner', username: 'username' } });
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql( { metadata: { version: '1.0.0' },
        user: { id: 123456789, _rev: 'rev', applicationOwner: 'appOwner', username: 'username' } } );
    });
  });
});
