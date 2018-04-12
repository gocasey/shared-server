const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ConnectionPoolFactoryModule = '../../../../src/lib/factories/connection_pool_factory.js';

const mockLogger = {
  debug: sinon.stub(),
};

function setupConnectionPoolFactory() {
  let mockPool = sinon.stub();
  let mocks = {
    'pg': {
      Pool: function() {
        return mockPool;
      },
    },
  };
  let ConnectionPoolFactory = proxyquire(ConnectionPoolFactoryModule, mocks);
  return new ConnectionPoolFactory(mockLogger);
}

describe('ConnectionPoolFactory Tests', function() {
  let connectionPoolFactory;

  before(function() {
    connectionPoolFactory = setupConnectionPoolFactory();
  });

  describe('#createPool', function() {
    it('returns pool', function(done) {
      let pool = connectionPoolFactory.createPool();
      expect(pool).to.be.ok();
      done();
    });
  });
});
