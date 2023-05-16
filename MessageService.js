const { models } = require("../models");
const { Op } = require("sequelize");

module.exports = () => {
  const createNewReqCollaboration = (data, transaction = null) => {
    return new Promise(function (resolve, reject) {
      models.collaboration_requests
        .create(data, { transaction })
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchAllUserChatsList = (
    filters,
    transaction = null,
    scope = "defaultScope"
  ) => {
    console.log("MessageService => fetchAllUserChatsList");
    return new Promise(function (resolve, reject) {
      let where = {};
      if (filters.userId) {
        where = {
          [Op.or]: [
            { requestedToId: filters.userId },
            { requestedById: filters.userId },
          ],
        };
      }
      let nestedWhere = {};
      if (filters.isRequestedStatus)
        nestedWhere.isRequestedStatus = filters.isRequestedStatus;

      let orm = models.collaboration_requests.findAll({
        where: where,
        subQuery: false,
        order: [["lastMsgDate", "DESC"]],
        include: {
          model: models.colla_req_tags,
          where: nestedWhere,
          required: true,
        },
        transaction,
      });

      orm.then(resolve).catch(reject);
    });
  };
  const fetchAllReqCollaboration = (
    filters,
    transaction = null,
    scope = "defaultScope"
  ) => {
    console.log("MessageService => fetchAllReqCollaboration");
    return new Promise(function (resolve, reject) {
      let where = {};
      if (filters.userId) {
        where = {
          [Op.or]: [
            { requestedToId: filters.userId },
            { requestedById: filters.userId },
          ],
        };
      }
      let nestedWhere = {};
      if (filters.isRequestedStatus)
        nestedWhere.isRequestedStatus = filters.isRequestedStatus;
      let orm = models.collaboration_requests.findAll({
        where: where,
        subQuery: false,
        order: [["id", "DESC"]],
        include: {
          model: models.colla_req_tags,
          where: nestedWhere,
          required: true
        },
        transaction,
      });

      orm.then(resolve).catch(reject);
    });
  };

  const fetchReqCollaboration = (
    filters,
    transaction = null,
    scope = "defaultScope"
  ) => {
    console.log("MessageService => fetchReqCollaboration");
    return new Promise(function (resolve, reject) {
      let where = {};
      console.log("eeee", typeof filters.requestedToId);
      if (filters.requestedById || filters.requestedToId) {
        console.log("uuu");
        where = {
          [Op.or]: [
            {
              [Op.and]: [
                { requestedToId: filters.requestedToId },
                { requestedById: filters.requestedById },
              ],
            },
            {
              [Op.and]: [
                { requestedToId: filters.requestedById },
                { requestedById: filters.requestedToId },
              ],
            },
          ],
        };
      }
      console.log("wwwwwwww2 ", where);
      let orm = models.collaboration_requests.scope(scope).findOne({
        where: where,
        transaction,
      });

      orm.then(resolve).catch(reject);
    });
  };

  const updateReqCollaboration = (query, data, transaction = null) => {
    console.log("MessageService => updateReqCollaboration", data);
    return new Promise(function (resolve, reject) {
      models.collaboration_requests
        .update(data, { where: query, transaction })
        .then(resolve)
        .catch(reject);
    });
  };

  const deleteReqCollaboration = (query, transaction = null) => {
    console.log("MessageService => deleteReqCollaboration");
    return new Promise(function (resolve, reject) {
      models.collaboration_requests
        .destroy({ where: query, transaction })
        .then(resolve)
        .catch(reject);
    });
  };

  const createSelectedTagOnReqColl = (data, transaction = null) => {
    console.log("MessageService => createSelectedTagOnReqColl");
    return new Promise(function (resolve, reject) {
      models.colla_req_tags
        .create(data, { transaction })
        .then(resolve)
        .catch(reject);
    });
  };

  const updateSelectedTagOnReqColl = (query, data, transaction = null) => {
    console.log("MessageService => updateSelectedTagOnReqColl", data);
    return new Promise(function (resolve, reject) {
      models.colla_req_tags
        .update(data, { where: query, transaction })
        .then(resolve)
        .catch(reject);
    });
  };

  const deleteSelectedTagOnReqColl = (query, transaction = null) => {
    console.log("MessageService => deleteSelectedTagOnReqColl");
    return new Promise(function (resolve, reject) {
      models.colla_req_tags
        .destroy({ where: query, transaction })
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchSelectedCollTagByQuery = (
    query,
    transaction = null,
    scope = "defaultScope"
  ) => {
    console.log("MessageService => fetchSelectedCollTagByQuery");
    return new Promise(function (resolve, reject) {
      let orm = models.colla_req_tags.scope(scope).findOne({
        where: query,
        transaction,
      });

      orm.then(resolve).catch(reject);
    });
  };

  const getAllReqCollaboration = (filters, transaction = null) => {
    return new Promise(function (resolve, reject) {
      let where = {};

      // if (filters.status) where.isActive = filters.status;
      console.log("where");
      console.log(where);
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
          order: [["id", "DESC"]],
          transaction,
        };
      } else {
        query = {
          where: where,
          subQuery: false,
          order: [["id", "DESC"]],
          transaction,
        };
      }
      let orm = models.collaboration_requests.findAll(query);

      orm.then(resolve).catch(reject);
    });
  };
  const getAllReqCollAcceptedReject = (query, transaction = null) => {
    return new Promise(function (resolve, reject) {
      let orm = models.colla_req_tags.findAll({
        where: query,
        order: [["id", "DESC"]],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },

        transaction,
      });
      // let orm = models.collaboration_requests.findAll({
      //     where: query,
      //     order: [
      //       ['id', 'DESC']
      //     ],
      //     attributes: {
      //         exclude: ["createdAt", "updatedAt"]
      //     },
      //     include: [
      //       {
      //         model: models.colla_req_tags,
      //         as:'collaborationTagList'
      //         // where: { isRequestedStatus: filters.isRequestedStatus }
      //       }
      //     ],

      //     transaction
      // })

      orm.then(resolve).catch(reject);
    });
  };
  const getAllReqCollRejected = (query, transaction = null) => {
    return new Promise(function (resolve, reject) {
      let orm = models.collaboration_requests.findAll({
        where: query,
        order: [["id", "DESC"]],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        transaction,
      });

      orm.then(resolve).catch(reject);
    });
  };

  const createMessage = (data, transaction = null) => {
    console.log("MessageService => createSelectedTagOnReqColl");
    return new Promise(function (resolve, reject) {
      models.messages.create(data, { transaction }).then(resolve).catch(reject);
    });
  };

  const updateMessage = (query, data, transaction = null) => {
    console.log("MessageService => updateMessage", data);
    return new Promise(function (resolve, reject) {
      models.messages
        .update(data, { where: query, transaction })
        .then(resolve)
        .catch(reject);
    });
  };

  const deleteMessage = (query, transaction = null) => {
    console.log("MessageService => deleteMessage");
    return new Promise(function (resolve, reject) {
      models.messages
        .destroy({ where: query, transaction })
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchMessageByChatId = (
    query,
    transaction = null,
    scope = "defaultScope"
  ) => {
    console.log("MessageService => fetchMessageById");
    return new Promise(function (resolve, reject) {
      let orm = models.messages.scope(scope).findAll({
        where: query,
        transaction,
      });

      orm.then(resolve).catch(reject);
    });
  };

  return {
    createNewReqCollaboration,
    getAllReqCollaboration,
    fetchAllReqCollaboration,
    fetchAllUserChatsList,
    getAllReqCollAcceptedReject,
    getAllReqCollRejected,
    fetchSelectedCollTagByQuery,
    createSelectedTagOnReqColl,
    updateReqCollaboration,
    deleteReqCollaboration,
    fetchReqCollaboration,
    deleteSelectedTagOnReqColl,
    updateSelectedTagOnReqColl,
    createMessage,
    updateMessage,
    fetchMessageByChatId,
    deleteMessage,
  };
};
//session.endSession();
