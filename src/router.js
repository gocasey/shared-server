const filesController = require('./controllers/files-controller.js');
const serversController = require('./controllers/servers-controller.js');
const usersController = require('./controllers/users-controller.js');
const statusController = require('./controllers/status-controller.js');
var ApplicationUserCredentialsSchemaValidator = require('../schema_validators/application_user_credentials_schema_validator.js');
var BusinessUserCredentialsSchemaValidator = require('../schema_validators/business_user_credentials_schema_validator.js');

module.exports = (router) => {
  // Files
  router.get('/files', filesController.getFiles);
  router.post('/files', filesController.createFiles);
  router.get('/files/:fileId', filesController.getFile);
  router.put('/files/:fileId', filesController.updateFile);
  router.delete('/files/:fileId', filesController.deleteFile);
  router.post('/files/upload', filesController.uploadFiles);

  // Servers
  router.get('/servers', serversController.getServers);
  router.post('/servers', serversController.createServers);
  router.get('/servers/:serverId', serversController.getServer);
  router.post('/servers/:serverId', serversController.createServer);
  router.put('/servers/:serverId', serversController.updateServer);
  router.delete('/servers/:serverId', serversController.deleteServer);

  // Users
  router.post('/token', 
                        usersController.generateToken);
  router.post('/authorize', usersController.authorizeUser);

  // Status
  router.get('/ping', statusController.ping);

  return router;
};
