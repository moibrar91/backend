const { models } = require("../models");
module.exports = () => {


    const addNotification = (data,transaction=null) => {
        return new Promise(function(resolve, reject){
            models.notifications.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const getNotification = (query,page,limit, transaction=null) => {
      return new Promise(function(resolve, reject){
        page = parseInt(page || 1);
        limit = parseInt(limit || 10);
        let offset = (page - 1) * limit;
        let orm = {
            limit,
            offset,
            where: query,
            order: [
                ['id', 'DESC']
            ]
        }
          models.notifications.findAll(orm)
          .then(resolve).catch(reject);
      })
    }

    const fetch = (id) => {
      return new Promise(function(resolve, reject){
          let query = {id };


          let orm = models.notifications.findOne(query)
          orm.then(resolve).catch(reject);
      })
    }

    const updateNotification = (id, data, transaction=null) => {
        console.log("NotificationService => updateNotification")
        return new Promise(async function(resolve, reject){
          let notifications = await models.notifications.update(data, { where: {id:id}, transaction }).then(resolve).catch(reject);
        })
    }

    const countNotification = (where_query, transaction=null) => {
        console.log("NotificationService => countNotification")
        return new Promise(async function(resolve, reject){
          let query = {
              where : where_query,
              distinct: true,
              col: 'id',
              transaction
          };

          let orm = models.notifications.count(query)
          orm.then(resolve).catch(reject);
        })
    }

    const updateMultipleNotification = (query, data, transaction=null) => {
        console.log("NotificationService => updateMultipleNotification")
        return new Promise(async function(resolve, reject){
          let notifications = await models.notifications.update(data,{where:query, transaction}).then(resolve).catch(reject);
        })
    }

    const addAdminNotification = (data,transaction=null) => {
        return new Promise(function(resolve, reject){
            models.admin_notifications.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateAdminNotification = (query, data, transaction=null) => {
        console.log("NotificationService => updateAdminNotification")
        return new Promise(async function(resolve, reject){
          let notifications = await models.admin_notifications.update(data,{where:query, transaction}).then(resolve).catch(reject);
        })
    }

    const deleteNotification = (query, transaction = null) => {
        console.log("NotificationService => deleteNotification")
        return new Promise(function(resolve, reject){
            models.admin_notifications.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addNotifiedCustomer = (data,transaction=null) => {
        return new Promise(function(resolve, reject){
            models.notified_customers.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const getAdminNotificationList = (query,page,limit, transaction=null) => {
      return new Promise(function(resolve, reject){
        page = parseInt(page || 1);
        limit = parseInt(limit || 10);
        let offset = (page - 1) * limit;
        let orm = {
            limit,
            offset,
            where: query,
            order: [
                ['id', 'DESC']
            ]
        }
          models.admin_notifications.findAll(orm)
          .then(resolve).catch(reject);
      })
    }

    const getAdminNotificationDetails = (id) => {
      return new Promise(function(resolve, reject){
          let query = {
              where: {id }
          }
          let orm = models.admin_notifications.findOne(query)
          orm.then(resolve).catch(reject);
      })
    }
    const countAdminNotification = (where_query, transaction=null) => {
        console.log("NotificationService => countAdminNotification")
        return new Promise(async function(resolve, reject){
          let query = {
              where : where_query,
              distinct: true,
              col: 'id',
              transaction
          };

          let orm = models.admin_notifications.scope("withNoData").count(query)
          orm.then(resolve).catch(reject);
        })
    }

    return {
      addNotification,
      fetch,
      getNotification,
      updateNotification,
      countNotification,
      updateMultipleNotification,
      addAdminNotification,
      updateAdminNotification,
      deleteNotification,
      addNotifiedCustomer,
      getAdminNotificationList,
      getAdminNotificationDetails,
      countAdminNotification
    }

  }
  //session.endSession();
