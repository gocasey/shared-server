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

  before(async () => {
    await dbCleanup();
    let mocks = {
      './utils/logger.js': function() {
        return mockLogger;
        },
    };
    let mockApp = proxyquire('../src/app.js', mocks);
    request = supertest(mockApp.listen());
  });

  describe('create admin user success', () => {
    let adminUserCreationResponse;

    it('returns admin user', async () => {
      adminUserCreationResponse = await request.post('/api/admin-user')
        .send({ username: 'adminUser', password: 'pass' })
        .expect(201);
      expect(adminUserCreationResponse.body.user.user.username).to.be('adminUser');
      expect(adminUserCreationResponse.body.user.token).to.be.ok();
    });

    describe('create server success', () => {
      let serverCreationResponse;

      it('returns server', async () => {
        let adminUserToken = adminUserCreationResponse.body.user.token.token;
        let authHeaderUser = util.format('Bearer %s', adminUserToken);
        serverCreationResponse = await request.post('/api/servers')
          .set('Authorization', authHeaderUser)
          .send({ name: 'appServer', url: 'serverUrl' })
          .expect(201);

        expect(serverCreationResponse.body.server.server.name).to.be('appServer');
        expect(serverCreationResponse.body.server.server.url).to.be('serverUrl');
        expect(serverCreationResponse.body.server.token).to.be.ok();
      });

      describe('retrieve single server success', () => {
        let serverFindResponse;

        it('returns server', async () => {
          let adminUserToken = adminUserCreationResponse.body.user.token.token;
          let serverId = serverCreationResponse.body.server.server.id;
          let authHeaderUser = util.format('Bearer %s', adminUserToken);
          let resourcePath = util.format('/api/servers/%s', serverId);
          serverFindResponse = await request.get(resourcePath)
            .set('Authorization', authHeaderUser)
            .expect(200);

          expect(serverFindResponse.body.server.server.name).to.be('appServer');
          expect(serverFindResponse.body.server.server.url).to.be('serverUrl');
          expect(serverFindResponse.body.server.server.lastConnection).to.be.empty();
          expect(serverFindResponse.body.server.token).to.be.ok();
        });
      });

      describe('retrieve all servers success', () => {
        let serverFindResponse;

        it('returns all servers', async () => {
          let adminUserToken = adminUserCreationResponse.body.user.token.token;
          let authHeaderUser = util.format('Bearer %s', adminUserToken);
          serverFindResponse = await request.get('/api/servers')
            .set('Authorization', authHeaderUser)
            .expect(200);

          expect(serverFindResponse.body.servers).to.be.an.array;
          expect(serverFindResponse.body.servers.length).to.be(1);
          expect(serverFindResponse.body.servers[0].lastConnection).to.be.empty();
          expect(serverFindResponse.body.servers[0].name).to.be('appServer');
          expect(serverFindResponse.body.servers[0].url).to.be('serverUrl');
        });
      });

      describe('create application user success', () => {
        let userCreationResponse;

        it('returns application user', async () => {
          let serverToken = serverCreationResponse.body.server.token.token;
          let authHeaderServer = util.format('Bearer %s', serverToken);
          userCreationResponse = await request.post('/api/user')
            .set('Authorization', authHeaderServer)
            .send({ username: 'appUser', password: 'pass', applicationOwner: 'appServer' })
            .expect(201);
          expect(userCreationResponse.body.user.username).to.be('appUser');
          expect(userCreationResponse.body.user.applicationOwner).to.be('appServer');
        });

        describe('create application user token success', async () => {
          let userTokenCreationResponse;

          it('returns application user token', async () => {
            let serverToken = serverCreationResponse.body.server.token.token;
            let authHeaderServer = util.format('Bearer %s', serverToken);
            userTokenCreationResponse = await request.post('/api/token')
              .set('Authorization', authHeaderServer)
              .send({ username: 'appUser', password: 'pass' })
              .expect(201);
            expect(userTokenCreationResponse.body.token.expiresAt).to.be.ok();
            expect(userTokenCreationResponse.body.token.token).to.be.ok();
          });

          describe('video upload success', async () => {
            let fileUploadResponse;

            it('returns file', async () => {
              let userToken = userTokenCreationResponse.body.token.token;
              let authHeaderUser = util.format('Bearer %s', userToken);
              fileUploadResponse = await request.post('/api/files/upload_multipart')
                .set('Authorization', authHeaderUser)
                .field('filename', 'upload.mp4')
                .attach('file', 'test/files/video.mp4')
                .expect(201);

              expect(fileUploadResponse.body.file.resource).to.be.ok();
              expect(fileUploadResponse.body.file.owner).to.be.empty;
            });
          });

          describe('image upload success', async () => {
            let fileUploadResponse;

            it('returns file', async () => {
              let userToken = userTokenCreationResponse.body.token.token;
              let authHeaderUser = util.format('Bearer %s', userToken);
              fileUploadResponse = await request.post('/api/files/upload_multipart')
                .set('Authorization', authHeaderUser)
                .field('filename', 'upload.jpg')
                .attach('file', 'test/files/image.jpg')
                .expect(201);

              expect(fileUploadResponse.body.file.resource).to.be.ok();
              expect(fileUploadResponse.body.file.owner).to.be.empty;
            });
          });
        });

        describe('retrieve single server success', async () => {
          let serverFindResponse;

          it('updates server last connection', async () => {
            let adminUserToken = adminUserCreationResponse.body.user.token.token;
            let serverId = serverCreationResponse.body.server.server.id;
            let authHeaderUser = util.format('Bearer %s', adminUserToken);
            let resourcePath = util.format('/api/servers/%s', serverId);
            serverFindResponse = await request.get(resourcePath)
              .set('Authorization', authHeaderUser)
              .expect(200);

            expect(serverFindResponse.body.server.server.name).to.be('appServer');
            expect(serverFindResponse.body.server.server.url).to.be('serverUrl');
            expect(serverFindResponse.body.server.token).to.be.ok();
            expect(serverFindResponse.body.server.server.lastConnection).to.not.be.empty();
          });
        });

        describe('retrieve all servers success', async () => {
          let serverFindResponse;

          it('updates server last connection', async () => {
            let adminUserToken = adminUserCreationResponse.body.user.token.token;
            let authHeaderUser = util.format('Bearer %s', adminUserToken);
            serverFindResponse = await request.get('/api/servers')
              .set('Authorization', authHeaderUser)
              .expect(200);

            expect(serverFindResponse.body.servers).to.be.an.array;
            expect(serverFindResponse.body.servers.length).to.be(1);
            expect(serverFindResponse.body.servers[0].name).to.be('appServer');
            expect(serverFindResponse.body.servers[0].url).to.be('serverUrl');
            expect(serverFindResponse.body.servers[0].lastConnection).to.not.be.empty();
          });
        });
      });
    });
  });
});
