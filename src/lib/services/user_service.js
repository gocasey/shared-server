const crypto = require('crypto');
const UserModel = require('../../models/user_model.js');

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
      applicationOwner: body.applicationOwner,
    };

    try {
      let userCreate = await _userModel.create(userData);
      return userCreate;
    } catch (createErr) {
      try {
        let userFind = await _userModel.findByUsername(userData.username);
        if (userFind) {
          _logger.error('There is already a user with username: \'%s\'', userData.username);
          throw new Error('Username already in usage');
        } else {
          _logger.error('Application owner: \'%s\' does not exist', userData.applicationOwner);
          throw new Error('Application owner does not exist');
        }
      } catch (findErr) {
        _logger.error('An error happened while creating the user: \'%s\'', userData.username);
        throw new Error('User creation error');
      }
    }
  };
}

module.exports = UserService;
