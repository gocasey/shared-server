const util = require('util');
const supertest = require('supertest');
const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const dbCleanup = require('../config/db_cleanup.js');
let request;

describe('Integration Tests', () =>{
  let mockLogger = {
    debug: sinon.stub(),
    error: sinon.stub(),
    warn: sinon.stub(),
    info: sinon.stub(),
  };

  beforeEach(async () => {
    await dbCleanup();
    let mocks = {
      './utils/logger.js': function() {
        return mockLogger;
        },
    };
    let mockApp = proxyquire('../src/app.js', mocks);
    request = supertest(mockApp.listen());
  });

  it('Create admin user - Create server - Create user', async () => {
    let adminUserCreationResponse = await request.post('/api/admin-user')
      .send({ username: 'adminUser', password: 'pass' })
      .expect(201);
    expect(adminUserCreationResponse.body.user.user.username).to.be('adminUser');
    expect(adminUserCreationResponse.body.user.token).to.be.ok();

    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let authHeaderUser = util.format('Bearer %s', adminUserToken);
    let serverCreationResponse = await request.post('/api/servers')
      .set('Authorization', authHeaderUser)
      .send({ name: 'appServer' })
      .expect(201);

    expect(serverCreationResponse.body.server.server.name).to.be('appServer');
    expect(serverCreationResponse.body.server.token).to.be.ok();

    let serverToken = serverCreationResponse.body.server.token.token;
    let authHeaderServer = util.format('Bearer %s', serverToken);
    let userCreationResponse = await request.post('/api/user')
      .set('Authorization', authHeaderServer)
      .send({ username: 'appUser', password: 'pass', applicationOwner: 'appServer' })
      .expect(201);

    expect(userCreationResponse.body.user.username).to.be('appUser');
    expect(userCreationResponse.body.user.applicationOwner).to.be('appServer');
  });
});
