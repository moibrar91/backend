const Sequelize = require('sequelize');
const { Op, QueryTypes } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {

    const createMeeting = (data,transaction=null) => {
        return new Promise(function(resolve, reject){
            models.user_meeting_details.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const addRequest = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_requests.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateRequest = (query, data, transaction = null) => {
        console.log("UserService => updateRequest")
        return new Promise(function (resolve, reject) {
            models.user_requests.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchRequestByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchRequestByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.user_requests.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }



    const requestList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("UserService => requestList")

        return new Promise(async function (resolve, reject) {
            console.log("filters")
            console.log(filters)
            let where = filters.isActive?{isActive:filters.isActive}:{isActive:true};
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%') };
            }
            if (filters.studentId) where.studentId = filters.studentId;
            if (filters.userId) where.userId = filters.userId;
            if (filters.status) where.status = filters.status;
            if (filters.createdAt) where.createdAt = filters.createdAt;
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
                    subQuery: false,
                    order: [
                        ['id', 'DESC']
                    ]
                }
            } else {
                query = {
                    where: where,
                    subQuery: false,
                    order: [
                        ['id', 'DESC']
                    ]
                }
            }
            let orm = models.user_requests.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countRequest = (where_query, transaction = null, scope = "defaultScope", col = "user_requests.id") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                subQuery: false,
                distinct: true,
                col,
                transaction
            };

            let orm = models.user_requests.scope(scope).count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const removeRequest = (query, transaction = null) => {
        console.log("UserService => removeRequest")
        return new Promise(function (resolve, reject) {
            models.user_requests.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addRequestTimeSlot = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_request_time_slots.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateRequestTimeSlot = (query, data, transaction = null) => {
        console.log("UserService => updateRequest")
        return new Promise(function (resolve, reject) {
            models.user_request_time_slots.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const removeRequestTimeSlot = (query, transaction = null) => {
        console.log("UserService => removeRequestTimeSlot")
        return new Promise(function (resolve, reject) {
            models.user_request_time_slots.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const savePaymentDetails = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.payment_details.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const paymentList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("UserService => paymentList")

        return new Promise(async function (resolve, reject) {
            console.log("filters")
            console.log(filters)
            let where = {};
            
            if (filters.userId) where.userId = filters.userId;
            
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
                        ['id', 'DESC']
                    ],
                    transaction
                }
            }
            let orm = models.payment_details.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    return {
        createMeeting,
        addRequest,
        updateRequest,
        fetchRequestByQuery,
        requestList,
        countRequest,
        removeRequest,
        addRequestTimeSlot,
        updateRequestTimeSlot,
        removeRequestTimeSlot,
        savePaymentDetails,
        paymentList
    }
}
