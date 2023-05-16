const { Op } = require("sequelize");
const Sequelize = require('sequelize');
const QuestionService = require("../services/QuestionService");
const UserService = require("../services/UserService");
const helpers = require("../util/helpers");
const colors = require("colors");
const urlMetadata = require('url-metadata')
var validUrl = require('valid-url');
const ExcelJS = require('exceljs');
module.exports = () => {


  const addQuestion = async (req, res, next, transaction) => {
    console.log("UserController => addQuestion");
    let { first_name, last_name, image, date, title, description, link, tagged_skills, userId, adminId, questionId } = req.body;
    try {
      if (tagged_skills) tagged_skills = JSON.parse(tagged_skills.replace(/\\/g, ""));
    } catch (e) {

    }
    let question_data = { first_name, last_name, image, date, title, description, link, userId, adminId };
    if (questionId) {
      let update_result = await QuestionService().updateQuestion({ id: questionId }, question_data, transaction);

    } else {
      let add_result = await QuestionService().addQuestion(question_data, transaction);
      questionId = add_result.id;
    }
    let skill_ids = [];
    console.log("tagggggg",tagged_skills);
    if (tagged_skills && tagged_skills.length > 0) skill_ids = await saveTaggedSkill(tagged_skills, questionId, transaction);
    if (skill_ids.length > 0) delete_result = await QuestionService().deleteTaggedSkill({ questionId, id: { [Op.notIn]: skill_ids } }, transaction);
    let question = await QuestionService().fetchQuestionByQuery({ id: questionId }, transaction);
    req.rData = question;
    next();
  }


  const saveTaggedSkill = async (data, questionId, transaction) => {
    let ids = [];
    for (const skill_id of data) {
      console.log("skill_id", skill_id);
      let tag_data = { questionId, skill_id };

      let exist = await QuestionService().fetchTaggedSkillByQuery(tag_data, transaction);
      // console.log("saveTaggedSkill",exist);
      if (!exist) {
        let result = await QuestionService().saveTaggedSkill(tag_data, transaction);
        ids.push(result.id)
        console.log("saveTaggedSkill result");
      } else {
        ids.push(exist.id)
        console.log("saveTaggedSkill else");
      }
    }
    console.log("saveTaggedSkill else",ids);
    return ids;

  }

  const getQuestion = async (req, res, next, transaction) => {
    console.log("UserController => getQuestion");

    let { userId } = req.body;
    let { questionId } = req.query;
    let query = { id: questionId };
    // let question = await QuestionService().fetchQuestionByQuery(query, transaction, "withAllDetails");
    // let question = await QuestionService().fetchQuestionByQuery(query, transaction, "withUserDetails");
    let question = await QuestionService().fetchQuestionByQuery(query, transaction, "withUserFewDetails");
    let userBookmarked = userId ? await QuestionService().fetchBookmarkedQuestionByQuery({ userId, questionId }, transaction) : null;
    let isBookemarked = userBookmarked ? true : false;
    let userFlagged = userId ? await QuestionService().fetchFlaggedQuestionByQuery({ userId, questionId }, transaction) : null;
    let isFlagged = userFlagged ? true : false;
    let update_question_result = await QuestionService().updateQuestion({ id: questionId }, { total_view: Sequelize.literal('total_view + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
    if (question) question = await fetchLikeOnCommentData(question, userId, transaction)
    req.rData = { question, isBookemarked, isFlagged };
    next();
  }
  // const getQuestionForPublic = async (req, res, next, transaction) => {
  //   console.log("UserController => getQuestion");

  //   let { userId } = req.body;
  //   let { questionId, title } = req.query;
  //   // let query = { id: questionId };
  //   // console.log('ttt',title);
  //   let query = {title : title.toLowerCase()};
  //   // userId=75;
    
  //   let question = await QuestionService().fetchQuestionByQueryForPublic(query, transaction, "withAllDetails");
  //   console.log('qqq',question.id);
  //   questionId = question.id;
  //   // userId = question.userId;
  //   let userBookmarked = userId ? await QuestionService().fetchBookmarkedQuestionByQuery({ userId, questionId }, transaction) : null;
  //   let isBookemarked = userBookmarked ? true : false;
  //   let userFlagged = userId ? await QuestionService().fetchFlaggedQuestionByQuery({ userId, questionId }, transaction) : null;
  //   let isFlagged = userFlagged ? true : false;
  //   let update_question_result = await QuestionService().updateQuestion({ id: questionId }, { total_view: Sequelize.literal('total_view + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
  //   if (question) question = await fetchLikeOnCommentData(question, userId, transaction)
  //   req.rData = { question, isBookemarked, isFlagged };
  //   next();
  // }


  const fetchLikeOnCommentData = async (data, userId, transaction) => {
    let { id, first_name, last_name, image, date, title, description, isActive, link, total_comment, total_like, total_unlike, total_share, createdAt, user_few_details, user_details, admin_details, tagged_skills, comments_list } = data
    let commentData = []
    for (var item of comments_list) {

      let { message, total_like, total_share, createdAt } = item;
      let commented_by = item.userId
      let commented_by_details = commented_by ? await UserService().fetchByQuery({ id: commented_by }, transaction, "studentDetailsWithDegreeAndWork") : null;
      
      let flag_query = { commentId: item.id, userId };
      let flag_exist = userId ? await QuestionService().fetchFlagCommentByQuery(flag_query, transaction) : null;
      // console.log("uuuuu", userId, " and ", item.id);
      let userLikeOnComment = userId ? await QuestionService().fetchCommentLikeByQuery({ commentId: item.id, userId }, transaction) : null;
      // console.log("likkk", userLikeOnComment);
      let isLiked = userLikeOnComment?.isLiked ? true : false;
      // console.log("likkk", isLiked);
      if (!flag_exist) commentData.push({ id: item.id, message, user_details: commented_by_details, createdAt, total_like, total_share, isLiked });

    }
    let userLike = userId ? await QuestionService().fetchQuestionLikeByQuery({ userId, questionId: id }, transaction) : null;

    let metadata = null;
    try {
      metadata = await (link && validUrl.isUri(link)) ? urlMetadata(link) : null;
    } catch {

    }
    let isLiked = (userLike && userLike.isLiked == "1") ? true : false;
    let isDisLiked = (userLike && userLike.isLiked == "0") ? true : false;
    return { id, first_name, last_name, image, date, title, description, isActive, link, metadata, total_comment, total_like, total_unlike, total_share, isLiked, isDisLiked, createdAt, user_details, user_few_details, admin_details, tagged_skills, comments_list: commentData };
  }

  const questionList = async (req, res, next, transaction) => {
    console.log("UserController => questionList");
    
    let { userId } = req.body;
    let { search, page, limit, question_type } = req.query;
    //let flagged_question = await QuestionService().fetchAllFlaggedQuestionByQuery({ userId }, transaction);
    //let question_ids = await flagged_question.length > 0 ? flagged_question.map(a => a.questionId) : [];
    //console.log("question_ids",question_ids);
    let filters = { search, page, limit, userId };
    let count_query = {};
    if (userId) count_query["$and"] = Sequelize.literal("(questions.id NOT IN (SELECT f_q.questionId FROM flagged_questions f_q WHERE f_q.userId=" + filters.userId + "))");
    if (question_type == "1") {
      let student_skills = await UserService().fetchStudentAllSkill({ student_id: userId }, transaction);
      let skill_ids = await student_skills.length > 0 ? student_skills.map(a => a.skill_id) : [];
      filters.skill_ids = skill_ids;
      if (userId) count_query["$and"] = Sequelize.literal("(tagged_skills.skill_id IN (SELECT s_s.skill_id FROM student_skills s_s WHERE s_s.student_id=" + filters.userId + "))")
    }else if(question_type == '3'){
      console.log("questiontype");
      filters.sortby = "total_like"
    }else if(question_type == '4'){
      console.log("questiontype");
      filters.randomQuestion = "random"
    }else if(question_type == '5'){
      console.log("questiontype");
      filters.sortby = "recent"
    }

    let question_list = await QuestionService().questionList(filters, transaction, "withAllDetails");
    console.log("lresponse");
    let total_question = await QuestionService().countQuestion(count_query, transaction);
    if (question_list.length > 0) question_list = await fetchQuestionData(question_list, userId, transaction);
    console.log("rrresponse", );
    req.rData = { total_question, question_list };
    next();
  }

  const  getAllQuestionInExcel = async(req, res, next) => {
    try {
      const question = await QuestionService().getAllQuestionList();
      

      var workbook = new ExcelJS.Workbook();
      var worksheet = workbook.addWorksheet('My Sheet');
      worksheet.columns = [
        { header: 'Question Id', key: 'question_id', width: 32 },
        { header: 'Title', key: 'title', width: 80 },
      ];

      for (var i = 0; i < question.length; i++) {
          worksheet.addRow({ question_id: question[i].id, title: question[i].title.trim().replace(/\s+/g, '-') }).alignment = { vertical: 'top', horizontal: 'left' };
      }

      var filename = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader("Content-Disposition", "attachment; filename=" + "QuestionList.xlsx");
      workbook.xlsx.write(res)
        .then(function (data) {
          res.end();
          console.log('File write done........');
        });
    }
    catch (err) {
      return next(err);
    }
  }

  const fetchQuestionData = async (data, user_id, transaction) => {
    let questionData = []
    for (const item of data) {
      let { id, userId, adminId, first_name, last_name, image, date, title, description, isActive, link, total_comment, total_like, total_unlike, total_share, createdAt, user_details, admin_details, comments_list, like_list, tagged_skills } = item;
      let time = getTimeDifference(createdAt);
      let query = { userId: user_id, questionId: id };
      let userLike = user_id ? await QuestionService().fetchQuestionLikeByQuery(query, transaction) : null;
      let userComments = user_id ? await QuestionService().fetchQuestionCommentByQuery(query, transaction) : null;
      let userBookmarked = user_id ? await QuestionService().fetchBookmarkedQuestionByQuery(query, transaction) : null;
      // let tagged_skills = await QuestionService().fetchAllTaggedSkillByQuery({questionId:id},transaction);
      user_details = userId ? await UserService().fetchByQuery({ id: userId }, transaction, "studentDetailsWithDegreeAndWork") : null;
      let metadata = null;
      try {
        metadata = await (link && validUrl.isUri(link)) ?  urlMetadata(link) : null;
      } catch {

      }
      let isCommented = userComments ? true : false;
      let isLiked = (userLike && userLike.isLiked == "1") ? true : false;
      let isDisLiked = (userLike && userLike.isLiked == "0") ? true : false;
      let isBookemarked = userBookmarked ? true : false;
      questionData.push({ id, userId, adminId, first_name, last_name, image, date, title, description, isActive, link, metadata, total_comment, total_like, total_unlike, total_share, createdAt, isLiked, isDisLiked, isCommented, isBookemarked, time, tagged_skills, user_details, admin_details, comments_list, like_list });
    }

    return questionData;

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

  const addFlag = async (req, res, next, transaction) => {
    console.log("UserController => addFlag");
    let { userId, questionId } = req.body;
    let flag_data = { questionId, userId };
    let exist = await QuestionService().fetchFlaggedQuestionByQuery(flag_data, transaction);
    if (!exist) {
      let add_result = await QuestionService().addFlag(flag_data, transaction);
      let question_details = await QuestionService().fetchQuestionByQuery({ id: questionId }, transaction, "withUserDetails");
      let userDetails = question_details ? question_details.user_basic_details : null;
      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " flagged your question";
          let title = "Question Notifications";
          let data = { title, body: msg, questionId }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }
    }
    next();
  }

  const addBookmark = async (req, res, next, transaction) => {
    console.log("UserController => addBookmark");
    let { userId, questionId } = req.body;
    let bookmark_data = { questionId, userId };
    let exist = await QuestionService().fetchBookmarkedQuestionByQuery(bookmark_data, transaction);
    if (!exist) {
      let add_result = await QuestionService().addBookmark(bookmark_data, transaction);
    } else {
      let remove_result = await QuestionService().deleteBookmarkQuestion(bookmark_data, transaction);

    }
    next();
  }

  const addCommentOnQuestion = async (req, res, next, transaction) => {
    console.log("PostController=>addCommentOnPost");
    let { questionId, userId, message, commentId } = req.body;

    let data = { questionId, userId, message };
    if (commentId) {
      let update_result = await QuestionService().updateComment({ id: commentId }, data, transaction);

      req.msg = 'comment_updated';
    } else {
      let add_result = await QuestionService().addComment(data, transaction);
      let update_question_result = await QuestionService().updateQuestion({ id: questionId }, { total_comment: Sequelize.literal('total_comment + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      let update_user_result = await UserService().updateProfile(userId, { commented_count: Sequelize.literal('commented_count + 1') }, transaction);
      commentId = add_result.id;
      let question_details = await QuestionService().fetchQuestionByQuery({ id: questionId }, transaction, "withUserDetails");
      let userDetails = question_details ? question_details.user_basic_details : null;
      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " added a comment to your question";
          let title = "Question Notifications";
          let data = { title, body: msg, questionId }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }
      req.msg = 'comment_added';
    }
    let comment_data = await QuestionService().fetchCommentByQuery({ id: commentId }, transaction);

    req.rData = { comment_data };
    next();
  }

  const likeQuestion = async (req, res, next, transaction) => {
    console.log("UserController => likeQuestion");
    let { userId, questionId, isLiked } = req.body;
    console.log("req.body like => ", isLiked);
    if(isLiked==1) isLiked = true;
    if(isLiked==0) isLiked = false;
    let like_data = { questionId, userId, isLiked };
    console.log("like_data", isLiked === false);
    let exist = await QuestionService().fetchQuestionLikeByQuery({ questionId, userId }, transaction);
    if (!exist) {
      let add_result = await QuestionService().likeQuestion(like_data, transaction);
      let update_question = (isLiked == true || isLiked == 1 ) ? { total_like: Sequelize.literal('total_like + 1') } : { total_unlike: Sequelize.literal('total_unlike + 1') };
      let update_question_result = await QuestionService().updateQuestion({ id: questionId }, update_question, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      let question_details = await QuestionService().fetchQuestionByQuery({ id: questionId }, transaction, "withUserDetails");
      console.log("ravi", question_details.id);
      let userDetails = question_details ? question_details.user_basic_details : null;
      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " liked your question";
          let title = "Question Notifications";
          let data = { title, body: msg, questionId }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }
      console.log("ravi");
    } else {
    console.log("exist => ",);
    let add_result = await QuestionService().updateQuestionLike({ id: exist.id }, like_data, transaction);
    
      if (exist.isLiked != isLiked) {
        let update_question = (isLiked == true || isLiked == 1 ) ? { total_like: Sequelize.literal('total_like + 1'), total_unlike: Sequelize.literal('total_unlike - 1') } : { total_unlike: Sequelize.literal('total_unlike + 1'), total_like: Sequelize.literal('total_like - 1') };
        let update_question_result = await QuestionService().updateQuestion({ id: questionId }, update_question, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      }
    }

    if(isLiked == false){
      console.log("false");
      let remove_result = await QuestionService().removeDisLikeQuestion(like_data, transaction);
    }
    next();
  }

  const addLikeOnComment = async (req, res, next, transaction) => {
    console.log("UserController => addLikeOnComment");
    let { userId, commentId, isLiked } = req.body;
    let like_data = { commentId, userId, isLiked };
    let exist = await QuestionService().fetchCommentLikeByQuery({ commentId, userId }, transaction);
    if (!exist) {
      console.log('if not exist');
      let add_result = await QuestionService().addLikeOnComment(like_data, transaction);
      let update_question_result = await QuestionService().updateComment({ id: commentId }, { total_like: Sequelize.literal('total_like + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      let comment_details = await QuestionService().fetchCommentByQuery({ id: commentId }, transaction, "withUserDetails");
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
        let update_question_result = await QuestionService().updateComment({ id: commentId }, update_question, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      }
        let update_comment_like = await QuestionService().updateLikeOnComment({ commentId, userId }, {isLiked}, transaction); //,lastCommentAt:Sequelize.fn('NOW')
        
    }

    next();
  }

  const addFlagOnComment = async (req, res, next, transaction) => {
    console.log("UserController => addFlagComment");
    let { userId, commentId } = req.body;
    let flag_data = { commentId, userId };
    let exist = await QuestionService().fetchFlagCommentByQuery(flag_data, transaction);
    if (!exist) {
      let add_result = await QuestionService().addFlagComment(flag_data, transaction);
      let comment_details = await QuestionService().fetchCommentByQuery({ id: commentId }, transaction, "withUserDetails");
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

  const removeQuestion = async (req, res, next, transaction) => {
    console.log("AdminController => completeRequest");
    let { questionId } = req.body;
    let update_result = await QuestionService().deleteQuestion({ id: questionId }, transaction);
    next();
  }
  const removeComment = async (req, res, next, transaction) => {
    console.log("AdminController => completeRequest");
    let { commentId, questionId, userId } = req.body;
    let update_result = await QuestionService().removeComment({ id: commentId }, transaction);
    if (update_result) {
      let update_question_result = await QuestionService().updateQuestion({ id: questionId }, { total_comment: Sequelize.literal('total_comment - 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
      let update_user_result = await UserService().updateProfile(userId, { commented_count: Sequelize.literal('commented_count - 1') }, transaction);
    }
    next();
  }

  const questionListForAdmin = async (req, res, next, transaction) => {
    console.log("UserController => questionList");
    let { adminId } = req.body;
    let { search, page, limit, status } = req.query;
    let filters = { search, page, limit, status };


    let question_list = await QuestionService().questionList(filters, transaction, "withAllDetails");

    let total_question = await QuestionService().countQuestion({}, transaction);
    let total_active_question = await QuestionService().countQuestion({ isActive: 1 }, transaction);
    let total_inactive_question = await QuestionService().countQuestion({ isActive: 0 }, transaction);
    //if(question_list.length>0) question_list = await fetchQuestionData(question_list,userId,transaction);
    req.rData = { total_question, total_active_question, total_inactive_question, question_list };

    next();
  }

  const getQuestionDetails = async (req, res, next, transaction) => {
    console.log("UserController => getQuestionDetails");
    let { adminId } = req.body;
    let { questionId } = req.query;
    let query = { id: questionId };
    let question = await QuestionService().fetchQuestionByQuery(query, transaction, "withAllDetails");
    req.rData = { question };
    next();
  }

  const activateDeactivateQuestion = async (req, res, next, transaction) => {
    console.log("QuestionController => activateDeactivateQuestion");
    let { status, questionId } = req.body;
    let data = { isActive: status };
    let update_result = await QuestionService().updateQuestion({ id: questionId }, data, transaction);
    next();
  }

  const shareQuestion = async (req, res, next, transaction) => {
    console.log("AdminController => completeRequest");
    let { questionId } = req.body;
    let update_question_result = await QuestionService().updateQuestion({ id: questionId }, { total_share: Sequelize.literal('total_share + 1') }, transaction); //,lastCommentAt:Sequelize.fn('NOW')
    next();
  }

  return {
    addQuestion,
    removeQuestion,
    getQuestion,
    // getQuestionForPublic,
    questionList,
    addFlag,
    addBookmark,
    addCommentOnQuestion,
    likeQuestion,
    addLikeOnComment,
    addFlagOnComment,
    questionListForAdmin,
    getQuestionDetails,
    activateDeactivateQuestion,
    removeComment,
    shareQuestion,
    getAllQuestionInExcel
  }
}
