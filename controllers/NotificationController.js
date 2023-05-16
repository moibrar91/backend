const Sequelize = require('sequelize');
const { Op } = require("sequelize");
const NotificationService = require("../services/NotificationService");
const UserService = require("../services/UserService");
const helpers = require("../util/helpers");
const colors = require("colors");

module.exports = () => {

  const getNotification = async (req, res, next, transaction) => {
    console.log("NotificationController => getNotification");
    let {page,limit,search} = req.query;
    page = parseInt(page) ; //for next page pass 1 here
    limit = parseInt(limit) ;
    let notification = null;
    let {userId} = req.body;
    let query = {userId}
    if(search) query.title =  { $regex: '.*' + search + '.*', '$options' : 'i' };
    notification = await NotificationService().getNotification(query,page,limit, transaction);
    let notification_id = await notification?notification.map(a=>a.id):[];
    console.log('notification_id');
    console.log(notification_id);
    if(notification_id.length>0){
      let  update_query = { "id": {[Op.in]:notification_id} }
      let update_reult = await NotificationService().updateMultipleNotification(update_query,{isRead:true}, transaction);
    }
    req.rData = {notification};
    next();
  }


  const setNotificationPermission = async (req, res, next) => {
    console.log("NotificationController => setNotificationPermission");
    let {userId,notification_permission,device_token,device_type} = req.body;
    let data = {notification_permission,device_token,device_type}
    let result = await UserService().updateProfile(userId,data);
    next();
  }

  const getUnreadNotificationCount = async (req, res, next) => {
    console.log("NotificationController => getUnreadNotificationCount");
    let {userId} = req.body;
    let query = {userId,isRead:'0'}
    let notification = await NotificationService().countNotification(query);
    req.rData = {notification};
    next();
  }

return {
      getNotification,
      setNotificationPermission,
      getUnreadNotificationCount
    }
}
