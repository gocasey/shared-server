const UserService = require('../lib/services/user_service.js');

function StatsController(logger, postgrePool) {
  let _userService = new UserService(logger, postgrePool);

  this.getTotalUsersCountByServer = async(req, res, next) => {
    let totalUsersCountByServer;
    try{
      totalUsersCountByServer = await _userService.getTotalUsersCountByServer();
    } catch (err){
      return next(err);
    }
    res.totalUsersCountByServer = totalUsersCountByServer;
    return next();
  };

  this.getActiveUsersCountByServer = async(req, res, next) => {
    let activeUsersCountByServer;
    try{
      activeUsersCountByServer = await _userService.getActiveUsersCountByServer();
    } catch (err){
      return next(err);
    }
    res.activeUsersCountByServer = activeUsersCountByServer;
    return next();
  };
}

module.exports = StatsController;
