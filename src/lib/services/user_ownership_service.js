const UserOwnershipModel = require('../../models/user_ownership_model.js');

function UserOwnershipService(logger, postgrePool) {
  let _logger = logger;
  let _userOwnershipModel = new UserOwnershipModel(logger, postgrePool);

  this.setOwnership = async (user, server) => {
    try{
      await _userOwnershipModel.createOrUpdate(user, server);
    }
    catch(err){
      _logger.error('Error while setting username: \'%s\' ownership to server with name:\'%s\'', user.username, server.name);
      throw err;
    }
  };
}

module.exports = UserOwnershipService;
