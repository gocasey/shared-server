const IntegrityValidator = require('../../src/utils/integrity_validator.js');

function ServerModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;
  let integrityValidator = new IntegrityValidator(logger);

  function getBusinessServer(dbServer) {
    return {
      id: dbServer.server_id,
      name: dbServer.server_name,
      _rev: dbServer._rev,
    };
  };

  async function findByServerNameReturnAllParams(serverName) {
    let query = 'SELECT server_id, server_name, _rev FROM servers WHERE server_name = $1;';
    let values = [serverName];
    try {
      let res = await executeQuery(query, values);
      if (res.rows.length == 0) {
        _logger.info('Server with name:\'%s\' not found', serverName);
        return;
      } else if (res.rows.length > 1) {
        _logger.warn('More than a server found for name: %s', serverName);
        return res.rows[0];
      } else {
        _logger.info('Server with name:\'%s\' found', serverName);
        return res.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for server name:\'%s\' in the database', serverName);
      throw err;
    }
  }

  this.findByServerName = async (serverName) => {
    let dbServer = await findByServerNameReturnAllParams(serverName);
    return dbServer ? getBusinessServer(dbServer) : null;
  };

  async function updateServerRev(serverName, rev) {
    let query = 'UPDATE servers SET _rev=$1 WHERE server_name=$2 RETURNING server_id, server_name, _rev;';
    let values = [rev, serverName];
    try {
      let res = await executeQuery(query, values);
      _logger.info('Hash for server: \'%s\' updated successfully', serverName);
      return getBusinessServer(res.rows[0]);
    } catch (err) {
      _logger.error('Error updating rev for server name:\'%s\'', serverName);
      throw err;
    }
  };


  this.create = async(server) => {
    let query = 'INSERT INTO servers(server_name) VALUES ($1) RETURNING server_id, server_name;';
    let values = [server.name];
    try {
      let res = await executeQuery(query, values);
      _logger.info('Server with name: \'%s\' created successfully', server.name);
      _logger.debug('Server created in db: %j', res.rows[0]);
      // integrity hash is created here since we now know the user_id
      let rev = integrityValidator.createHash(server);
      return await updateServerRev(server.name, rev);
    }
    catch(err){
      logger.error('Error creating server with name:\'%s\' to database', server.name);
      throw err;
    }
  };

  async function executeUpdate(server) {
    let currentRev = integrityValidator.createHash(server);
    let query = 'UPDATE servers SET _rev=$1 WHERE server_name=$2 RETURNING server_id, server_name;';
    let values = [currentRev, server.name];
    try {
      let res = await executeQuery(query, values);
      _logger.info('Server with name: \'%s\' updated successfully', server.name);
      _logger.debug('Server updated in db: %j', res.rows[0]);
      return getBusinessServer(res.rows[0]);
    } catch (err) {
      _logger.error('Error updating server with name:\'%s\' to database', server.name);
      throw err;
    }
  };

  this.update = async (server) => {
    let dbServer = await findByServerNameReturnAllParams(server.name);
    if (dbServer) {
      if (dbServer._rev === server._rev) {
        _logger.info('The integrity check for server with name: \'%s\' was successful. Proceeding with update.', server.name);
        return await executeUpdate(server);
      } else {
        _logger.error('The integrity check for server with name: \'%s\' failed. Aborting update.', server.name);
        throw new Error('Error updating');
      }
    }
    else {
      _logger.error('Update cannot be completed, server with name: \'%s\' does not exist', server.name);
      throw new Error('Server does not exist');
    }
  };

  async function executeQuery(query, values) {
    try {
      let response = await _postgrePool.query(query, values);
      _logger.debug('Postgre response: %j', response);
      return response;
    } catch (err) {
      _logger.error('DB error: %j', err.message);
      throw err;
    }
  }
}

module.exports = ServerModel;