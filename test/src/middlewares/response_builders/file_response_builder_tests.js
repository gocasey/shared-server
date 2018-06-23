const expect = require('expect.js');
const sinon = require('sinon');
const FileResponseBuilder = require('../../../../src/middlewares/response_builders/file_response_builder.js');

const mockLogger = {
  debug: sinon.stub(),
};

describe('FileResponseBuilder Tests', function() {
  let fileResponseBuilder = new FileResponseBuilder(mockLogger);

  describe('#buildSingleResponse', function() {
    let mockRequest = {};
    let passedStatusCode;
    let returnedResponse;
    let mockResponse = {
      file: {
        id: '123',
        filename: 'name',
        _rev: 'rev',
        size: 1234,
        updatedTime: '2018-04-09',
        createdTime: '2018-04-09',
        resource: 'remoteFileUri',
        owner: 'serverId',
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
      fileResponseBuilder.buildSingleResponse(mockRequest, mockResponse, 200);
    });

    it('returns status and response', function() {
      expect(passedStatusCode).to.be(200);
      expect(returnedResponse).to.be.eql({ metadata: { version: '1.0.0' },
        file: { id: '123', filename: 'name', _rev: 'rev', size: 1234,
                updatedTime: '2018-04-09', createdTime: '2018-04-09', resource: 'remoteFileUri', owner: 'serverId' } });
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql({ metadata: { version: '1.0.0' },
        file: { id: '123', filename: 'name', _rev: 'rev', size: 1234,
                updatedTime: '2018-04-09', createdTime: '2018-04-09', resource: 'remoteFileUri', owner: 'serverId' } });
    });
  });
});
