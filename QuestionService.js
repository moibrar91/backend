const Sequelize = require('sequelize');
const { Op, QueryTypes } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const addQuestion = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.questions.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateQuestion = (query, data, transaction = null) => {
        console.log("QuestionService => updatequest", data)
        return new Promise(function (resolve, reject) {
            models.questions.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const deleteQuestion = (query, transaction = null) => {
        console.log("QuestionService => delete", query)
        return new Promise(function (resolve, reject) {
            models.questions.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchQuestionByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService** => fetchQuestionByQuery", scope)
        return new Promise(function (resolve, reject) {
            
            let where_query = {
                where: query,
                transaction
            }
            /*where_query.include = [{
                model: models.flagged_questions,
                as: "flagged_status",
                scope:{userId:filters.userId}
            }];*/
            let orm = models.questions.scope(scope).findOne(where_query)

            orm.then(resolve).catch(reject);
        })
    }

    // const fetchQuestionByQueryForPublic = (query, transaction = null, scope = "defaultScope") => {
    //     console.log("QuestionService** => fetchQuestionByQuery", scope)
    //     return new Promise(function (resolve, reject) {
    //         // let search = query.title.toLowerCase();
    //         // console.log('qqq', query);
    //         let title = query;
    //         // console.log('qqq', title.title);
    //         let where = { "$questions.title$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('questions.title')), 'LIKE', '%' + title.title + '%') };
    //         // let query = { title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + title + '%') };
    //         let where_query = {
    //             where: where,
    //             transaction
    //         }
    //         // console.log('www',where_query);
    //         /*where_query.include = [{
    //             model: models.flagged_questions,
    //             as: "flagged_status",
    //             scope:{userId:filters.userId}
    //         }];*/
    //         let orm = models.questions.scope(scope).findOne(where_query)

    //         orm.then(resolve).catch(reject);
    //     })
    // }

    const questionList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => questionList", filters)

        return new Promise(async function (resolve, reject) {
            console.log("filters", filters.search)
            console.log(filters)
            let where = {isActive:true};
            let subQuery = true;
            let sortBy = 'id';
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { [Op.or]: [{ "$questions.title$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('questions.title')), 'LIKE', '%' + search + '%') }, { "$user_details.first_name$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('user_details.first_name')), 'LIKE', '%' + search + '%') }, { "$user_details.last_name$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('user_details.last_name')), 'LIKE', '%' + search + '%') }] };
                // where = { [Op.or]: [{ "$questions.title$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('questions.title')), 'LIKE', '%' + search + '%') }, { "$user_details.first_name$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('user_details.first_name')), 'LIKE', '%' + search + '%') }, { "$user_details.last_name$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('user_details.last_name')), 'LIKE', '%' + search + '%') }] };
                subQuery = false;
            }
            console.log(where , " oopppp ");
            if (filters.userId) {
                //where = { id: { [Op.notIn]: filters.question_ids } };
                //where["$flagged_status.questionId$"]=null;
                where["$and"]=  Sequelize.literal("(questions.id NOT IN (SELECT f_q.questionId FROM flagged_questions f_q WHERE f_q.userId=" + filters.userId + "))")
                
            }
            if (filters.skill_ids) {
               // where["$tagged_skills.skill_id$"] = { [Op.in]: filters.skill_ids };
                where["$and"]=  Sequelize.literal("(tagged_skills.skill_id IN (SELECT s_s.skill_id FROM student_skills s_s WHERE s_s.student_id=" + filters.userId + "))")
                subQuery = false;
            }
            if (filters.status) where.isActive = filters.status;
            else where.isActive = true;
            if (filters.userId && filters.type == "1") where.userId = filters.userId; //only asked question
            console.log("where11")
            console.log(where);
            if(filters.sortby == 'total_like'){
                sortBy = 'total_like';
            }else if(filters.sortby == 'recent'){
                sortBy = 'createdAt';
            }
            // console.log('random', filters.randomQuestion == 'random');
            let query = {};
            if (filters.page && filters.limit) {
                console.log(filters.page , filters.limit, " aaaaannnn", );
                let page = parseInt(filters.page);
                let limit = parseInt(filters.limit);
                let offset = (page - 1) * limit;
                query = {
                    limit : 10,
                    offset : 10 ,
                    where: where,
                    subQuery,
                    order: filters.randomQuestion == 'random' ? 
                        Sequelize.literal('rand()'):
                        [
                            [`${sortBy}`, 'DESC']
                        ]
                    ,
                    // order: [
                    //     [`${sortBy}`, 'DESC']
                    // ],
                    transaction
                }
            } else {
                query = {
                    where: where,
                    subQuery,
                    order: [
                        [`${sortBy}`, 'DESC']
                    ],
                    transaction
                }
            }

            let orm = models.questions.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const getAllQuestionList = () => {
        return new Promise(function (resolve, reject) {
            models.questions.findAll({})
                .then(resolve).catch(reject);
        })
        
    }

    const countQuestion = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                subQuery: false,
                distinct: true,
                col: 'questions.id',
                transaction
            };

            let orm = models.questions.scope(scope).count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const saveTaggedSkill = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.tagged_skills.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    
    const fetchTaggedSkillByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchTaggedSkillByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.tagged_skills.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteTaggedSkill = (query, transaction = null) => {
        console.log("UserService => deleteStudentDegree")
        return new Promise(function (resolve, reject) {
            models.tagged_skills.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchAllTaggedSkillByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchTaggedSkillByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.tagged_skills.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }
    const likeQuestion = (data, transaction = null) => {
        console.log("QuestionService => likeQuestion", data)
        return new Promise(function (resolve, reject) {
            models.question_likes.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchQuestionLikeByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchQuestionLikeByQuery", query)
        return new Promise(function (resolve, reject) {
            let orm = models.question_likes.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const updateQuestionLike = (query, data, transaction = null) => {
        console.log("QuestionService => updateQuestionLike", data)
        return new Promise(function (resolve, reject) {
            models.question_likes.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const removeDisLikeQuestion = (query, transaction = null) => {
        console.log("QuestionService => deleteQuestiondisLike")
        return new Promise(function (resolve, reject) {
            models.question_likes.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchAllQuestionLikeByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchAllQuestionLikeByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.question_likes.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }
    const fetchQuestionCommentByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchQuestionByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.question_comments.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }



    const likeQuestionList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => likeQuestionList")

        return new Promise(async function (resolve, reject) {
            let where = {};
            if (filters.userId){
                where["$and"]=  Sequelize.literal("(questionId NOT IN (SELECT f_q.questionId FROM flagged_questions f_q WHERE f_q.userId=" + filters.userId + "))")
                where.userId = filters.userId;
            }
            if (filters.isLiked) where.isLiked = filters.isLiked;
            console.log("where")
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
                    order: [
                        ['id', 'DESC']
                    ],
                    transaction
                }
            } else {
                query = {
                    where: where,
                    order: [
                        ['id', 'DESC']
                    ],
                    transaction
                }
            }

            let orm = models.question_likes.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }
    const fetchAllQuestionCommentByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchAllQuestionLikeByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.question_comments.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    

    const commentedQuestionList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => commentedQuestionList")

        return new Promise(async function (resolve, reject) {
            let where = {};
            if (filters.userId){
                where["$and"]=  Sequelize.literal("(question_comments.questionId NOT IN (SELECT f_q.questionId FROM flagged_questions f_q WHERE f_q.userId=" + filters.userId + "))")
                where.userId = filters.userId;
            }
            console.log("where")
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
                    order: [
                        ['id', 'DESC']
                    ],
                    transaction
                }
            } else {
                query = {
                    where: where,
                    order: [
                        ['id', 'DESC']
                    ],
                    transaction
                }
            }

            let orm = models.question_comments.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countQuestionComment = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                subQuery: false,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.question_comments.scope(scope).count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchBookmarkedQuestionByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchBookmarkedQuestionByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.bookmarked_questions.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const fetchFlaggedQuestionByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchFlaggedQuestionByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.flagged_questions.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addFlag = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.flagged_questions.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }


    const fetchAllFlaggedQuestionByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchAllFlaggedQuestionByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.flagged_questions.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addBookmark = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.bookmarked_questions.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchAllBookmarkQuestionByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchAllBookmarkQuestionByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.bookmarked_questions.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteBookmarkQuestion = (query, transaction = null) => {
        console.log("UserService => deleteBookmarkQuestion")
        return new Promise(function (resolve, reject) {
            models.bookmarked_questions.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const bookmarkQuestionList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => bookmarkQuestionList")

        return new Promise(async function (resolve, reject) {
            let where = {};
            if (filters.userId){
                where["$and"]=  Sequelize.literal("(bookmarked_questions.questionId NOT IN (SELECT f_q.questionId FROM flagged_questions f_q WHERE f_q.userId=" + filters.userId + "))")
                where.userId = filters.userId;
            }
            console.log("where")
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
                    order: [
                        ['id', 'DESC']
                    ],
                    transaction
                }
            } else {
                query = {
                    where: where,
                    order: [
                        ['id', 'DESC']
                    ],
                    transaction
                }
            }

            let orm = models.bookmarked_questions.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const addComment = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.question_comments.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateComment = (query, data, transaction = null) => {
        console.log("QuestionService => updateComment")
        return new Promise(function (resolve, reject) {
            models.question_comments.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchCommentByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchCommentByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.question_comments.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addLikeOnComment = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.comment_likes.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateLikeOnComment = (query, data, transaction = null) => {
        console.log("QuestionService => updateLikeOnComment")
        return new Promise(function (resolve, reject) {
            models.comment_likes.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchCommentLikeByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchCommentLikeByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.comment_likes.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }
    const fetchAllCommentLikeByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchAllCommentLikeByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.comment_likes.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addFlagComment = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.flagged_comments.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchFlagCommentByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("QuestionService => fetchFlagCommentByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.flagged_comments.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const removeComment = (query, transaction = null) => {
        console.log("UserService => deleteStudentDegree")
        return new Promise(function (resolve, reject) {
            models.question_comments.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    return {
        addQuestion,
        updateQuestion,
        deleteQuestion,
        fetchQuestionByQuery,
        // fetchQuestionByQueryForPublic,
        questionList,
        countQuestion,
        saveTaggedSkill,
        fetchTaggedSkillByQuery,
        deleteTaggedSkill,
        fetchAllTaggedSkillByQuery,
        likeQuestion,
        fetchQuestionLikeByQuery,
        updateQuestionLike,
        removeDisLikeQuestion,
        fetchAllQuestionLikeByQuery,
        likeQuestionList,
        fetchQuestionCommentByQuery,
        fetchAllQuestionCommentByQuery,
        commentedQuestionList,
        countQuestionComment,
        fetchBookmarkedQuestionByQuery,
        fetchFlaggedQuestionByQuery,
        addFlag,
        fetchAllFlaggedQuestionByQuery,
        addBookmark,
        fetchAllBookmarkQuestionByQuery,
        deleteBookmarkQuestion,
        bookmarkQuestionList,
        addComment,
        updateComment,
        updateLikeOnComment,
        fetchCommentByQuery,
        addLikeOnComment,
        fetchCommentLikeByQuery,
        fetchAllCommentLikeByQuery,
        addFlagComment,
        fetchFlagCommentByQuery,
        removeComment,
        getAllQuestionList
    }
}
