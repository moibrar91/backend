const Sequelize = require('sequelize');
const { Op, QueryTypes } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const addOpportunity = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.opportunities.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateOpportunity = (query, data, transaction = null) => {
        console.log("OpportunityService => updateopportunity", data)
        return new Promise(function (resolve, reject) {
            models.opportunities.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const deleteOpportunity = (query, transaction = null) => {
        console.log("OpportunityService => delete", query)
        return new Promise(function (resolve, reject) {
            models.opportunities.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchOpportunityByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService** => fetchOpportunityByQuery", scope)
        return new Promise(function (resolve, reject) {
            
            let where_query = {
                where: query,
                transaction
            }
            let orm = models.opportunities.scope(scope).findOne(where_query)

            orm.then(resolve).catch(reject);
        })
    }

    const opportunityList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => OpportunityList", filters)

        return new Promise(async function (resolve, reject) {
            console.log("filters", filters.search)
            console.log(filters)
            let where = {isActive:true};
            let subQuery = true;
            let sortBy = 'id';
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { [Op.or]: [{ "$opportunities.title$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('opportunities.title')), 'LIKE', '%' + search + '%') }, { "$user_details.first_name$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('user_details.first_name')), 'LIKE', '%' + search + '%') }, { "$user_details.last_name$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('user_details.last_name')), 'LIKE', '%' + search + '%') }] };
                subQuery = false;
            }
            console.log(where , " oopppp ");
            if (filters.userId) {
                where["$and"]=  Sequelize.literal("(opportunities.id NOT IN (SELECT f_q.opportunityId FROM opportunity_flagged f_q WHERE f_q.userId=" + filters.userId + "))")
                
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

            let orm = models.opportunities.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const getAllOpportunityList = () => {
        return new Promise(function (resolve, reject) {
            models.opportunities.findAll({})
                .then(resolve).catch(reject);
        })
        
    }

    const countOpportunity = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                subQuery: false,
                distinct: true,
                col: 'opportunities.id',
                transaction
            };

            let orm = models.opportunities.scope(scope).count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const likeOpportunity = (data, transaction = null) => {
        console.log("OpportunityService => likeOpportunity", data)
        return new Promise(function (resolve, reject) {
            models.opportunity_likes.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchOpportunityLikeByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchOpportunityLikeByQuery", query)
        return new Promise(function (resolve, reject) {
            let orm = models.opportunity_likes.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const updateOpportunityLike = (query, data, transaction = null) => {
        console.log("OpportunityService => updateOpportunityLike", data)
        return new Promise(function (resolve, reject) {
            models.opportunity_likes.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const removeDisLikeOpportunity = (query, transaction = null) => {
        console.log("OpportunityService => deleteOpportunitydisLike")
        return new Promise(function (resolve, reject) {
            models.opportunity_likes.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchAllOpportunityLikeByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchAllOpportunityLikeByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.opportunity_likes.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const likeOpportunityList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => likeOpportunityList")

        return new Promise(async function (resolve, reject) {
            let where = {};
            if (filters.userId){
                where["$and"]=  Sequelize.literal("(opportunityId NOT IN (SELECT f_q.opportunityId FROM opportunity_flagged f_q WHERE f_q.userId=" + filters.userId + "))")
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

            let orm = models.opportunity_likes.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }
    const fetchAllOpportunityCommentByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchAllOpportunityLikeByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.opportunity_comments.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    

    const commentedOpportunityList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => commentedOpportunityList")

        return new Promise(async function (resolve, reject) {
            let where = {};
            if (filters.userId){
                where["$and"]=  Sequelize.literal("(opportunity_comments.opportunityId NOT IN (SELECT f_q.opportunityId FROM opportunity_flagged f_q WHERE f_q.userId=" + filters.userId + "))")
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

            let orm = models.opportunity_comments.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countOpportunityComment = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                subQuery: false,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.opportunity_comments.scope(scope).count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchBookmarkedOpportunityByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchBookmarkedOpportunityByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.opportunity_bookmarks.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const fetchFlaggedOpportunityByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchFlaggedOpportunityByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.flagged_questions.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addFlagOnOpportunity = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.flagged_questions.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }


    const fetchAllFlaggedOpportunityByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchAllFlaggedOpportunityByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.flagged_questions.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addBookmarkOnOpportunity = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.opportunity_bookmarks.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchAllBookmarkQuestionByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchAllBookmarkOpportunityByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.opportunity_bookmarks.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteBookmarkOpportunity = (query, transaction = null) => {
        console.log("OpportunityService => deleteBookmarkOpportunity")
        return new Promise(function (resolve, reject) {
            models.opportunity_bookmarks.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const bookmarkOpportunityList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => bookmarkOpportunityList")

        return new Promise(async function (resolve, reject) {
            let where = {};
            if (filters.userId){
                where["$and"]=  Sequelize.literal("(opportunity_bookmarks.opportunityId NOT IN (SELECT f_q.opportunityId FROM opportunity_flagged f_q WHERE f_q.userId=" + filters.userId + "))")
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

            let orm = models.opportunity_bookmarks.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const addOpportunityComment = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.opportunity_comments.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateOpportunityComment = (query, data, transaction = null) => {
        console.log("OpportunityService => updateComment")
        return new Promise(function (resolve, reject) {
            models.opportunity_comments.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchOpportunityCommentByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchOpportunityCommentByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.opportunity_comments.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const fetchOpportunityFlagCommentByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("OpportunityService => fetchOpportunityFlagCommentByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.opportunity_flagged.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const removeOpportunityComment = (query, transaction = null) => {
        console.log("OpportunityService => deleteStudentDegree")
        return new Promise(function (resolve, reject) {
            models.opportunity_comments.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    return {
        addOpportunity,
        updateOpportunity,
        deleteOpportunity,
        fetchOpportunityByQuery,
        opportunityList,
        countOpportunity,
        likeOpportunity,
        fetchOpportunityLikeByQuery,
        updateOpportunityLike,
        removeDisLikeOpportunity,
        fetchAllOpportunityLikeByQuery,
        likeOpportunityList,
        fetchOpportunityCommentByQuery,
        fetchAllOpportunityCommentByQuery,
        commentedOpportunityList,
        countOpportunityComment,
        fetchBookmarkedOpportunityByQuery,
        fetchFlaggedOpportunityByQuery,
        addFlagOnOpportunity,
        fetchAllFlaggedOpportunityByQuery,
        addBookmarkOnOpportunity,
        fetchAllBookmarkQuestionByQuery,
        deleteBookmarkOpportunity,
        bookmarkOpportunityList,
        addOpportunityComment,
        updateOpportunityComment,
        fetchOpportunityFlagCommentByQuery,
        removeOpportunityComment,
        getAllOpportunityList
    }
}
