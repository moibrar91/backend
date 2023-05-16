const Sequelize = require('sequelize');
const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {

    const fetch = (id, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetch")
        return new Promise(function (resolve, reject) {
            let query = {
                where: { id },
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                },
                transaction
            };


            let orm = models.admins.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchByEmail = (email, transaction = null) => {
        console.log("AdminService => fetchByEmail")
        return new Promise(function (resolve, reject) {
            let orm = models.admins.findOne({
                where: {
                    email
                },
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt", "deletedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const verifyPassword = (id, password, transaction = null) => {
        console.log("AdminService => verifyPassword")
        return new Promise(async function (resolve, reject) {
            let admins = await models.admins.findOne({
                where: { id },
                attributes: {
                    include: ["password"]
                },
                transaction
            })

            if (!admins) resolve(false);
            let v = await helpers().checkPassword(password, admins.password)

            return resolve(v);
        })
    }

    const updatePassword = (adminId, password, transaction = null) => {
        console.log("AdminService => update")
        return new Promise(function (resolve, reject) {
            models.admins.update(password, { where: { id: adminId }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const changeUserStatus = (userId, status, transaction = null) => {
        console.log("AdminService => changeUserStatus")
        return new Promise(function (resolve, reject) {
            models.users.update(status, { where: { id: userId }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const deleteUser = (userId, transaction = null) => {
        console.log("AdminService => deleteUser")
        return new Promise(function (resolve, reject) {
            models.users.destroy({ where: { id: userId }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addCareer = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.careers.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const addCareerPersonas = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.career_personas_lists.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const addCareerCollaboration = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.career_collaboration_lists.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const deleteCareerPersonas = (query, transaction = null) => {
        console.log("AdminService => deleteCareer ")
        return new Promise(function (resolve, reject) {
            models.career_personas_lists.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const deleteCareerCollaboration = (query, transaction = null) => {
        console.log("AdminService => deleteCareer ")
        return new Promise(function (resolve, reject) {
            models.career_collaboration_lists.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchCareerPeronas = () => {
        console.log("AdminService => fetchCareer")
        return new Promise(function (resolve, reject) {
            
            let orm = models.career_personas_lists.findAll()
            orm.then(resolve).catch(reject);
        })
    }
    const fetchCareerCollaboration = () => {
        console.log("AdminService => fetchCareer")
        return new Promise(function (resolve, reject) {
            
            let orm = models.career_collaboration_lists.findAll()
            orm.then(resolve).catch(reject);
        })
    }
    const fetchCareer = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchCareer")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                transaction
            };

            let orm = models.careers.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateCareer = (query, data, transaction = null) => {
        console.log("AdminService => updateCareer")
        return new Promise(function (resolve, reject) {
            models.careers.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    // const updateCareerPersonas = (query, data, transaction = null) => {
    //     console.log("AdminService => updateCareer")
    //     return new Promise(function (resolve, reject) {
    //         models.career_personas_list.update(data, { where: query, transaction })
    //             .then(resolve).catch(reject);
    //     })
    // }

    const deleteCareer = (query, transaction = null) => {
        console.log("AdminService => deleteCareer ")
        return new Promise(function (resolve, reject) {
            models.careers.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    

    const addSpeciality = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.specializations.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchSpeciality = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchSpeciality")
        return new Promise(function (resolve, reject) {
            let where = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };

            let orm = models.specializations.scope(scope).findOne(where)
            orm.then(resolve).catch(reject);
        })
    }

    const updateSpeciality = (query, data, transaction = null) => {
        console.log("AdminService => updateSpeciality")
        return new Promise(function (resolve, reject) {
            models.specializations.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const deleteSpeciality = (query, transaction = null) => {
        console.log("AdminService => deleteSpeciality")
        return new Promise(function (resolve, reject) {
            models.specializations.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addSkill = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.skills.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchSkill = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchSpeciality")
        return new Promise(function (resolve, reject) {
            let where = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };

            let orm = models.skills.scope(scope).findOne(where)
            orm.then(resolve).catch(reject);
        })
    }

    const updateSkill = (query, data, transaction = null) => {
        console.log("AdminService => updateSpeciality")
        return new Promise(function (resolve, reject) {
            models.skills.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const deleteSkill = (query, transaction = null) => {
        console.log("AdminService => deleteSkill")
        return new Promise(function (resolve, reject) {
            models.skills.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addCareerSkill = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.career_skills.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchCareerSkill = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchCareerSkill")
        return new Promise(function (resolve, reject) {
            let where = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };

            let orm = models.career_skills.scope(scope).findOne(where)
            orm.then(resolve).catch(reject);
        })
    }
    const deleteCareerSkill = (query, transaction = null) => {
        console.log("AdminService => deleteCareerSkill")
        return new Promise(function (resolve, reject) {
            models.career_skills.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const getAllSkillList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => getAllSkillList")
        return new Promise(function (resolve, reject) {

            let where = {};
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') };
            }
            if (filters.status) where.isActive = filters.status;
            if (filters.career_id) where["$career_path_relation.career_id$"] = filters.career_id;
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
            let orm = models.skills.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countSkill = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'skills.id',
                transaction
            };

            let orm = models.skills.scope(scope).count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const addEffectiveToolRelation = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.career_tool_relations.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchEffectiveToolRelation = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchEffectiveToolRelation")
        return new Promise(function (resolve, reject) {
            let where = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };

            let orm = models.career_tool_relations.scope(scope).findOne(where)
            orm.then(resolve).catch(reject);
        })
    }
    const deleteEffectiveToolRelation = (query, transaction = null) => {
        console.log("AdminService => deleteEffectiveToolRelation")
        return new Promise(function (resolve, reject) {
            models.career_tool_relations.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addEffectiveTool = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.tools.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const addAdmin = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.admins.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchAdmin = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchAdmin")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                transaction
            };

            let orm = models.admins.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateAdmin = (query, data, transaction = null) => {
        console.log("AdminService => updateCareer")
        return new Promise(function (resolve, reject) {
            models.admins.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addAdminRoles = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.sub_admin_roles.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchAdminRoles = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchAdminRoles")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                transaction
            };

            let orm = models.sub_admin_roles.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateAdminRoles = (query, data, transaction = null) => {
        console.log("AdminService => updateAdminRoles")
        return new Promise(function (resolve, reject) {
            models.sub_admin_roles.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const subAdminList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => subAdminList")

        return new Promise(async function (resolve, reject) {

            let where = { user_type: "sub-admin" };
            let order = filters.order_by ? filters.order_by : [['id', 'DESC']];
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%') };
            }
            if (filters.status) where.isActive = filters.status;
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
                    order,
                    transaction
                }
            } else {
                query = {
                    where: where,
                    order,
                    transaction
                }
            }
            let orm = models.admins.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countSubAdmin = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.admins.count(query)
            orm.then(resolve).catch(reject);
        })
    }
    const deleteSubAdmin = (query, transaction = null) => {
        console.log("AdminService => deleteSubAdmin")
        return new Promise(function (resolve, reject) {
            models.admins.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    /*--------------------------- withdrawal request -----------------------------*/


    const fetchWithdrawalRequest = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchWithdrawalRequests")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                transaction
            };

            let orm = models.wallet_payment_requests.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateWithdrawalRequest = (query, data, transaction = null) => {
        console.log("AdminService => updateWithdrawalRequest")
        return new Promise(function (resolve, reject) {
            models.wallet_payment_requests.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const withdrawalRequestList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => withdrawalRequestList")

        return new Promise(async function (resolve, reject) {

            let where = {};
            let order = filters.order_by ? filters.order_by : [['id', 'DESC']];
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { "$user_details.first_name$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('user_details.first_name')), 'LIKE', '%' + search + '%') };
            }
            if (filters.status) where.status = filters.status;
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
                    order,
                    transaction
                }
            } else {
                query = {
                    where: where,
                    subQuery: false,
                    order,
                    transaction
                }
            }
            let orm = models.wallet_payment_requests.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countWithdrawalRequest = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.wallet_payment_requests.count(query)
            orm.then(resolve).catch(reject);
        })
    }
    const deleteWithdrawalRequest = (query, transaction = null) => {
        console.log("AdminService => deleteWithdrawalRequest")
        return new Promise(function (resolve, reject) {
            models.wallet_payment_requests.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    /*-------------------------------- withdrawal request ------------------*/

    /*-------------------------------- FAQ ------------------*/

    const addFAQ = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.FAQs.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchFAQ = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchAdmin")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                transaction
            };

            let orm = models.FAQs.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateFAQ = (query, data, transaction = null) => {
        console.log("AdminService => updateCareer")
        return new Promise(function (resolve, reject) {
            models.FAQs.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const FAQList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => subAdminList")

        return new Promise(async function (resolve, reject) {

            let where = {};
            let order = filters.order_by ? filters.order_by : [['id', 'DESC']];
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { question: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('question')), 'LIKE', '%' + search + '%') };
            }
            if (filters.status) where.isActive = filters.status;
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
                    order,
                    transaction
                }
            } else {
                query = {
                    where: where,
                    order,
                    transaction
                }
            }
            let orm = models.FAQs.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countFAQ = (where_query, transaction = null) => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.FAQs.count(query)
            orm.then(resolve).catch(reject);
        })
    }
    const deleteFAQ = (query, transaction = null) => {
        console.log("AdminService => deleteFAQ")
        return new Promise(function (resolve, reject) {
            models.FAQs.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    /*-------------------------------- FAQ ------------------*/

    /*-------------------------------- Help support query ------------------*/

    const fetchQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchAdmin")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                transaction
            };

            let orm = models.FAQs.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateQuery = (query, data, transaction = null) => {
        console.log("AdminService => updateQuery")
        return new Promise(function (resolve, reject) {
            models.user_queries.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const queryList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => queryList")

        return new Promise(async function (resolve, reject) {

            let where = {};
            let order = filters.order_by ? filters.order_by : [['id', 'DESC']];
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { subject: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('subject')), 'LIKE', '%' + search + '%') };
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
                    order,
                    transaction
                }
            } else {
                query = {
                    where: where,
                    order,
                    transaction
                }
            }
            let orm = models.user_queries.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countQuery = (where_query, transaction = null) => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.user_queries.count(query)
            orm.then(resolve).catch(reject);
        })
    }
    /*-------------------------------- Help support query ------------------*/
    /*-------------------------------- Job type ------------------*/

    const addJobType = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.job_types.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchJobType = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchJobType")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                transaction
            };

            let orm = models.job_types.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateJobType = (query, data, transaction = null) => {
        console.log("AdminService => updateJobType")
        return new Promise(function (resolve, reject) {
            models.job_types.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const jobTypeList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => jobTypeList")

        return new Promise(async function (resolve, reject) {

            let where = {};
            let order = filters.order_by ? filters.order_by : [['id', 'DESC']];
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%') };
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
                    order,
                    transaction
                }
            } else {
                query = {
                    where: where,
                    order,
                    transaction
                }
            }
            let orm = models.job_types.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countJobType = (where_query, transaction = null) => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.job_types.count(query)
            orm.then(resolve).catch(reject);
        })
    }
    /*-------------------------------- Job type ------------------*/

    /*-------------------------------- Jobs ------------------*/

    const addJob = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.jobs.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchJob = (query, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => fetchJob")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                transaction
            };

            let orm = models.jobs.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateJob = (query, data, transaction = null) => {
        console.log("AdminService => updateJobType")
        return new Promise(function (resolve, reject) {
            models.jobs.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const jobList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("AdminService => jobList")

        return new Promise(async function (resolve, reject) {

            let where = {};
            let order = filters.order_by ? filters.order_by : [['id', 'DESC']];
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%') };
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
                    order,
                    transaction
                }
            } else {
                query = {
                    where: where,
                    order,
                    transaction
                }
            }
            let orm = models.jobs.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countJob = (where_query, transaction = null) => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'jobs.id',
                transaction
            };

            let orm = models.jobs.count(query)
            orm.then(resolve).catch(reject);
        })
    }
    /*-------------------------------- Jobs ------------------*/
    return {
        fetch,
        fetchByEmail,
        verifyPassword,
        updatePassword,
        changeUserStatus,
        deleteUser,
        addCareer,
        fetchCareer,
        updateCareer,
        deleteCareer,
        addSpeciality,
        fetchSpeciality,
        updateSpeciality,
        deleteSpeciality,
        addSkill,
        fetchSkill,
        updateSkill,
        deleteSkill,
        getAllSkillList,
        countSkill,
        addCareerSkill,
        fetchCareerSkill,
        deleteCareerSkill,
        addEffectiveToolRelation,
        fetchEffectiveToolRelation,
        deleteEffectiveToolRelation,
        addEffectiveTool,
        addAdmin,
        fetchAdmin,
        updateAdmin,
        addAdminRoles,
        fetchAdminRoles,
        updateAdminRoles,
        subAdminList,
        countSubAdmin,
        deleteSubAdmin,
        fetchWithdrawalRequest,
        updateWithdrawalRequest,
        withdrawalRequestList,
        countWithdrawalRequest,
        deleteWithdrawalRequest,
        addFAQ,
        fetchFAQ,
        updateFAQ,
        FAQList,
        countFAQ,
        deleteFAQ,
        fetchQuery,
        updateQuery,
        queryList,
        countQuery,
        addJobType,
        fetchJobType,
        updateJobType,
        jobTypeList,
        countJobType,
        addJob,
        fetchJob,
        updateJob,
        jobList,
        countJob,
        // updateCareerPersonas,
        addCareerPersonas,
        addCareerCollaboration,
        deleteCareerPersonas,
        deleteCareerCollaboration,
        fetchCareerPeronas,
        fetchCareerCollaboration
    }
}
