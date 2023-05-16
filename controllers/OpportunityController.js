const { Op } = require("sequelize");
const Sequelize = require('sequelize');
const OpportunityService = require("../services/OpportunityService");
const UserService = require("../services/UserService");
const helpers = require("../util/helpers");
const colors = require("colors");
const urlMetadata = require('url-metadata')
var validUrl = require('valid-url');
const ExcelJS = require('exceljs');
module.exports = () => {


  const addOpportunity = async (req, res, next, transaction) => {
    console.log("OpportunityController => addOpportunity");
    let { title, description, personaTag, collaborationTag, userId, opportunityId } = req.body;

    let opportunity_data = { title, description, personaTag, collaborationTag, userId };
    if (opportunityId) {
      let update_result = await OpportunityService().updateOpportunity({ id: opportunityId }, opportunity_data, transaction);
    } else {
      let add_result = await OpportunityService().addOpportunity(opportunity_data, transaction);
      opportunityId = add_result.id;
    }
  
    let opportunity = await OpportunityService().fetchOpportunityByQuery({ id: opportunityId }, transaction);
    req.rData = opportunity;
    next();
  }

  const getOpportunity = async (req, res, next, transaction) => {
    console.log("OpportunityController => getQuestion");

    let { userId } = req.body;
    let { opportunityId } = req.query;
    let query = { id: opportunityId };
    let opportunity = await OpportunityService().fetchOpportunityByQuery(query, transaction, "withUserFewDetails");
    let userBookmarked = userId ? await OpportunityService().fetchBookmarkedOpportunityByQuery({ userId, opportunityId }, transaction) : null;
    let isBookemarked = userBookmarked ? true : false;
    let userFlagged = userId ? await OpportunityService().fetchFlaggedOpportunityByQuery({ userId, opportunityId }, transaction) : null;
    let isFlagged = userFlagged ? true : false;
    let update_question_result = await OpportunityService().updateOpportunity({ id: opportunityId }, { total_view: Sequelize.literal('total_view + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
    // if (opportunity) opportunity = await fetchLikeOnCommentData(opportunity, userId, transaction)
    req.rData = { opportunity, isBookemarked, isFlagged };
    next();
  }

  const fetchLikeOnCommentData = async (data, userId, transaction) => {
    let { id, title, description, isActive, link, total_comment, total_like, total_unlike, total_share, createdAt, user_few_details, user_details, comments_list } = data
    let commentData = []
    for (var item of comments_list) {

      let { message, total_like, total_share, createdAt } = item;
      let commented_by = item.userId
      let commented_by_details = commented_by ? await UserService().fetchByQuery({ id: commented_by }, transaction, "studentDetailsWithDegreeAndWork") : null;
      
      let flag_query = { commentId: item.id, userId };
      let flag_exist = userId ? await OpportunityService().fetchOpportunityFlagCommentByQuery(flag_query, transaction) : null;
      let userLikeOnComment = userId ? await OpportunityService().fetchCommentLikeByQuery({ commentId: item.id, userId }, transaction) : null;
      let isLiked = userLikeOnComment?.isLiked ? true : false;
      if (!flag_exist) commentData.push({ id: item.id, message, user_details: commented_by_details, createdAt, total_like, total_share, isLiked });

    }
    let userLike = userId ? await OpportunityService().fetchQuestionLikeByQuery({ userId, opportunityId: id }, transaction) : null;

    let metadata = null;
    try {
      metadata = await (link && validUrl.isUri(link)) ? urlMetadata(link) : null;
    } catch {

    }
    let isLiked = (userLike && userLike.isLiked == "1") ? true : false;
    let isDisLiked = (userLike && userLike.isLiked == "0") ? true : false;
    return { id, first_name, last_name, image, date, title, description, isActive, link, metadata, total_comment, total_like, total_unlike, total_share, isLiked, isDisLiked, createdAt, user_details, user_few_details, admin_details, tagged_skills, comments_list: commentData };
  }

  const opportunityList = async (req, res, next, transaction) => {
    console.log("OpportunityController => opportunityList");
    
    let { userId } = req.body;
    let { search, page, limit, opportunity_type } = req.query;
    let filters = { search, page, limit, userId };
    let count_query = {};
    if (userId) count_query["$and"] = Sequelize.literal("(opportunities.id NOT IN (SELECT f_q.opportunityId FROM opportunity_flagged f_q WHERE f_q.userId=" + filters.userId + "))");
    if (opportunity_type == "1") {
      console.log("questiontype 1");
    }else if(opportunity_type == '3'){
      console.log("questiontype 3");
      filters.sortby = "total_like"
    }else if(opportunity_type == '4'){
      console.log("questiontype 4");
      filters.randomQuestion = "random"
    }else if(opportunity_type == '5'){
      console.log("questiontype 5");
      filters.sortby = "recent"
    }

    let opportunity_list = await OpportunityService().opportunityList(filters, transaction, "withAllDetails");
    console.log("lresponse");
    let total_opportunity = await OpportunityService().countOpportunity(count_query, transaction);
    if (opportunity_list.length > 0) opportunity_list = await fetchOpportunityData(opportunity_list, userId, transaction);
    console.log("rrresponse", );
    req.rData = { total_opportunity, opportunity_list };
    next();
  }

  const fetchOpportunityData = async (data, user_id, transaction) => {
    let opportunityData = []
    for (const item of data) {
      let { id, userId, title, description, isActive, personaTag, collaborationTag, total_comment, total_like, total_unlike, total_share, createdAt, user_details, comments_list, like_list } = item;
      let time = getTimeDifference(createdAt);
      let query = { userId: user_id, opportunityId: id };
      let userLike = user_id ? await OpportunityService().fetchOpportunityLikeByQuery(query, transaction) : null;
      let userComments = user_id ? await OpportunityService().fetchOpportunityCommentByQuery(query, transaction) : null;
      let userBookmarked = user_id ? await OpportunityService().fetchBookmarkedOpportunityByQuery(query, transaction) : null;
      user_details = userId ? await UserService().fetchByQuery({ id: userId }, transaction, "studentDetailsWithDegreeAndWork") : null;
      let isCommented = userComments ? true : false;
      let isLiked = (userLike && userLike.isLiked == "1") ? true : false;
      let isDisLiked = (userLike && userLike.isLiked == "0") ? true : false;
      let isBookemarked = userBookmarked ? true : false;
      opportunityData.push({ id, userId, title, description, isActive, personaTag, collaborationTag, total_comment, total_like, total_unlike, total_share, createdAt, isLiked, isDisLiked, isCommented, isBookemarked, time, user_details, comments_list, like_list });
    }

    return opportunityData;

  }

  const getTimeDifference = (fromDate) => {
    var startDate = new Date(fromDate);
    // Do your operations
    var endDate = new Date();
    var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    return convertHMS(seconds);
  }
  const convertHMS = (value) => {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
  }

  const addFlagOnOpportunity = async (req, res, next, transaction) => {
    console.log("OpportunityController => addFlag");
    let { userId, opportunityId } = req.body;
    let flag_data = { opportunityId, userId };
    let exist = await OpportunityService().fetchFlaggedOpportunityByQuery(flag_data, transaction);
    if (!exist) {
      let add_result = await OpportunityService().addFlagOnOpportunity(flag_data, transaction);
      let opportunity_details = await OpportunityService().fetchOpportunityByQuery({ id: opportunityId }, transaction, "withUserDetails");
      let userDetails = opportunity_details ? opportunity_details.user_basic_details : null;
      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " flagged your opportunity";
          let title = "Opportunity Notifications";
          let data = { title, body: msg, opportunityId }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }
    }
    next();
  }

  const addBookmarkOnOpportunity = async (req, res, next, transaction) => {
    console.log("OpportunityController => addBookmark");
    let { userId, opportunityId } = req.body;
    let bookmark_data = { opportunityId, userId };
    let exist = await OpportunityService().fetchBookmarkedOpportunityByQuery(bookmark_data, transaction);
    if (!exist) {
      let add_result = await OpportunityService().addBookmarkOnOpportunity(bookmark_data, transaction);
    } else {
      let remove_result = await OpportunityService().deleteBookmarkOpportunity(bookmark_data, transaction);

    }
    next();
  }

  const addCommentOnOpportunity = async (req, res, next, transaction) => {
    console.log("OpportunityController=>addCommentOnOpportunity");
    let { opportunityId, userId, message, commentId } = req.body;

    let data = { opportunityId, userId, message };
    if (commentId) {
      let update_result = await OpportunityService().updateOpportunityComment({ id: commentId }, data, transaction);
      req.msg = 'comment_updated';
    } else {
      let add_result = await OpportunityService().addOpportunityComment(data, transaction);
      let update_question_result = await OpportunityService().updateOpportunity({ id: opportunityId }, { total_comment: Sequelize.literal('total_comment + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      let update_user_result = await UserService().updateProfile(userId, { commented_count: Sequelize.literal('commented_count + 1') }, transaction);
      commentId = add_result.id;
      let opportunity_details = await OpportunityService().fetchOpportunityByQuery({ id: opportunityId }, transaction, "withUserDetails");
      let userDetails = opportunity_details ? opportunity_details.user_basic_details : null;
      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " added a comment to your opportunity";
          let title = "Opportunity Notifications";
          let data = { title, body: msg, opportunityId }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }
      req.msg = 'comment_added';
    }
    let comment_data = await OpportunityService().fetchOpportunityCommentByQuery({ id: commentId }, transaction);

    req.rData = { comment_data };
    next();
  }

  const addLikeOnOpportunity = async (req, res, next, transaction) => {
    console.log("OpportunityController => likeOpportunity");
    let { userId, opportunityId, isLiked } = req.body;
    console.log("req.body like => ", isLiked);
    if(isLiked==1) isLiked = true;
    if(isLiked==0) isLiked = false;
    let like_data = { opportunityId, userId, isLiked };
    console.log("like_data", isLiked === false);
    let exist = await OpportunityService().fetchOpportunityLikeByQuery({ opportunityId, userId }, transaction);
    if (!exist) {
      let add_result = await OpportunityService().likeOpportunity(like_data, transaction);
      let update_opportunity = (isLiked == true || isLiked == 1 ) ? { total_like: Sequelize.literal('total_like + 1') } : { total_unlike: Sequelize.literal('total_unlike + 1') };
      let update_opportunity_result = await OpportunityService().updateOpportunity({ id: opportunityId }, update_opportunity, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      let opportunity_details = await OpportunityService().fetchOpportunityByQuery({ id: opportunityId }, transaction, "withUserDetails");
      console.log("ravi", opportunity_details);
      let userDetails = opportunity_details ? opportunity_details.user_basic_details : null;
      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " liked your question";
          let title = "Question Notifications";
          let data = { title, body: msg, opportunityId }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }
      console.log("ravi");
    } else {
    console.log("exist => ",);
    let add_result = await OpportunityService().updateOpportunityLike({ id: exist.id }, like_data, transaction);
    
      if (exist.isLiked != isLiked) {
        let update_opportunity = (isLiked == true || isLiked == 1 ) ? { total_like: Sequelize.literal('total_like + 1'), total_unlike: Sequelize.literal('total_unlike - 1') } : { total_unlike: Sequelize.literal('total_unlike + 1'), total_like: Sequelize.literal('total_like - 1') };
        let update_opportunity_result = await OpportunityService().updateOpportunity({ id: opportunityId }, update_opportunity, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      }
    }

    if(isLiked == false){
      console.log("false");
      let remove_result = await OpportunityService().removeDisLikeOpportunity(like_data, transaction);
    }
    next();
  }

  const addLikeOnComment = async (req, res, next, transaction) => {
    console.log("OpportunityController => addLikeOnComment");
    let { userId, commentId, isLiked } = req.body;
    let like_data = { commentId, userId, isLiked };
    let exist = await OpportunityService().fetchCommentLikeByQuery({ commentId, userId }, transaction);
    if (!exist) {
      console.log('if not exist');
      let add_result = await OpportunityService().addLikeOnComment(like_data, transaction);
      let update_question_result = await OpportunityService().updateComment({ id: commentId }, { total_like: Sequelize.literal('total_like + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      let comment_details = await OpportunityService().fetchCommentByQuery({ id: commentId }, transaction, "withUserDetails");
      let userDetails = comment_details ? comment_details.user_details : null;
      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " liked your comment";
          let title = "Comment Notifications";
          let data = { title, body: msg, commentId }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }
    }
    else {
      console.log("exist => ",exist);
      if (exist.isLiked != isLiked) {
        let update_question = (isLiked == true || isLiked == 1 ) ? { total_like: Sequelize.literal('total_like + 1')} : { total_like: Sequelize.literal('total_like - 1') };
        let update_question_result = await OpportunityService().updateComment({ id: commentId }, update_question, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      }
        let update_comment_like = await OpportunityService().updateLikeOnComment({ commentId, userId }, {isLiked}, transaction); //,lastCommentAt:Sequelize.fn('NOW')
        
    }

    next();
  }

  const addFlagOnComment = async (req, res, next, transaction) => {
    console.log("OpportunityController => addFlagComment");
    let { userId, commentId } = req.body;
    let flag_data = { commentId, userId };
    let exist = await OpportunityService().fetchFlagCommentByQuery(flag_data, transaction);
    if (!exist) {
      let add_result = await OpportunityService().addFlagComment(flag_data, transaction);
      let comment_details = await OpportunityService().fetchCommentByQuery({ id: commentId }, transaction, "withUserDetails");
      let userDetails = comment_details ? comment_details.user_details : null;
      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " flagged your comment";
          let title = "Comment Notifications";
          let data = { title, body: msg, commentId }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }
    }
    next();
  }

  const removeOpportunity = async (req, res, next, transaction) => {
    console.log("AdminController => completeRequest");
    let { opportunityId } = req.body;
    let update_result = await OpportunityService().deleteQuestion({ id: opportunityId }, transaction);
    next();
  }
  const removeOpportunityComment = async (req, res, next, transaction) => {
    console.log("AdminController => completeRequest");
    let { commentId, opportunityId, userId } = req.body;
    let update_result = await OpportunityService().removeComment({ id: commentId }, transaction);
    if (update_result) {
      let update_question_result = await OpportunityService().updateQuestion({ id: opportunityId }, { total_comment: Sequelize.literal('total_comment - 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      let update_user_result = await UserService().updateProfile(userId, { commented_count: Sequelize.literal('commented_count - 1') }, transaction);
    }
    next();
  }

  const questionListForAdmin = async (req, res, next, transaction) => {
    console.log("OpportunityController => questionList");
    let { adminId } = req.body;
    let { search, page, limit, status } = req.query;
    let filters = { search, page, limit, status };
    let opportunity_list = await OpportunityService().questionList(filters, transaction, "withAllDetails");
    let total_opportunity = await OpportunityService().countQuestion({}, transaction);
    let total_active_question = await OpportunityService().countQuestion({ isActive: 1 }, transaction);
    let total_inactive_question = await OpportunityService().countQuestion({ isActive: 0 }, transaction);
    req.rData = { total_question, total_active_question, total_inactive_question, opportunity_list };

    next();
  }

  const getOpportunityDetails = async (req, res, next, transaction) => {
    console.log("OpportunityController => getQuestionDetails");
    let { adminId } = req.body;
    let { opportunityId } = req.query;
    let query = { id: opportunityId };
    let opportunity = await OpportunityService().fetchOpportunityByQuery(query, transaction, "withAllDetails");
    req.rData = { opportunity };
    next();
  }

  const activateDeactivateOpportunity = async (req, res, next, transaction) => {
    console.log("OpportunityController => activateDeactivateOpportunity");
    let { status, opportunityId } = req.body;
    let data = { isActive: status };
    let update_result = await OpportunityService().updateOpportunity({ id: opportunityId }, data, transaction);
    next();
  }

  const shareOpportunity = async (req, res, next, transaction) => {
    console.log("AdminController => completeRequest");
    let { opportunityId } = req.body;
    let update_question_result = await OpportunityService().updateOpportunity({ id: opportunityId }, { total_share: Sequelize.literal('total_share + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
    next();
  }

  return {
    addOpportunity,
    removeOpportunity,
    getOpportunity,
    opportunityList,
    addFlagOnOpportunity,
    addBookmarkOnOpportunity,
    addCommentOnOpportunity,
    addLikeOnOpportunity,
    addLikeOnComment,
    addFlagOnComment,
    questionListForAdmin,
    getOpportunityDetails,
    activateDeactivateOpportunity,
    removeOpportunityComment,
    shareOpportunity,
  }
}
