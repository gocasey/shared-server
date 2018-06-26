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
      adminUserCreationResponse = await request.post('/api/admin_user')
        .send({ username: 'adminUser', password: 'pass' })
        .expect(201);
      expect(adminUserCreationResponse.body.user.user.username).to.be('adminUser');
      expect(adminUserCreationResponse.body.user.token).to.be.ok();
    });

    describe('retrieve admin user token', () => {
      let adminTokenCreationResponse;

      it('returns application user token', async () => {
        adminTokenCreationResponse = await request.post('/api/admin_token')
          .send({ username: 'adminUser', password: 'pass' })
          .expect(201);
        expect(adminTokenCreationResponse.body.token.expiresAt).to.be.ok();
        expect(adminTokenCreationResponse.body.token.token).to.be.ok();
      });
    });

    describe('create server with admin user token', () => {
      let serverCreationResponse;

      it('returns server', async () => {
        let adminUserToken = adminUserCreationResponse.body.user.token.token;
        let authHeaderUser = util.format('Bearer %s', adminUserToken);
        serverCreationResponse = await request.post('/api/servers')
          .set('Authorization', authHeaderUser)
          .send({ name: 'appServer', url: 'https://app-server-stories.herokuapp.com' })
          .expect(201);

        expect(serverCreationResponse.body.server.server.name).to.be('appServer');
        expect(serverCreationResponse.body.server.server.url).to.be('https://app-server-stories.herokuapp.com');
        expect(serverCreationResponse.body.server.token).to.be.ok();
      });

      describe('retrieve single server with admin user token', () => {
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
          expect(serverFindResponse.body.server.server.url).to.be('https://app-server-stories.herokuapp.com');
          expect(serverFindResponse.body.server.server.createdBy).to.be(adminUserCreationResponse.body.user.user.id);
          expect(serverFindResponse.body.server.server.lastConnection).to.be.empty();
          expect(serverFindResponse.body.server.token).to.be.ok();
        });
      });

      describe('retrieve all servers with admin user token', () => {
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
          expect(serverFindResponse.body.servers[0].url).to.be('https://app-server-stories.herokuapp.com');
          expect(serverFindResponse.body.servers[0].createdBy).to.be(adminUserCreationResponse.body.user.user.id);
        });
      });

      describe('update server with admin user token', () => {
        let serverUpdateResponse;

        it('returns server', async () => {
          let adminUserToken = adminUserCreationResponse.body.user.token.token;
          let serverId = serverCreationResponse.body.server.server.id;
          let authHeaderUser = util.format('Bearer %s', adminUserToken);
          let resourcePath = util.format('/api/servers/%s', serverId);
          let updatedServer = serverCreationResponse.body.server.server;
          updatedServer.url = 'https://app-server-stories.herokuapp.com';
          serverUpdateResponse = await request.put(resourcePath)
            .set('Authorization', authHeaderUser)
            .send(updatedServer)
            .expect(200);

          expect(serverUpdateResponse.body.server.server.name).to.be('appServer');
          expect(serverUpdateResponse.body.server.server.url).to.be('https://app-server-stories.herokuapp.com');
          expect(serverUpdateResponse.body.server.server.createdBy).to.be(adminUserCreationResponse.body.user.user.id);
          expect(serverUpdateResponse.body.server.server.lastConnection).to.be.empty();
          expect(serverUpdateResponse.body.server.token).to.be.ok();
        });
      });

      describe('create application user with server token', () => {
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

        describe('create application user token with server token', async () => {
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

          describe('token check with application user token', async () => {
            let tokenCheckResponse;

            it('returns token', async () => {
              let serverToken = serverCreationResponse.body.server.token.token;
              let authHeaderServer = util.format('Bearer %s', serverToken);
              tokenCheckResponse = await request.post('/api/token_check')
                .set('Authorization', authHeaderServer)
                .send({ token: userTokenCreationResponse.body.token.token })
                .expect(200);

              expect(tokenCheckResponse.body.token.expiresAt).to.be.ok();
              expect(tokenCheckResponse.body.token.token).to.be.ok();
            });
          });

          describe('token check with server token', async () => {
            let tokenCheckResponse;

            it('returns unauthorized', async () => {
              let serverToken = serverCreationResponse.body.server.token.token;
              let authHeaderServer = util.format('Bearer %s', serverToken);
              tokenCheckResponse = await request.post('/api/token_check')
                .set('Authorization', authHeaderServer)
                .send({ token: serverToken })
                .expect(401);

              expect(tokenCheckResponse.body.code).to.be(401);
              expect(tokenCheckResponse.body.message).to.be('Unauthorized');
            });
          });

          describe('video upload with application user token', async () => {
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

            describe('set file ownership with server token', async () => {
              let filePostResponse;

              it('returns file', async () => {
                let serverToken = serverCreationResponse.body.server.token.token;
                let authHeaderServer = util.format('Bearer %s', serverToken);
                filePostResponse = await request.post('/api/files')
                  .set('Authorization', authHeaderServer)
                  .send(fileUploadResponse.body.file)
                  .expect(200);

                expect(filePostResponse.body.file.resource).to.be.ok();
                expect(filePostResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
              });

              describe('retrieve file with server token', async () => {
                let fileFindResponse;

                it('returns file', async () => {
                  let serverToken = serverCreationResponse.body.server.token.token;
                  let authHeaderServer = util.format('Bearer %s', serverToken);
                  let resourcePath = util.format('/api/files/%s', fileUploadResponse.body.file.id);
                  fileFindResponse = await request.get(resourcePath)
                    .set('Authorization', authHeaderServer)
                    .expect(200);

                  expect(fileFindResponse.body.file.id).to.be(fileUploadResponse.body.file.id);
                  expect(fileFindResponse.body.file.resource).to.be.ok();
                  expect(fileFindResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
                });
              });

              describe('retrieve file with application user token', async () => {
                let fileFindResponse;

                it('returns unauthorized', async () => {
                  let userToken = userTokenCreationResponse.body.token.token;
                  let authHeaderUser = util.format('Bearer %s', userToken);
                  let resourcePath = util.format('/api/files/%s', fileUploadResponse.body.file.id);
                  fileFindResponse = await request.get(resourcePath)
                    .set('Authorization', authHeaderUser)
                    .expect(401);

                  expect(fileFindResponse.body.code).to.be(401);
                  expect(fileFindResponse.body.message).to.be('Unauthorized');
                });
              });

              describe('update file with server token', async () => {
                let fileUpdateResponse;

                it('returns file', async () => {
                  let serverToken = serverCreationResponse.body.server.token.token;
                  let authHeaderServer = util.format('Bearer %s', serverToken);
                  let resourcePath = util.format('/api/files/%s', filePostResponse.body.file.id);
                  let updatedFile = filePostResponse.body.file;
                  updatedFile.filename = 'newfilename';

                  fileUpdateResponse = await request.put(resourcePath)
                    .set('Authorization', authHeaderServer)
                    .send(updatedFile)
                    .expect(200);

                  expect(fileUpdateResponse.body.file.id).to.be(fileUploadResponse.body.file.id);
                  expect(fileUpdateResponse.body.file.resource).to.be.ok();
                  expect(fileUpdateResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
                  expect(fileUpdateResponse.body.file.filename).to.be('newfilename');
                });
              });

              describe('update file with application user token', async () => {
                let fileUpdateResponse;

                it('returns unauthorized', async () => {
                  let userToken = userTokenCreationResponse.body.token.token;
                  let authHeaderUser = util.format('Bearer %s', userToken);
                  let resourcePath = util.format('/api/files/%s', filePostResponse.body.file.id);
                  let updatedFile = filePostResponse.body.file;
                  updatedFile.filename = 'newfilename';

                  fileUpdateResponse = await request.put(resourcePath)
                    .set('Authorization', authHeaderUser)
                    .send(updatedFile)
                    .expect(401);

                  expect(fileUpdateResponse.body.code).to.be(401);
                  expect(fileUpdateResponse.body.message).to.be('Unauthorized');
                });
              });
            });
          });

          describe('image upload with application user token', async () => {
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

            describe('set file ownership with server token', async () => {
              let filePostResponse;

              it('returns file', async () => {
                let serverToken = serverCreationResponse.body.server.token.token;
                let authHeaderServer = util.format('Bearer %s', serverToken);
                filePostResponse = await request.post('/api/files')
                  .set('Authorization', authHeaderServer)
                  .send(fileUploadResponse.body.file)
                  .expect(200);

                expect(filePostResponse.body.file.resource).to.be.ok();
                expect(filePostResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
              });

              describe('retrieve file with server token', async () => {
                let fileFindResponse;

                it('returns file', async () => {
                  let serverToken = serverCreationResponse.body.server.token.token;
                  let authHeaderServer = util.format('Bearer %s', serverToken);
                  let resourcePath = util.format('/api/files/%s', fileUploadResponse.body.file.id);
                  fileFindResponse = await request.get(resourcePath)
                    .set('Authorization', authHeaderServer)
                    .expect(200);

                  expect(fileFindResponse.body.file.id).to.be(fileUploadResponse.body.file.id);
                  expect(fileFindResponse.body.file.resource).to.be.ok();
                  expect(fileFindResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
                });
              });

              describe('retrieve all files with server token', async () => {
                let fileFindResponse;

                it('returns all files', async () => {
                  let serverToken = serverCreationResponse.body.server.token.token;
                  let authHeaderServer = util.format('Bearer %s', serverToken);
                  fileFindResponse = await request.get('/api/files')
                    .set('Authorization', authHeaderServer)
                    .expect(200);

                  expect(fileFindResponse.body.files).to.be.an.array;
                  expect(fileFindResponse.body.files.length).to.be(2);
                  expect(fileFindResponse.body.files[0].resource).to.be.ok();
                  expect(fileFindResponse.body.files[0].owner).to.be(serverCreationResponse.body.server.server.id);
                  expect(fileFindResponse.body.files[1].resource).to.be.ok();
                  expect(fileFindResponse.body.files[1].owner).to.be(serverCreationResponse.body.server.server.id);
                });
              });

              describe('update file with server token', async () => {
                let fileUpdateResponse;

                it('returns file', async () => {
                  let serverToken = serverCreationResponse.body.server.token.token;
                  let authHeaderServer = util.format('Bearer %s', serverToken);
                  let resourcePath = util.format('/api/files/%s', filePostResponse.body.file.id);
                  let updatedFile = filePostResponse.body.file;
                  updatedFile.filename = 'newfilename';

                  fileUpdateResponse = await request.put(resourcePath)
                    .set('Authorization', authHeaderServer)
                    .send(updatedFile)
                    .expect(200);

                  expect(fileUpdateResponse.body.file.id).to.be(fileUploadResponse.body.file.id);
                  expect(fileUpdateResponse.body.file.resource).to.be.ok();
                  expect(fileUpdateResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
                  expect(fileUpdateResponse.body.file.filename).to.be('newfilename');
                });
              });
            });
          });

          describe('retrieve single server with application user token', async () => {
            let serverFindResponse;

            it('returns unauthorized', async () => {
              let userToken = userTokenCreationResponse.body.token.token;
              let authHeaderUser = util.format('Bearer %s', userToken);
              let serverId = serverCreationResponse.body.server.server.id;
              let resourcePath = util.format('/api/servers/%s', serverId);
              serverFindResponse = await request.get(resourcePath)
                .set('Authorization', authHeaderUser)
                .expect(401);

              expect(serverFindResponse.body.code).to.be(401);
              expect(serverFindResponse.body.message).to.be('Unauthorized');
            });
          });

          describe('retrieve all servers with application user token', async () => {
            let serverFindResponse;

            it('returns unauthorized', async () => {
              let userToken = userTokenCreationResponse.body.token.token;
              let authHeaderUser = util.format('Bearer %s', userToken);
              serverFindResponse = await request.get('/api/servers')
                .set('Authorization', authHeaderUser)
                .expect(401);

              expect(serverFindResponse.body.code).to.be(401);
              expect(serverFindResponse.body.message).to.be('Unauthorized');
            });
          });

          describe('update server with application user token', async () => {
            let serverUpdateResponse;

            it('returns unauthorized', async () => {
              let userToken = userTokenCreationResponse.body.token.token;
              let authHeaderUser = util.format('Bearer %s', userToken);
              let serverId = serverCreationResponse.body.server.server.id;
              let resourcePath = util.format('/api/servers/%s', serverId);
              let updatedServer = serverCreationResponse.body.server.server;
              updatedServer.url = 'https://app-server-stories.herokuapp.com';
              serverUpdateResponse = await request.put(resourcePath)
                .set('Authorization', authHeaderUser)
                .send(updatedServer)
                .expect(401);

              expect(serverUpdateResponse.body.code).to.be(401);
              expect(serverUpdateResponse.body.message).to.be('Unauthorized');
            });
          });

          describe('update server token with application user token', async () => {
            let serverPostResponse;

            it('returns unauthorized', async () => {
              let userToken = userTokenCreationResponse.body.token.token;
              let authHeaderUser = util.format('Bearer %s', userToken);
              let serverId = serverCreationResponse.body.server.server.id;
              let resourcePath = util.format('/api/servers/%s', serverId);
              let updatedServer = serverCreationResponse.body.server.server;
              serverPostResponse = await request.post(resourcePath)
                .set('Authorization', authHeaderUser)
                .send(updatedServer)
                .expect(401);

              expect(serverPostResponse.body.code).to.be(401);
              expect(serverPostResponse.body.message).to.be('Unauthorized');
            });
          });
        });

        describe('retrieve single server with admin user token', async () => {
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
            expect(serverFindResponse.body.server.token).to.be.ok();
            expect(serverFindResponse.body.server.server.lastConnection).to.not.be.empty();
            expect(serverFindResponse.body.server.server.createdBy).to.be(adminUserCreationResponse.body.user.user.id);
          });
        });

        describe('retrieve all servers with admin user token', async () => {
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
            expect(serverFindResponse.body.servers[0].lastConnection).to.not.be.empty();
            expect(serverFindResponse.body.servers[0].createdBy).to.be(adminUserCreationResponse.body.user.user.id);
          });
        });

        describe('retrieve user stats with admin user token', async () => {
          let userStatsResponse;

          it('returns user stats', async () => {
            let adminUserToken = adminUserCreationResponse.body.user.token.token;
            let authHeaderUser = util.format('Bearer %s', adminUserToken);
            userStatsResponse = await request.get('/api/stats/users')
              .set('Authorization', authHeaderUser)
              .expect(200);

            expect(userStatsResponse.body.servers_stats).to.be.an.array;
            expect(userStatsResponse.body.servers_stats.length).to.be(1);
            expect(userStatsResponse.body.servers_stats[0].id).to.be(serverCreationResponse.body.server.server.id);
            expect(userStatsResponse.body.servers_stats[0].total_users).to.be('1');
            expect(userStatsResponse.body.servers_stats[0].active_users).to.be('1');
          });
        });

        describe('retrieve stories stats with admin user token', async () => {
          let storiesStatsResponse;

          it('returns stories stats', async () => {
            let adminUserToken = adminUserCreationResponse.body.user.token.token;
            let authHeaderUser = util.format('Bearer %s', adminUserToken);
            storiesStatsResponse = await request.get('/api/stats/stories')
              .set('Authorization', authHeaderUser)
              .expect(200);

            expect(storiesStatsResponse.body.servers_stats).to.be.an.array;
          });
        });

        describe('retrieve requests stats with admin user token', async () => {
          let requestsStatsResponse;

          it('returns requests stats', async () => {
            let adminUserToken = adminUserCreationResponse.body.user.token.token;
            let authHeaderUser = util.format('Bearer %s', adminUserToken);
            requestsStatsResponse = await request.get('/api/stats/requests?minutes=45')
              .set('Authorization', authHeaderUser)
              .expect(200);

            expect(requestsStatsResponse.body.servers_stats).to.be.an.array;
          });
        });
      });
    });
  });
});
