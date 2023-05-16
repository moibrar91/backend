const { models } = require("../models");
module.exports = () => {


    const createMeeting = (data,transaction=null) => {
        return new Promise(function(resolve, reject){
            models.user_meeting_details.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateMeeting = (query, data, transaction=null) => {
      console.log("updateMeeting => update meeting", query)
      return new Promise(async function(resolve, reject){
        let meeting = await models.user_meeting_details.update(data, { where: query, transaction }).then(resolve).catch(reject);
        // console.log("meeting", meeting);
      })
    }

    const deleteUserDetailsMeeting = (query, transaction = null) => {
      console.log("deleteFestivalMeeting => deleteFestivalMeeting")
      return new Promise(function (resolve, reject) {
          models.user_meeting_details.destroy({ where: query, transaction })
              .then(resolve).catch(reject);
      })
    }

    const createFestivalMeeting = (data,transaction=null) => {
        return new Promise(function(resolve, reject){
            models.user_festival_details.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateFestivalMeeting = (query, data, transaction=null) => {
      console.log("updateFestivalMeeting => updateFestivalMeeting")
      return new Promise(async function(resolve, reject){
        let meeting = await models.user_festival_details.update(data, { where: query, transaction }).then(resolve).catch(reject);
      })
    }

    const deleteFestivalMeeting = (query, transaction = null) => {
      console.log("deleteFestivalMeeting => deleteFestivalMeeting")
      return new Promise(function (resolve, reject) {
          models.user_festival_details.destroy({ where: query, transaction })
              .then(resolve).catch(reject);
      })
    }

    const getAllMeetingDetails = (query,page,limit, transaction=null, scope = "defaultScope") => {
      return new Promise(function(resolve, reject){
        page = parseInt(page);
        limit = parseInt(limit);
        let offset = (page - 1) * limit;
        let where = {
            limit,
            offset,
            where: query,
            subQuery: false,
            order: [
                ['id', 'DESC']
            ]
        }
        // console.log("orm    ---- ", orm);
          // models.user_meeting_details.scope(scope).findAll(orm)
          // .then(resolve).catch(reject);

          let orm = models.user_meeting_details.findAll(where)
            orm.then(resolve).catch(reject);
      })
    }

    const getAllFestivalList = (filters, transaction = null) => {
      console.log("festivalService => getAllFestivalList")
      return new Promise(function (resolve, reject) {

          let where;
          if (filters.meetingType) where ={ meetingType : filters.meetingType};

          console.log("where ", where);
          let query = {};

          if (filters.page && filters.limit) {
              let page = parseInt(filters.page);
              let limit = parseInt(filters.limit);
              let offset = (page - 1) * limit;
              query = {
                  limit,
                  offset,
                  where: where,
                  subQuery: false,
                  order: [
                      ['id', 'DESC']
                  ],
                  transaction
              }
          } else {
              query = {
                  where: where,
                  subQuery: false,
                  order: [
                      ['id', 'ASC']
                  ],
                  transaction
              }
          }
          let orm = models.user_meeting_details.findAll(query)

          orm.then(resolve).catch(reject);
      })
  }

  
    const getMeetingDetailsById = (query, transaction = null) => {
    
      return new Promise(function (resolve, reject) {
        let orm = models.user_meeting_details.findOne({
            where: query,
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            },
            transaction
        })

        orm.then(resolve).catch(reject);
    })
    }

    const getMeetingAllDetails = (query, transaction = null) => {
    
      return new Promise(function (resolve, reject) {
        let orm = models.user_meeting_details.findAll({
            where: query,
            order: [
              ['id', 'DESC']
            ],
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            },
            transaction
        })

        orm.then(resolve).catch(reject);
    })
    }

    

    // const countMeeting = (where_query, transaction=null) => {
    //     console.log("NotificationService => countNotification")
    //     return new Promise(async function(resolve, reject){
    //       let query = {
    //           where : where_query,
    //           distinct: true,
    //           col: 'id',
    //           transaction
    //       };

    //       let orm = models.user_meeting_details.count(query)
    //       orm.then(resolve).catch(reject);
    //     })
    // }

    // const updateMultipleMeetings = (query, data, transaction=null) => {
    //     console.log("NotificationService => updateMultipleNotification")
    //     return new Promise(async function(resolve, reject){
    //       let meetings = await models.user_meeting_details.update(data,{where:query, transaction}).then(resolve).catch(reject);
    //     })
    // }

    // const joinMeeting = (data,transaction=null) => {
    //     return new Promise(function(resolve, reject){
    //         models.user_meeting_details.create(data, { transaction })
    //             .then(resolve).catch(reject);
    //     })
    // }

    // const updateJoinMeeting = (query, data, transaction=null) => {
    //     console.log("NotificationService => updateAdminNotification")
    //     return new Promise(async function(resolve, reject){
    //       let meeting = await models.user_meeting_details.update(data,{where:query, transaction}).then(resolve).catch(reject);
    //     })
    // }

    // const deleteMeeting = (query, transaction = null) => {
    //     console.log("NotificationService => deleteNotification")
    //     return new Promise(function(resolve, reject){
    //         models.user_meeting_details.destroy({ where: query, transaction })
    //             .then(resolve).catch(reject);
    //     })
    // }

    // const getAdminMeetingDetails = (id) => {
    //   return new Promise(function(resolve, reject){
    //       let query = {
    //           where: {id }
    //       }
    //       let orm = models.user_meeting_details.findOne(query)
    //       orm.then(resolve).catch(reject);
    //   })
    // }


    return {
      createMeeting,
      updateMeeting,
      createFestivalMeeting,
      updateFestivalMeeting,
      getAllMeetingDetails,
      getMeetingDetailsById,
      deleteFestivalMeeting,
      deleteUserDetailsMeeting,
      getMeetingAllDetails,
      getAllFestivalList
    }

  }
