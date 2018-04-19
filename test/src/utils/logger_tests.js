const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const LoggerModule = '../../../src/utils/logger.js';

const mockWinstonLogger = {
  error: sinon.stub(),
  info: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub(),
};

function setupLogger() {
  const mockWinston = {
    Logger: function() {
      return mockWinstonLogger;
    },
  };
  const Logger = proxyquire(LoggerModule, { 'winston': mockWinston });
  return new Logger();
}

describe('Logger tests', function() {
  let mockLogger;

  before(function() {
    mockLogger = setupLogger();
  });

  describe('#error', function() {
    beforeEach(function() {
      mockWinstonLogger.error.resetHistory();
      mockLogger.error('Error: %s', 'param1');
    });

    it('passes params to winston', function(done) {
      expect(mockWinstonLogger.error.calledOnce);
      expect(mockWinstonLogger.error.getCall(0).args[0]).to.be('Error: %s');
      expect(mockWinstonLogger.error.getCall(0).args[1]).to.be('param1');
      done();
    });
  });

  describe('#debug', function() {
    beforeEach(function() {
      mockWinstonLogger.debug.resetHistory();
      mockLogger.debug('Debug: %s', 'param1');
    });

    it('passes params to winston', function(done) {
      expect(mockWinstonLogger.debug.calledOnce);
      expect(mockWinstonLogger.debug.getCall(0).args[0]).to.be('Debug: %s');
      expect(mockWinstonLogger.debug.getCall(0).args[1]).to.be('param1');
      done();
    });
  });


  describe('#warn', function() {
    beforeEach(function() {
      mockWinstonLogger.warn.resetHistory();
      mockLogger.warn('Warn: %s', 'param1');
    });

    it('passes params to winston', function(done) {
      expect(mockWinstonLogger.warn.calledOnce);
      expect(mockWinstonLogger.warn.getCall(0).args[0]).to.be('Warn: %s');
      expect(mockWinstonLogger.warn.getCall(0).args[1]).to.be('param1');
      done();
    });
  });

  describe('#info', function() {
    beforeEach(function() {
      mockWinstonLogger.info.resetHistory();
      mockLogger.info('Info: %s', 'param1');
    });

    it('passes params to winston', function(done) {
      expect(mockWinstonLogger.info.calledOnce);
      expect(mockWinstonLogger.info.getCall(0).args[0]).to.be('Info: %s');
      expect(mockWinstonLogger.info.getCall(0).args[1]).to.be('param1');
      done();
    });
  });
});
