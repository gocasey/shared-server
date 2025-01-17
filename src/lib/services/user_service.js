const crypto = require('crypto');
const UserModel = require('../../models/user_model.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function UserService(logger, postgrePool) {
  let _logger = logger;
  let _userModel = new UserModel(logger, postgrePool);

  function hash(s) {
    return crypto.createHmac('sha256', 'secret').update(s).digest('hex');
  }

  this.authenticateWithPassword = async (username, password) => {
    let user = await _userModel.findByUsername(username);
    if (user) {
      if (hash(password) == user.password) {
        _logger.info('Password validated successfully for username: \'%s\'', username);
        return user;
      } else {
        _logger.error('Wrong password for username: \'%s\'', username);
        throw new Error('Password incorrect');
      }
    } else throw new Error('User not found');
  };

  this.createUser = async (body) => {
    let userData = {
      username: body.username,
      password: hash(body.password),
    };
    let err;
    try {
      return await _userModel.create(userData);
    } catch (createErr) {
      err = createErr;
    }
    if (err) {
      let userFind;
      try {
        userFind = await _userModel.findByUsername(userData.username);
      } catch (findErr) {
        _logger.error('An error happened while creating the user: \'%s\'', userData.username);
        throw new BaseHttpError('User creation error', 500);
      }
      if (userFind) {
        _logger.error('There is already a user with username: \'%s\'', userData.username);
        throw new BaseHttpError('Username already exists', 409);
      } else {
        _logger.debug('Unknown error on user creation. User: \'%j\'', userData);
        throw new BaseHttpError('User creation error', 500);
      }
    }
  };

  this.findUser = async (userId) => {
    let user;
    try {
      user = await _userModel.findByUserId(userId);
    } catch (findErr) {
      _logger.error('An error happened while looking for the user with id: \'%s\'', userId);
      throw new BaseHttpError('User find error', 500);
    }
    if (user) {
      return user;
    } else {
      _logger.error('The user with id: \'%s\' was not found', userId);
      throw new BaseHttpError('User does not exist', 404);
    }
  };

  this.updateLastConnection = async (user) => {
    try {
      return await _userModel.updateLastConnection(user);
    } catch (updateErr) {
      _logger.error('An error happened while updating the user with id: \'%s\'', user.user_id);
      if (updateErr.message == 'User does not exist') {
        throw new BaseHttpError(updateErr.message, 404);
      } else if (updateErr.message == 'Integrity check error') {
        throw new BaseHttpError(updateErr.message, 409);
      } else throw new BaseHttpError('User update error', 500);
    }
  };

  this.getTotalUsersCountByServer = async () => {
    try {
      return await _userModel.getTotalUsersCountByServer();
    } catch (countError) {
      _logger.error('There was an error retrieving the total users count by server');
      throw new BaseHttpError('Stats error', 500);
    }
  };

  this.getActiveUsersCountByServer = async () => {
    try {
      return await _userModel.getActiveUsersCountByServer();
    } catch (countError) {
      _logger.error('There was an error retrieving the active users count by server');
      throw new BaseHttpError('Stats error', 500);
    }
  };
}

module.exports = UserService;
