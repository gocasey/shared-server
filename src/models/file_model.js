const IntegrityValidator = require('../../src/utils/integrity_validator.js');

function FileModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;
  let integrityValidator = new IntegrityValidator(logger);

  function getBusinessFile(dbFile) {
    return {
      id: dbFile.file_id,
      filename: dbFile.file_name,
      _rev: dbFile._rev,
      size: dbFile.size,
      updatedTime: dbFile.updated_time,
      createdTime: dbFile.created_time,
      resource: dbFile.resource,
      owner: dbFile.owner,
    };
  };

  async function findByFileIdReturnAllParams(fileId) {
    let query = 'SELECT file_id, file_name, _rev, size, resource, updated_time, created_time, owner FROM files WHERE file_id = $1;';
    let values = [fileId];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      _logger.error('Error looking for file id:\'%s\' in the database', fileId);
      throw err;
    }
    if (response.rows.length == 0) {
      _logger.info('File with id:\'%s\' not found', fileId);
      return;
    } else {
      _logger.info('File with id:\'%s\' found', fileId);
      return response.rows[0];
    }
  }

  this.findByServerId = async (serverId) => {
    let query = 'SELECT file_id, file_name, _rev, size, resource, updated_time, created_time, owner FROM files WHERE owner = $1;';
    let values = [serverId];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      _logger.error('Error looking for files for server_id:\'%s\' in the database', serverId);
      throw err;
    }
    if (response.rows.length == 0) {
      _logger.info('No files found for server_id:\'%s\'', serverId);
      return [];
    } else {
      _logger.info('Files found for server_id:\'%s\'', response.rows);
      return response.rows.map( (file) => {
        return getBusinessFile(file);
      } );
    }
  };

  this.findByFileId = async (fileId) => {
    let dbFile = await findByFileIdReturnAllParams(fileId);
    return dbFile ? getBusinessFile(dbFile) : null;
  };

  async function updateFileRev(fileId, rev) {
    let query = 'UPDATE files SET _rev=$1 WHERE file_id=$2 RETURNING *;';
    let values = [rev, fileId];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      _logger.error('Error updating rev for file id:\'%s\'', fileId);
      throw err;
    }
    _logger.info('Hash for file id: \'%s\' updated successfully', fileId);
    return getBusinessFile(response.rows[0]);
  };


  this.create = async (file) => {
    let query = 'INSERT INTO files(file_name, resource, size) VALUES ($1, $2, $3) RETURNING *;';
    let values = [file.file_name, file.resource, file.size];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      logger.error('Error creating file with name:\'%s\' to database', file.file_name);
      throw err;
    }
    _logger.info('File with name: \'%s\' created successfully', file.file_name);
    _logger.debug('File created in db: %j', response.rows[0]);
    // integrity hash is created here since we now know the file_id
    let rev = integrityValidator.createHash(response.rows[0]);
    return await updateFileRev(response.rows[0].file_id, rev);
  };

  async function executeUpdate(file) {
    let currentRev = integrityValidator.createHash(file);
    let query = 'UPDATE files SET _rev=$1, file_name=$2, size=$3, resource=$4, owner=$5 WHERE file_id=$6 RETURNING *;';
    let values = [currentRev, file.filename, file.size, file.resource, file.owner, file.id];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      _logger.error('Error updating file with name:\'%s\' to database', file.id);
      throw err;
    }
    _logger.info('File with id: \'%s\' updated successfully', file.id);
    _logger.debug('File updated in db: %j', response.rows[0]);
    return getBusinessFile(response.rows[0]);
  };

  this.update = async (file) => {
    let dbFile = await findByFileIdReturnAllParams(file.id);
    if (dbFile) {
      if (dbFile._rev === file._rev) {
        _logger.info('The integrity check for file with id: \'%s\' was successful. Proceeding with update.', file.id);
        return await executeUpdate(file);
      } else {
        _logger.error('The integrity check for file with id: \'%s\' failed. Aborting update.', file.id);
        throw new Error('Error updating');
      }
    } else {
      _logger.error('Update cannot be completed, file with id: \'%s\' does not exist', file.id);
      throw new Error('File does not exist');
    }
  };

  this.updateOwner = async (fileIdserverId) => {
    let dbFile = await findByFileIdReturnAllParams(file.id);
    if (dbFile) {
      if (dbFile._rev === file._rev) {
        _logger.info('The integrity check for file with id: \'%s\' was successful. Proceeding with update.', file.id);
        return await executeUpdate(file);
      } else {
        _logger.error('The integrity check for file with id: \'%s\' failed. Aborting update.', file.id);
        throw new Error('Error updating');
      }
    } else {
      _logger.error('Update cannot be completed, file with id: \'%s\' does not exist', file.id);
      throw new Error('File does not exist');
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

module.exports = FileModel;
