const util = require('util');
const supertest = require('supertest');
const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const dbCleanup = require('../config/db_cleanup.js');
let request;

describe.skip('Integration Tests', () =>{
  let mockLogger = {
    debug: sinon.stub(),
    error: sinon.stub(),
    warn: sinon.stub(),
    info: sinon.stub(),
  };

  before(async () => {
    let mocks = {
      './utils/logger.js': function() {
        return mockLogger;
      },
    };
    let mockApp = proxyquire('../src/app.js', mocks);
    request = supertest(mockApp.listen());
  });

  beforeEach(async () => {
    await dbCleanup();
  });

  async function createAdminUser(username, pass) {
    let adminUserCreationResponse = await request.post('/api/admin_user')
        .send({ username: username, password: pass })
        .expect(201);
    return adminUserCreationResponse;
  }

  async function getAdminUserToken(username, pass) {
    let adminTokenCreationResponse = await request.post('/api/admin_token')
      .send({ username: username, password: pass })
      .expect(201);
    return adminTokenCreationResponse;
  }

  async function getUserStats(authToken, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let userStatsResponse = await request.get('/api/stats/users')
      .set('Authorization', authHeader)
      .expect(statusCode);
    return userStatsResponse;
  }

  async function createServer(authToken, name, url) {
    let authHeader = util.format('Bearer %s', authToken);
    let serverCreationResponse = await request.post('/api/servers')
      .set('Authorization', authHeader)
      .send({ name: name, url: url })
      .expect(201);
    return serverCreationResponse;
  }

  async function getServer(authToken, serverId, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let resourcePath = util.format('/api/servers/%s', serverId);
    let serverFindResponse = await request.get(resourcePath)
      .set('Authorization', authHeader)
      .expect(statusCode);
    return serverFindResponse;
  }

  async function getAllServers(authToken, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let serverFindResponse = await request.get('/api/servers')
      .set('Authorization', authHeader)
      .expect(statusCode);
    return serverFindResponse;
  }

  async function getFiles(authToken, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let fileFindResponse = await request.get('/api/files')
      .set('Authorization', authHeader)
      .expect(statusCode);
    return fileFindResponse;
  }

  async function updateServer(authToken, serverId, updatedServer, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let resourcePath = util.format('/api/servers/%s', serverId);
    let serverFindResponse = await request.put(resourcePath)
      .set('Authorization', authHeader)
      .send(updatedServer)
      .expect(statusCode);
    return serverFindResponse;
  }

  async function updateServerToken(authToken, serverId, updatedServer, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let resourcePath = util.format('/api/servers/%s', serverId);
    let serverPostResponse = await request.post(resourcePath)
      .set('Authorization', authHeader)
      .send(updatedServer)
      .expect(statusCode);
    return serverPostResponse;
  }

  async function deleteServer(authToken, serverId) {
    let authHeaderUser = util.format('Bearer %s', authToken);
    let resourcePath = util.format('/api/servers/%s', serverId);
    await request.delete(resourcePath)
      .set('Authorization', authHeaderUser)
      .expect(204);
  }

  async function createApplicationUser(authToken, username, password, applicationOwner) {
    let authHeader = util.format('Bearer %s', authToken);
    let userCreationResponse = await request.post('/api/user')
      .set('Authorization', authHeader)
      .send({ username: username, password: password, applicationOwner: applicationOwner })
      .expect(201);
    return userCreationResponse;
  }

  async function createApplicationUserToken(authToken, username, password) {
    let authHeader = util.format('Bearer %s', authToken);
    let userTokenCreationResponse = await request.post('/api/token')
      .set('Authorization', authHeader)
      .send({ username: username, password: password })
      .expect(201);
    return userTokenCreationResponse;
  }

  async function validateUserToken(authToken, token, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let tokenCheckResponse = await request.post('/api/token_check')
      .set('Authorization', authHeader)
      .send({ token: token })
      .expect(statusCode);
    return tokenCheckResponse;
  }

  async function uploadFile(authToken, filename, filepath) {
    let authHeader = util.format('Bearer %s', authToken);
    let fileUploadResponse = await request.post('/api/files/upload_multipart')
      .set('Authorization', authHeader)
      .field('filename', filename)
      .attach('file', filepath)
      .expect(201);
    return fileUploadResponse;
  }

  async function getFile(authToken, fileId, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let resourcePath = util.format('/api/files/%s', fileId);
    let fileFindResponse = await request.get(resourcePath)
      .set('Authorization', authHeader)
      .expect(statusCode);
    return fileFindResponse;
  }

  async function setFileOwnership(authToken, fileData) {
    let authHeader = util.format('Bearer %s', authToken);
    let filePostResponse = await request.post('/api/files')
      .set('Authorization', authHeader)
      .send(fileData)
      .expect(200);
    return filePostResponse;
  }

  async function updateFile(authToken, fileId, updatedFile, statusCode) {
    let authHeader = util.format('Bearer %s', authToken);
    let resourcePath = util.format('/api/files/%s', fileId);
    let fileUpdateResponse = await request.put(resourcePath)
      .set('Authorization', authHeader)
      .send(updatedFile)
      .expect(statusCode);
    return fileUpdateResponse;
  }

  async function deleteFile(authToken, fileId) {
    let authHeaderServer = util.format('Bearer %s', authToken);
    let resourcePath = util.format('/api/files/%s', fileId);
    await request.delete(resourcePath)
      .set('Authorization', authHeaderServer)
      .expect(204);
  }

  async function getUserStats(authToken) {
    let authHeaderUser = util.format('Bearer %s', authToken);
    let userStatsResponse = await request.get('/api/stats/users')
      .set('Authorization', authHeaderUser)
      .expect(200);
    return userStatsResponse;
  }

  async function getStoriesStats(authToken) {
    let authHeaderUser = util.format('Bearer %s', authToken);
    let storiesStatsResponse = await request.get('/api/stats/stories')
      .set('Authorization', authHeaderUser)
      .expect(200);
    return storiesStatsResponse;
  }

  async function getRequestsStats(authToken) {
    let authHeaderUser = util.format('Bearer %s', authToken);
    let requestsStatsResponse = await request.get('/api/stats/requests?minutes=45')
      .set('Authorization', authHeaderUser)
      .expect(200);
    return requestsStatsResponse;
  }

  it('create admin user success', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    expect(adminUserCreationResponse.body.user.user.username).to.be('adminuser');
    expect(adminUserCreationResponse.body.user.token).to.be.ok();
  });

  it('retrieve admin user token', async () => {
    await createAdminUser('adminuser', 'pass');
    let adminTokenCreationResponse = await getAdminUserToken('adminuser', 'pass');
    expect(adminTokenCreationResponse.body.token.expiresAt).to.be.ok();
    expect(adminTokenCreationResponse.body.token.token).to.be.ok();
  });

  it('create server with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    expect(serverCreationResponse.body.server.server.name).to.be('appServer');
    expect(serverCreationResponse.body.server.server.url).to.be('https://app-server-stories.herokuapp.com');
    expect(serverCreationResponse.body.server.token).to.be.ok();
  });

  it('retrieve single server with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverId = serverCreationResponse.body.server.server.id;
    let serverFindResponse = await getServer(adminUserToken, serverId, 200);
    expect(serverFindResponse.body.server.server.name).to.be('appServer');
    expect(serverFindResponse.body.server.server.url).to.be('https://app-server-stories.herokuapp.com');
    expect(serverFindResponse.body.server.server.createdBy).to.be(adminUserCreationResponse.body.user.user.id);
    expect(serverFindResponse.body.server.server.lastConnection).to.be.empty();
    expect(serverFindResponse.body.server.token).to.be.ok();
  });

  it('retrieve single server with admin user token after token usage', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let serverId = serverCreationResponse.body.server.server.id;
    let serverFindResponse = await getServer(adminUserToken, serverId, 200);
    expect(serverFindResponse.body.server.server.name).to.be('appServer');
    expect(serverFindResponse.body.server.server.url).to.be('https://app-server-stories.herokuapp.com');
    expect(serverFindResponse.body.server.server.createdBy).to.be(adminUserCreationResponse.body.user.user.id);
    expect(serverFindResponse.body.server.server.lastConnection).to.not.be.empty();
    expect(serverFindResponse.body.server.token).to.be.ok();
  });

  it('retrieve single server with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let serverFindResponse = await getServer(userToken, serverCreationResponse.body.server.server.id, 401);
    expect(serverFindResponse.body.code).to.be(401);
    expect(serverFindResponse.body.message).to.be('Unauthorized');
  });

  it('retrieve all servers with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverFindResponse = await getAllServers(adminUserToken, 200);
    expect(serverFindResponse.body.servers).to.be.an.array;
    expect(serverFindResponse.body.servers.length).to.be(1);
    expect(serverFindResponse.body.servers[0].lastConnection).to.be.empty();
    expect(serverFindResponse.body.servers[0].name).to.be('appServer');
    expect(serverFindResponse.body.servers[0].url).to.be('https://app-server-stories.herokuapp.com');
    expect(serverFindResponse.body.servers[0].createdBy).to.be(adminUserCreationResponse.body.user.user.id);
  });

  it('retrieve all servers with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let serverFindResponse = await getAllServers(userToken, 401);
    expect(serverFindResponse.body.code).to.be(401);
    expect(serverFindResponse.body.message).to.be('Unauthorized');
  });

  it('update server with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverId = serverCreationResponse.body.server.server.id;
    let updatedServer = serverCreationResponse.body.server.server;
    updatedServer.url = 'newUrl';
    let serverUpdateResponse = await updateServer(adminUserToken, serverId, updatedServer, 200);
    expect(serverUpdateResponse.body.server.server.name).to.be('appServer');
    expect(serverUpdateResponse.body.server.server.url).to.be('newUrl');
    expect(serverUpdateResponse.body.server.server.createdBy).to.be(adminUserCreationResponse.body.user.user.id);
    expect(serverUpdateResponse.body.server.server.lastConnection).to.be.empty();
    expect(serverUpdateResponse.body.server.token).to.be.ok();
  });

  it('update server with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let serverId = serverCreationResponse.body.server.server.id;
    let updatedServer = serverCreationResponse.body.server.server;
    updatedServer.url = 'newUrl';
    let serverUpdateResponse = await updateServer(userToken, serverId, updatedServer, 401);
    expect(serverUpdateResponse.body.code).to.be(401);
    expect(serverUpdateResponse.body.message).to.be('Unauthorized');
  });

  it('update server token with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let serverId = serverCreationResponse.body.server.server.id;
    let updatedServer = serverCreationResponse.body.server.server;
    updatedServer.url = 'newUrl';
    let serverUpdateResponse = await updateServerToken(userToken, serverId, updatedServer, 401);
    expect(serverUpdateResponse.body.code).to.be(401);
    expect(serverUpdateResponse.body.message).to.be('Unauthorized');
  });

  it('create application user with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    let userCreationResponse = await createApplicationUser(serverToken, 'appUser', 'pass', 'appServer');
    expect(userCreationResponse.body.user.username).to.be('appUser');
    expect(userCreationResponse.body.user.applicationOwner).to.be('appServer');
  });

  it('create application user token with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    expect(userTokenCreationResponse.body.token.expiresAt).to.be.ok();
    expect(userTokenCreationResponse.body.token.token).to.be.ok();
  });

  it('token check with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let tokenCheckResponse = await validateUserToken(serverToken, userTokenCreationResponse.body.token.token, 200);
    expect(tokenCheckResponse.body.token.expiresAt).to.be.ok();
    expect(tokenCheckResponse.body.token.token).to.be.ok();
  });

  it('token check with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    let tokenCheckResponse = await validateUserToken(serverToken, serverToken, 401);
    expect(tokenCheckResponse.body.code).to.be(401);
    expect(tokenCheckResponse.body.message).to.be('Unauthorized');
  });

  it('video upload with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    expect(fileUploadResponse.body.file.resource).to.be.ok();
    expect(fileUploadResponse.body.file.owner).to.be.empty;
  });

  it('set video ownership with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    expect(filePostResponse.body.file.resource).to.be.ok();
    expect(filePostResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
  });

  it('retrieve video with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    await setFileOwnership(serverToken, fileUploadResponse.body.file);
    let fileFindResponse = await getFile(serverToken, fileUploadResponse.body.file.id, 200);
    expect(fileFindResponse.body.file.id).to.be(fileUploadResponse.body.file.id);
    expect(fileFindResponse.body.file.resource).to.be.ok();
    expect(fileFindResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
  });

  it('retrieve video with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    await setFileOwnership(serverToken, fileUploadResponse.body.file);
    let fileFindResponse = await getFile(userToken, fileUploadResponse.body.file.id, 401);
    expect(fileFindResponse.body.code).to.be(401);
    expect(fileFindResponse.body.message).to.be('Unauthorized');
  });

  it('update video with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    let updatedFile = filePostResponse.body.file;
    updatedFile.filename = 'newfilename';
    let fileUpdateResponse = await updateFile(serverToken, filePostResponse.body.file.id, updatedFile, 200);
    expect(fileUpdateResponse.body.file.id).to.be(fileUploadResponse.body.file.id);
    expect(fileUpdateResponse.body.file.resource).to.be.ok();
    expect(fileUpdateResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
    expect(fileUpdateResponse.body.file.filename).to.be('newfilename');
  });

  it('update video with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    let updatedFile = filePostResponse.body.file;
    updatedFile.filename = 'newfilename';
    let fileUpdateResponse = await updateFile(userToken, filePostResponse.body.file.id, updatedFile, 401);
    expect(fileUpdateResponse.body.code).to.be(401);
    expect(fileUpdateResponse.body.message).to.be('Unauthorized');
  });

  it('delete video with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    await deleteFile(serverToken, filePostResponse.body.file.id);
  });

  it('retrieve deleted video with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    await deleteFile(serverToken, filePostResponse.body.file.id);
    let fileFindResponse = await getFile(serverToken, filePostResponse.body.file.id, 404);
    expect(fileFindResponse.body.code).to.be(404);
    expect(fileFindResponse.body.message).to.be('File does not exist');
  });

  it('image upload with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    expect(fileUploadResponse.body.file.resource).to.be.ok();
    expect(fileUploadResponse.body.file.owner).to.be.empty;
  });

  it('set image ownership with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    expect(filePostResponse.body.file.resource).to.be.ok();
    expect(filePostResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
  });

  it('retrieve image with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    await setFileOwnership(serverToken, fileUploadResponse.body.file);
    let fileFindResponse = await getFile(serverToken, fileUploadResponse.body.file.id, 200);
    expect(fileFindResponse.body.file.id).to.be(fileUploadResponse.body.file.id);
    expect(fileFindResponse.body.file.resource).to.be.ok();
    expect(fileFindResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
  });

  it('retrieve image with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    await setFileOwnership(serverToken, fileUploadResponse.body.file);
    let fileFindResponse = await getFile(userToken, fileUploadResponse.body.file.id, 401);
    expect(fileFindResponse.body.code).to.be(401);
    expect(fileFindResponse.body.message).to.be('Unauthorized');
  });

  it('update image with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    let updatedFile = filePostResponse.body.file;
    updatedFile.filename = 'newfilename';
    let fileUpdateResponse = await updateFile(serverToken, filePostResponse.body.file.id, updatedFile, 200);
    expect(fileUpdateResponse.body.file.id).to.be(fileUploadResponse.body.file.id);
    expect(fileUpdateResponse.body.file.resource).to.be.ok();
    expect(fileUpdateResponse.body.file.owner).to.be(serverCreationResponse.body.server.server.id);
    expect(fileUpdateResponse.body.file.filename).to.be('newfilename');
  });

  it('update image with application user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    let updatedFile = filePostResponse.body.file;
    updatedFile.filename = 'newfilename';
    let fileUpdateResponse = await updateFile(userToken, filePostResponse.body.file.id, updatedFile, 401);
    expect(fileUpdateResponse.body.code).to.be(401);
    expect(fileUpdateResponse.body.message).to.be('Unauthorized');
  });

  it('delete image with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    await deleteFile(serverToken, filePostResponse.body.file.id);
  });

  it('retrieve deleted image with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    let filePostResponse = await setFileOwnership(serverToken, fileUploadResponse.body.file);
    await deleteFile(serverToken, filePostResponse.body.file.id);
    let fileFindResponse = await getFile(serverToken, filePostResponse.body.file.id, 404);
    expect(fileFindResponse.body.code).to.be(404);
    expect(fileFindResponse.body.message).to.be('File does not exist');
  });

  it('retrieve all files with server token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse1 = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    await setFileOwnership(serverToken, fileUploadResponse1.body.file);
    let fileUploadResponse2 = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    await setFileOwnership(serverToken, fileUploadResponse2.body.file);
    let fileFindResponse = await getFiles(serverToken, 200);
    expect(fileFindResponse.body.files).to.be.an.array;
    expect(fileFindResponse.body.files.length).to.be(2);
    expect(fileFindResponse.body.files[0].resource).to.be.ok();
    expect(fileFindResponse.body.files[0].owner).to.be(serverCreationResponse.body.server.server.id);
    expect(fileFindResponse.body.files[1].resource).to.be.ok();
    expect(fileFindResponse.body.files[1].owner).to.be(serverCreationResponse.body.server.server.id);
  });


  it('retrieve all files with server token after image delete', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse1 = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    await setFileOwnership(serverToken, fileUploadResponse1.body.file);
    let fileUploadResponse2 = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    await setFileOwnership(serverToken, fileUploadResponse2.body.file);
    await deleteFile(serverToken, fileUploadResponse1.body.file.id);
    let fileFindResponse = await getFiles(serverToken, 200);
    expect(fileFindResponse.body.files).to.be.an.array;
    expect(fileFindResponse.body.files.length).to.be(1);
    expect(fileFindResponse.body.files[0].resource).to.be.ok();
    expect(fileFindResponse.body.files[0].owner).to.be(serverCreationResponse.body.server.server.id);
  });

  it('retrieve all files with server token after video delete', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse1 = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    await setFileOwnership(serverToken, fileUploadResponse1.body.file);
    let fileUploadResponse2 = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    await setFileOwnership(serverToken, fileUploadResponse2.body.file);
    await deleteFile(serverToken, fileUploadResponse2.body.file.id);
    let fileFindResponse = await getFiles(serverToken, 200);
    expect(fileFindResponse.body.files).to.be.an.array;
    expect(fileFindResponse.body.files.length).to.be(1);
    expect(fileFindResponse.body.files[0].resource).to.be.ok();
    expect(fileFindResponse.body.files[0].owner).to.be(serverCreationResponse.body.server.server.id);
  });

  it('retrieve user stats with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appUser', 'pass', 'appServer');
    await createApplicationUserToken(serverToken, 'appUser', 'pass');
    let userStatsResponse = await getUserStats(adminUserToken);
    expect(userStatsResponse.body.servers_stats).to.be.an.array;
    expect(userStatsResponse.body.servers_stats.length).to.be(1);
    expect(userStatsResponse.body.servers_stats[0].id).to.be(serverCreationResponse.body.server.server.id);
    expect(userStatsResponse.body.servers_stats[0].total_users).to.be('1');
    expect(userStatsResponse.body.servers_stats[0].active_users).to.be('1');
  });

  it('retrieve user stats with admin user token after server delete', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let serverId = serverCreationResponse.body.server.server.id;
    await deleteServer(adminUserToken, serverId);
    let userStatsResponse = await getUserStats(adminUserToken);
    expect(userStatsResponse.body.servers_stats).to.be.an.array;
    expect(userStatsResponse.body.servers_stats).to.be.empty;
  });

  it('retrieve stories stats with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let storiesStatsResponse = await getStoriesStats(adminUserToken);
    expect(storiesStatsResponse.body.servers_stats).to.be.an.array;
    expect(storiesStatsResponse.body.servers_stats).to.not.be.empty;
  });

  it('retrieve stories stats with admin user token after server delete', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let serverId = serverCreationResponse.body.server.server.id;
    await deleteServer(adminUserToken, serverId);
    let storiesStatsResponse = await getStoriesStats(adminUserToken);
    expect(storiesStatsResponse.body.servers_stats).to.be.an.array;
    expect(storiesStatsResponse.body.servers_stats).to.be.empty;
  });

  it('retrieve requests stats with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let requestsStatsResponse = await getRequestsStats(adminUserToken);
    expect(requestsStatsResponse.body.servers_stats).to.be.an.array;
    expect(requestsStatsResponse.body.servers_stats).to.not.be.empty;
  });

  it('retrieve requests stats with admin user token after server delete', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let serverId = serverCreationResponse.body.server.server.id;
    await deleteServer(adminUserToken, serverId);
    let requestsStatsResponse = await getRequestsStats(adminUserToken);
    expect(requestsStatsResponse.body.servers_stats).to.be.an.array;
    expect(requestsStatsResponse.body.servers_stats).to.be.empty;
  });

  it('delete server with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverId = serverCreationResponse.body.server.server.id;
    await deleteServer(adminUserToken, serverId);
  });

  it('retrieve deleted server with admin user token', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverId = serverCreationResponse.body.server.server.id;
    await deleteServer(adminUserToken, serverId);
    let serverFindResponse = await getServer(adminUserToken, serverId, 404);
    expect(serverFindResponse.body.code).to.be(404);
    expect(serverFindResponse.body.message).to.be('Server does not exist');
  });

  it('retrieve all files with server token after server delete', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse1 = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    await setFileOwnership(serverToken, fileUploadResponse1.body.file);
    let fileUploadResponse2 = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    await setFileOwnership(serverToken, fileUploadResponse2.body.file);
    let serverId = serverCreationResponse.body.server.server.id;
    await deleteServer(adminUserToken, serverId);
    let fileFindResponse = await getFiles(serverToken, 401);
    expect(fileFindResponse.body.code).to.be(401);
    expect(fileFindResponse.body.message).to.be('Unauthorized');
  });

  it('retrieve all servers with admin user token after server delete', async () => {
    let adminUserCreationResponse = await createAdminUser('adminuser', 'pass');
    let adminUserToken = adminUserCreationResponse.body.user.token.token;
    let serverCreationResponse = await createServer(adminUserToken, 'appServer', 'https://app-server-stories.herokuapp.com');
    let serverToken = serverCreationResponse.body.server.token.token;
    await createApplicationUser(serverToken, 'appuser', 'pass', 'appServer');
    let userTokenCreationResponse = await createApplicationUserToken(serverToken, 'appuser', 'pass');
    let userToken = userTokenCreationResponse.body.token.token;
    let fileUploadResponse1 = await uploadFile(userToken, 'upload.jpg', 'test/files/image.jpg');
    await setFileOwnership(serverToken, fileUploadResponse1.body.file);
    let fileUploadResponse2 = await uploadFile(userToken, 'upload.mp4', 'test/files/video.mp4');
    await setFileOwnership(serverToken, fileUploadResponse2.body.file);
    let serverId = serverCreationResponse.body.server.server.id;
    await deleteServer(adminUserToken, serverId);
    let serverFindResponse = await getAllServers(adminUserToken, 200);
    expect(serverFindResponse.body.servers).to.be.an.array;
    expect(serverFindResponse.body.servers).to.be.empty;
  });
});
