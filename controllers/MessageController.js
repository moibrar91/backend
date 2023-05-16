const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const MessageService = require("../services/MessageService");
const UserService = require("../services/UserService");

module.exports = () => {
  const newReqForCollaboration = async (req, res, next, transaction) => {
    console.log("MessageController => newReqForCollaboration");
    let {
      selectedTag,
      selectedImage,
      message,
      requestedToId,
      requestedById,
      requestedToUserType,
      requestedByUserType,
    } = req.body;
    let lastMsgDate = new Date();
    let filters = { requestedToId, requestedById };
    // console.log("collaborate ", req.body);
    let findReqColl = await MessageService().fetchReqCollaboration(
      filters,
      transaction
    );
    console.log("findReqColl ", findReqColl);
    if (findReqColl) {
      console.log("if");
      let collaboration = await MessageService().createSelectedTagOnReqColl(
        {
          colla_req_id: findReqColl.id,
          selectedTag,
          selectedImage,
          userId: requestedById,
          message,
          isRequestedStatus: "0",
          requestedByUserType,
        },
        transaction
      );
    } else {
      console.log("else * ");
      let coll_data = {
        requestedById,
        requestedToId,
        lastMsgDate,
        requestedToUserType,
        requestedByUserType,
      };
      let collaboration = await MessageService().createNewReqCollaboration(
        coll_data,
        transaction
      );
      if (collaboration) {
        let coll_tag_data = {
          colla_req_id: collaboration.id,
          userId: requestedById,
          selectedTag,
          selectedImage,
          message,
          isRequestedStatus: "0",
          requestedByUserType,
        };
        let collaTag = await MessageService().createSelectedTagOnReqColl(
          coll_tag_data,
          transaction
        );
      }
    }
    req.rData = { collaborationList: findReqColl };
    next();
  };

  const getAllUserChatsList = async (req, res, next, transaction) => {
    console.log("MessageController => getAllUserChatsList");
    let { requestedById, requestedToId, isRequestedStatus, userId } = req.query;
    let filters = { requestedById, requestedToId, userId, isRequestedStatus };
    let scope = "withUserDetails";
    console.log(
      "isRequestedStatus",
      isRequestedStatus,
      " type ",
      typeof isRequestedStatus
    );
    let collaboration = await MessageService().fetchAllUserChatsList(
      filters,
      transaction,
      scope
    );
    if (collaboration.length > 0)
      collaboration = await fetchUserDetailsOfCollaborated(
        collaboration,
        userId,
        isRequestedStatus,
        transaction
      );
    req.rData = { collaboration };
    next();
  };

  const fetchUserDetailsOfCollaborated = async (
    data,
    userId,
    isRequestedStatus,
    transaction
  ) => {
    let collaborationData = [];
    let user_details;
    let user_id = userId;
    for (const item of data) {
      let {
        id,
        requestedById,
        requestedToId,
        requestedByUserType,
        requestedToUserType,
        lastMsgDate,
        colla_req_tags,
      } = item;
      if (userId == requestedById) {
        let scope =
          requestedToUserType != "student"
            ? "withRequestedToDetails"
            : "studentDetailsWithDegreeAndWork";
        user_details = requestedToId
          ? await UserService().fetchByQuery(
              { id: requestedToId },
              transaction,
              scope
            )
          : null;
      } else {
        let scope =
          requestedByUserType != "student"
            ? "withRequestedToDetails"
            : "studentDetailsWithDegreeAndWork";
        user_details = requestedById
          ? await UserService().fetchByQuery(
              { id: requestedById },
              transaction,
              scope
            )
          : null;
      }

      if (isRequestedStatus == "1") {
        console.log("interested");
        collaborationData.push({
          id,
          requestedById,
          requestedToId,
          lastMsgDate,
          requestedToUserType,
          requestedByUserType,
          colla_req_tags,
          user_details,
        });
      } else {
        let newCollTag = [];
        let collReqCheck = false;
        for (const tag of colla_req_tags) {
          let { isRequestedStatus, userId } = tag;
          if (user_id !== userId && isRequestedStatus == "0") {
            console.log("hanuman", userId, user_id);
            collReqCheck = true;
          } else {
            console.log("ramji", userId, user_id);
          }
          console.log("krishji", userId, user_id);
          // newCollTag.push({id, selectedImage, selectedTag, message, isRequestedStatus, requestedByUserType, userId, colla_req_id, createdAt, user_details})
        }
        if (collReqCheck) {
          collaborationData.push({
            id,
            requestedById,
            requestedToId,
            lastMsgDate,
            requestedToUserType,
            requestedByUserType,
            colla_req_tags,
            user_details,
          });
        }
      }
      // collaborationData.push({ id, requestedById, requestedToId, lastMsgDate, requestedToUserType, requestedByUserType, colla_req_tags, user_details});
    }

    return collaborationData;
  };

  const getAllUserChatsInterested = async (req, res, next, transaction) => {
    console.log("MessageController => getAllUserChatsInterested");
    let {
      requestedById,
      requestedToId,
      isRequestedStatus,
      requestedToUserType,
      userId,
    } = req.query;
    let filters = { requestedById, requestedToId, isRequestedStatus, userId };
    let scope = "withAllDetails";
    let collaboration = await MessageService().fetchAllReqCollaboration(
      filters,
      transaction,
      scope
    );
    if (collaboration.length > 0)
      collaboration = await fetchMoreDetailsOfCollaborated(
        collaboration,
        userId,
        transaction
      );
    req.rData = { collaboration };
    next();
  };

  const fetchMoreDetailsOfCollaborated = async (data, userId, transaction) => {
    let collaborationData = [];
    let user_details;
    let user_id = userId;
    for (const item of data) {
      let {
        id,
        requestedById,
        requestedToId,
        requestedByUserType,
        requestedToUserType,
        lastMsgDate,
        colla_req_tags,
      } = item;

      if (userId == requestedById) {
        let scope =
          requestedToUserType != "student"
            ? "withRequestedToDetails"
            : "studentDetailsWithDegreeAndWork";
        user_details = requestedToId
          ? await UserService().fetchByQuery(
              { id: requestedToId },
              transaction,
              scope
            )
          : null;
      } else {
        let scope =
          requestedByUserType != "student"
            ? "withRequestedToDetails"
            : "studentDetailsWithDegreeAndWork";
        user_details = requestedById
          ? await UserService().fetchByQuery(
              { id: requestedById },
              transaction,
              scope
            )
          : null;
      }
      let newCollTag = [];
      let collReqCheck = false;
      for (const tag of colla_req_tags) {
        let {
          id,
          selectedImage,
          selectedTag,
          message,
          isRequestedStatus,
          requestedByUserType,
          userId,
          colla_req_id,
          createdAt,
        } = tag;

        console.log("krishji44", userId, user_id);
        newCollTag.push({
          id,
          selectedImage,
          selectedTag,
          message,
          isRequestedStatus,
          requestedByUserType,
          userId,
          colla_req_id,
          createdAt,
          user_details,
        });
        if (user_id !== userId && isRequestedStatus == "0") {
          console.log("hanuman45", userId, user_id);
          collReqCheck = true;
        }
      }
      if (collReqCheck) {
        console.log("ppppppp*");
        collaborationData.push({
          id,
          requestedById,
          requestedToId,
          lastMsgDate,
          requestedToUserType,
          requestedByUserType,
          colla_req_tags: newCollTag,
        });
      } else {
        console.log("uiooooo 45");
      }
      // collaborationData.push({ id, requestedById, requestedToId, lastMsgDate, requestedToUserType, requestedByUserType, colla_req_tags: newCollTag});
    }

    return collaborationData;
  };

  const getAllCollaboratedListById = async (req, res, next, transaction) => {
    console.log("MessageController => getAllCollaboratedListById");
    let { collaId } = req.query;
    let collaboration = await MessageService().fetchReqCollaboration(
      { id: collaId },
      transaction
    );
    req.rData = { collaboration };
    next();
  };

  const getAllMessagingByChatId = async (req, res, next, transaction) => {
    console.log("MessageController => getAllMessagingByChatId");
    let { colla_req_id } = req.query;
    console.log("clolll req id ", colla_req_id);
    let messages = await MessageService().fetchMessageByChatId(
      { colla_req_id },
      transaction
    );
    req.rData = { messages };
    next();
  };
  const addMessaging = async (req, res, next, transaction) => {
    console.log("MessageController => addMessaging");
    let { message, senderId, receiverId, colla_req_id, isMsgRead } = req.body;
    let data = {
      message,
      senderId,
      receiverId,
      colla_req_id,
      isMsgRead: false,
    };
    let lastMsgDate = new Date();
    let messages = await MessageService().createMessage(data, transaction);
    let collaboration = await MessageService().updateReqCollaboration(
      { id: colla_req_id },
      { lastMsgDate },
      transaction
    );
    req.rData = { messages, collaboration };
    next();
  };
  const isCollaReqInterestedUpdate = async (req, res, next, transaction) => {
    console.log("MessageController => isCollaReqInterestedUpdate");
    let {
      isRequestedStatus,
      message,
      colla_req_id,
      selectedTagId,
      requestedById,
      requestedToId,
    } = req.body;
    console.log("pppp ", req.body);
    let query = { colla_req_id, id: selectedTagId };
    let update_data = { isRequestedStatus: isRequestedStatus };
    let lastMsgDate = new Date();
    let reqTagsStatus = await MessageService().updateSelectedTagOnReqColl(
      query,
      update_data,
      transaction
    );
    let collaboration;
    if (isRequestedStatus == "1") {
      let data = {
        message,
        senderId: requestedById,
        receiverId: requestedToId,
        colla_req_id,
      };
      let messages = await MessageService().createMessage(data, transaction);
      collaboration = await MessageService().updateReqCollaboration(
        { id: colla_req_id },
        { lastMsgDate },
        transaction
      );
    }
    req.rData = { collaboration, reqTagsStatus };
    next();
  };

  const getAllReqCollAcceptedReject = async (req, res, next, transaction) => {
    console.log("MessageController => getAllReqCollAcceptedReject");
    let { isRequestedStatus, userId } = req.body;
    let query;
    if (isRequestedStatus) {
      query = { isRequestedStatus, userId };
    } else {
      query = { userId };
    }

    let collaReqList = await MessageService().getAllReqCollAcceptedReject(
      query,
      transaction
    );
    req.rData = { collaReqList };
    next();
  };

  const deleteReqCollaboration = async (req, res, next, transaction) => {
    console.log("MessageService => deleteReqCollaboration");
    let { id } = req.body;
    let delete_coll = await MessageService().deleteReqCollaboration(
      { id },
      transaction
    );
    req.rData = { delete_coll };
    next();
  };
  const deleteMessage = async (req, res, next, transaction) => {
    console.log("MessageService => deleteMessage");
    let { id } = req.body;
    let delete_msg = await MessageService().deleteMessage({ id }, transaction);
    req.rData = { delete_msg };
    next();
  };

  const getAllReqCollaboration = async (req, res, next, transaction) => {
    console.log("MessageController => getAllReqCollaboration");
    let collaboration = await MessageService().getAllReqCollaboration(
      {},
      transaction
    );
    req.rData = { collaboration };
    next();
  };

  return {
    newReqForCollaboration,
    getAllReqCollaboration,
    addMessaging,
    getAllMessagingByChatId,
    getAllCollaboratedListById,
    isCollaReqInterestedUpdate,
    getAllUserChatsInterested,
    getAllReqCollAcceptedReject,
    deleteReqCollaboration,
    deleteMessage,
    getAllUserChatsList,
  };
};
