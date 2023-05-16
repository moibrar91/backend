const Sequelize = require('sequelize');
const { Op, QueryTypes } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {
    const add = (user, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.users.create(user, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const getUserEmail = (query, transaction = null) => {
        return new Promise(function (resolve, reject) {
            console.log(query, 'ravi*');
            models.users.scope('basic').findOne({where: query}, { transaction })
                .then(resolve).catch(reject);
        })
        
    }

    const fetch = (id, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetch")
        return new Promise(function (resolve, reject) {
            let query = {
                where: { id },
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };


            let orm = models.users.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateProfile = (userId, user, transaction = null) => {
        console.log("UserService => update")
        return new Promise(function (resolve, reject) {
            models.users.update(user, { where: { id: userId }, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchByQuery = (query, transaction = null, scope = "defaultScope", order = [["id", "desc"]]) => {
        console.log("UserService => fetchByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.users.scope(scope).findOne({
                where: query,
                //order,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const userList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("UserService => userList")
        console.log("filters =>", filters)

        return new Promise(async function (resolve, reject) {

            let where = { isProfileComplete: 1 };
            let subQuery = true;
            let order = filters.order_by ? filters.order_by : [['id', 'DESC']];
            if (filters.search) {
                let search = filters.search.toLowerCase();
                // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('career_list.career_details'))
                // Sequelize.literal("(career_list.career_details IN (SELECT career_details.title FROM career_list career_details WHERE career_details.title=" + '%' + search + '%' + "))"),
                // { "$career_list.career_details$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('career_list.career_details')), 'LIKE', '%' + search + '%') }

                where = { [Op.or]: [ { first_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('first_name')), 'LIKE', '%' + search + '%') }, { last_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('last_name')), 'LIKE', '%' + search + '%') } ] };
            }
            if (filters.service_id) {
                where["$service_list.service_id$"] = filters.service_id;
                subQuery = false;
            }
            if (filters.career) {
                // console.log('ravi', filters.career);
                where["$career_list.career_id$"] = filters.career;
                // where["$career_list.career_id$"] = 61;
                subQuery = false;
            }
            // console.log('ravi1', filters.career);
            if (filters.status) where.isActive = filters.status;
            if (filters.user_type) where.user_type = filters.user_type;
            console.log("where")
            console.log(where);
            let query = {};
            if (filters.page && filters.limit) {
                let page = parseInt(filters.page);
                let limit = parseInt(filters.limit);
                let offset = (page - 1) * limit;
                query = {
                    where: where,
                    subQuery,
                    order,
                    //group: ['`users.id'],
                    transaction,
                    limit,
                    offset
                }
            } else {
                query = {
                    where: where,
                    subQuery,
                    order,
                    // group: ['`users.id'],
                    transaction
                }
            }
            if (filters.career) {
                query.include = [{
                    model: models.user_careers,
                    as: "career_list"
                }]
            }
            let orm = models.users.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }
    // const userListTest = (filters, transaction = null, scope = "defaultScope") => {
    //     console.log("UserService => userList")
    //     console.log("filters =>", filters)

    //     return new Promise(async function (resolve, reject) {

    //         let where = { isProfileComplete: 1 };
    //         let search = filters.search.toLowerCase();
    //         if (filters.search) {
                
    //             // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('career_list.career_details'))
    //             // Sequelize.literal("(career_list.career_details IN (SELECT career_details.title FROM career_list career_details WHERE career_details.title=" + '%' + search + '%' + "))"),
    //             // { "$career_list.career_details$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('career_list.career_details')), 'LIKE', '%' + search + '%') }
    //             where = { [Op.or]: [ { first_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('first_name')), 'LIKE', '%' + search + '%') }, { last_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('last_name')), 'LIKE', '%' + search + '%') }, { "$career_list.career_id$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('career_list.career_id')), 'LIKE', '%' + search + '%') } ] };
    //         }
            
            
            
    //         // if (filters.career) {
    //         //     query.include = [{
    //         //         model: models.user_careers,
    //         //         as: "career_list"
    //         //     }]
    //         // }
    //         // let query = {};
    //         //     let page = parseInt(filters.page);
    //         //     let limit = parseInt(filters.limit);
    //         //     let offset = (page - 1) * limit;
    //         //     query = {
    //         //         where: where,
    //         //         transaction,
    //         //         limit,
    //         //         offset
    //         //     }

    //         // let orm = models.user_careers.scope(scope).findAll({
                
    //         //     include: [
    //         //         {
    //         //             model: models.careers,
    //         //             as:'career_details',
    //         //             // where:{ title : search},
    //         //             where:{ title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') }
    //         //             // where:{ "$career_details.title$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('career_details.title')), 'LIKE', '%' + search + '%') }
    //         //         }
    //         //     ]
    //         //   })
    //         let orm = models.careers.findOne({
    //             where:{ title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') },
    //             include: [
    //                 {
    //                     model: models.user_careers,
    //                     as: "user_career",
    //                     // where:{ title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') },
    //                     // where: {"career_details": []},
    //                     include: [
    //                         {
    //                             model: models.user,
    //                             as:'user_details',
    //                             // where:{ title : search},
    //                             // where:{ title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') }
    //                             // where:{ "$career_details.title$": Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('career_details.title')), 'LIKE', '%' + search + '%') }
    //                         }
    //                     ] 
    //                 }
    //             ]
    //           })

    //         orm.then(resolve).catch(reject);
    //     })
    // }

    const countUserWithFilter = (filters, transaction = null) => {
        console.log("UserService => countUserWithFilter")

        return new Promise(async function (resolve, reject) {
            where = {};
            if (filters.search) where = { [Op.or]: [{ first_name: { [Op.like]: '%' + filters.search + '%' } }, { last_name: { [Op.like]: '%' + filters.search + '%' } }] };
            if (filters.status) where.isActive = filters.status;
            console.log("where")
            console.log(where);
            let query = {
                where: where,
                distinct: true,
                col: 'id',
            }
            let orm = models.users.count(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countUser = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.users.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const getUserDetails = (id, transaction = null, scope = "defaultScope") => {
        console.log("UserService => getUserDetails")
        return new Promise(function (resolve, reject) {
            let query = {
                where: { id },
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"],
                    include: [['id', 'userId']]
                },
                transaction
            };


            let orm = models.users.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const removeUser = (query, transaction = null) => {
        console.log("UserService => removeUser")
        return new Promise(function (resolve, reject) {
            models.users.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const verifyPassword = (id, password, transaction = null) => {
        console.log("UserService => verifyPassword")
        return new Promise(async function (resolve, reject) {
            let user = await models.users.findOne({
                where: { id },
                attributes: {
                    include: ["password"]
                },
                transaction
            })

            if (!user) resolve(false);
            let v = await helpers().checkPassword(password, user.password)

            // console.log(v, 'vvvvvvvvvvvvvvvvvvvvv');
            return resolve(v);
        })
    }

    const addStudentAmbassador = (user, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.student_ambassadors.create(user, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchStudentAmmbassador = (query, transaction = null) => {
        console.log("UserService => fetchStudentAmmbassador")
        return new Promise(function (resolve, reject) {
            let orm = models.student_ambassadors.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addTeamRequest = (request, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.team_requests.create(request, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchTeamRequest = (query, transaction = null) => {
        console.log("UserService => fetchTeamRequest")
        return new Promise(function (resolve, reject) {
            let orm = models.team_requests.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addCollegePartnership = (user, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.college_partnerships.create(user, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchCollegePartnership = (query, transaction = null) => {
        console.log("UserService => fetchCollegePartnership")
        return new Promise(function (resolve, reject) {
            let orm = models.college_partnerships.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addAdvertisement = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.advertisements.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchAdvertisement = (query, transaction = null) => {
        console.log("UserService => fetchAdvertisement")
        return new Promise(function (resolve, reject) {
            let orm = models.advertisements.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addInvestorRelations = (user, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.investor_relations.create(user, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchInvestorRelations = (query, transaction = null) => {
        console.log("UserService => fetchInvestorRelations ")
        return new Promise(function (resolve, reject) {
            let orm = models.investor_relations.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addEarlyJoin = (user, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.join_early_users.create(user, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchEarlyJoin = (query, transaction = null) => {
        console.log("UserService => fetchEarlyJoin ")
        return new Promise(function (resolve, reject) {
            let orm = models.join_early_users.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addStudentDegree = (user, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.student_degree_infos.create(user, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchStudentDegree = (query, transaction = null) => {
        console.log("UserService => fetchStudentDegree")
        return new Promise(function (resolve, reject) {
            let orm = models.student_degree_infos.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteStudentDegree = (query, transaction = null) => {
        console.log("UserService => deleteStudentDegree")
        return new Promise(function (resolve, reject) {
            models.student_degree_infos.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addStudentCareerInfo = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.student_career_infos.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    // const updateStudentCareerInfo = (query, data, transaction = null) => {
    //     return new Promise(function (resolve, reject) {
    //         models.student_career_infos.update(data, { where: query, transaction })
    //             .then(resolve).catch(reject);
    //     })
    // }

    const fetchAllStudentCareerInfo = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchAllStudentCareerInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.student_career_infos.scope(scope).findAll({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }
    const fetchStudentCareerInfo = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchStudentCareerInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.student_career_infos.scope(scope).findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteStudentCareerInfo = (query, transaction = null) => {
        console.log("UserService => deleteStudentCareerInfo")
        return new Promise(function (resolve, reject) {
            models.student_career_infos.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addStudentSpecialization = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.student_specializations.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    // const updateStudentSpecialization = (specialization_info, query, transaction = null) => {
    //     return new Promise(function (resolve, reject) {
    //         models.student_specializations.update(specialization_info, { where: query, transaction })
    //             .then(resolve).catch(reject);
    //     })
    // }

    const fetchStudentSpecialization = (query, transaction = null) => {
        console.log("UserService => fetchStudentSpecialization")
        return new Promise(function (resolve, reject) {
            let orm = models.student_specializations.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteStudentSpecialization = (query, transaction = null) => {
        console.log("UserService => deleteStudentSpecialization")
        return new Promise(function (resolve, reject) {
            models.student_specializations.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addStudentSkill = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.student_skills.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchStudentSkill = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchStudentSkills")
        return new Promise(function (resolve, reject) {
            let where = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };

            let orm = models.student_skills.scope(scope).findOne(where)
            orm.then(resolve).catch(reject);
        })
    }

    const fetchStudentAllSkill = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchStudentAllSkill")
        return new Promise(function (resolve, reject) {
            let where = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };

            let orm = models.student_skills.scope(scope).findAll(where)
            orm.then(resolve).catch(reject);
        })
    }

    const deleteStudentSkill = (query, transaction = null) => {
        console.log("UserService => deleteStudentSkill")
        return new Promise(function (resolve, reject) {
            models.student_skills.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addSkill = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.skills.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const getAllSpecialityList = (filters, transaction = null) => {
        console.log("UserService => getAllSpecialityList")
        return new Promise(function (resolve, reject) {
            let where = {};
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') };
            }
            if (filters.status) where.isActive = filters.status;
            if (filters.career_id) where.career_id = filters.career_id;
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
            let orm = models.specializations.findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countSpeciality = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.specializations.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const getAllCareerList = (filters, transaction = null) => {
        console.log("UserService => getAllCareerList")
        return new Promise(function (resolve, reject) {

            let where = {};
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') };
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
                    subQuery: false,
                    order: [
                        ['title', 'ASC']
                    ],
                    transaction
                }
            } else {
                query = {
                    where: where,
                    subQuery: false,
                    order: [
                        ['title', 'ASC']
                    ],
                    transaction
                }
            }
            let orm = models.careers.findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countCareer = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.careers.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const getAllSkillList = (filters, transaction = null) => {
        console.log("UserService => getAllSkillList")
        return new Promise(function (resolve, reject) {

            let where = {};
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') };
            }
            if (filters.skill_type) where.skill_type = filters.skill_type;
            if (filters.status) where["$skill_details.isActive$"] = filters.status;
            if (filters.career_id && filters.career_id.length > 0) where.career_id = { [Op.in]: filters.career_id };
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
            let orm = models.career_skills.findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countSkill = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                distinct: true,
                col: 'id',
                transaction
            };

            let orm = models.skills.count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const addCounsellerDetails = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.counsellers_details.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchCounsellerDetails = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchCounsellerDetails")
        return new Promise(function (resolve, reject) {
            let where = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };

            let orm = models.counsellers_details.scope(scope).findOne(where)
            orm.then(resolve).catch(reject);
        })
    }

    const updateCounsellerDetails = (query, data, transaction = null) => {
        console.log("UserService => updateCounsellerDetails")
        return new Promise(function (resolve, reject) {
            models.counsellers_details.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addRecruiterDetails = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.recruiter_details.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchRecruiterDetails = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchRecruiterDetails")
        return new Promise(function (resolve, reject) {
            let where = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };

            let orm = models.recruiter_details.scope(scope).findOne(where)
            orm.then(resolve).catch(reject);
        })
    }

    const updateRecruiterDetails = (query, data, transaction = null) => {
        console.log("UserService => updateCounsellerDetails")
        return new Promise(function (resolve, reject) {
            models.recruiter_details.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addCertificate = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.certificates.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateCertificate = (query, data, transaction = null) => {
        console.log("UserService => update")
        return new Promise(function (resolve, reject) {
            models.certificates.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchCertificateByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchCertificateByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.certificates.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const certificateList = (filters, transaction = null, scope = "defaultScope") => {
        console.log("UserService => certificateList")

        return new Promise(async function (resolve, reject) {
            console.log("filters")
            console.log(filters)
            let where = {};
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%') };
            }
            if (filters.userId) where.userId = filters.userId;
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
            let orm = models.certificates.scope(scope).findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const countCertificate = (where_query, transaction = null, scope = "defaultScope") => {
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                subQuery: false,
                distinct: true,
                col: 'certificates.id',
                transaction
            };

            let orm = models.certificates.scope(scope).count(query)
            orm.then(resolve).catch(reject);
        })
    }

    const deleteCertificate = (query, transaction = null) => {
        console.log("UserService => deleteCertificate")
        return new Promise(function (resolve, reject) {
            models.certificates.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const saveCertificateTaggedSkill = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.certificate_tagged_skills.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const fetchCertificateTaggedSkillByQuery = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchCertificateTaggedSkillByQuery")
        return new Promise(function (resolve, reject) {
            let orm = models.certificate_tagged_skills.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteCertificateTaggedSkill = (query, transaction = null) => {
        console.log("UserService => deleteCertificateTaggedSkill")
        return new Promise(function (resolve, reject) {
            models.certificate_tagged_skills.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }



    const addUserCareerInfo = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_careers.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchUserCareerInfo = (query, transaction = null) => {
        console.log("UserService => fetchUserCareerInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.user_careers.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteUserCareerInfo = (query, transaction = null) => {
        console.log("UserService => deleteUserCareerInfo")
        return new Promise(function (resolve, reject) {
            models.user_careers.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addUserProjectInfo = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_project_info.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateUserProjectInfo = (query, data, transaction = null) => {
        console.log("UserService => updateUserProjectInfo")
        return new Promise(function (resolve, reject) {
            models.user_project_info.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchUserProjectInfo = (query, transaction = null) => {
        console.log("UserService => fetchUserCareerInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.user_project_info.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteUserProjectInfo = (query, transaction = null) => {
        console.log("UserService => deleteUserCareerInfo")
        return new Promise(function (resolve, reject) {
            models.user_project_info.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addSocialMediaLinks = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.social_media_links.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateSocialMediaLinks = (query, data, transaction = null) => {
        console.log("UserService => updateSocialMediaLinks")
        return new Promise(function (resolve, reject) {
            models.social_media_links.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const deleteSocialMediaLinks = (query, transaction = null) => {
        console.log("UserService => deleteSocialMediaLinks ")
        return new Promise(function (resolve, reject) {
            models.social_media_links.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchAllSocialMediaLinks = () => {
        console.log("UserService => fetchAllSocialMediaLinks")
        return new Promise(function (resolve, reject) {
            
            let orm = models.social_media_links.findAll()
            orm.then(resolve).catch(reject);
        })
    }

    const addUserSocialMedia = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_social_media.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateUserSocialMedia = (query, data, transaction = null) => {
        console.log("UserService => updateUserSocialMedia")
        return new Promise(function (resolve, reject) {
            models.user_social_media.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchUserSocialMedia = (query, transaction = null) => {
        console.log("UserService => fetchUserCareerInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.user_social_media.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteUserSocialMedia = (query, transaction = null) => {
        console.log("UserService => deleteUserCareerInfo")
        return new Promise(function (resolve, reject) {
            models.user_social_media.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const addUserPersonasInfo = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_personas.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateUserPersonaInfo = (query, data, transaction = null) => {
        console.log("UserService => updateUserPersonaInfo")
        return new Promise(function (resolve, reject) {
            models.user_personas.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchUserPersonasInfo = (query, transaction = null) => {
        console.log("UserService => fetchUserCareerInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.user_personas.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteUserPersonasInfo = (query, transaction = null) => {
        console.log("UserService => deleteUserCareerInfo")
        return new Promise(function (resolve, reject) {
            models.user_personas.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    
    const addUserCollaborationInfo = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_collaborations.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateUserCollaborationInfo = (query, data, transaction = null) => {
        console.log("UserService => updateUserCollaborationInfo")
        return new Promise(function (resolve, reject) {
            models.user_collaborations.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchUserCollaborationInfo = (query, transaction = null) => {
        console.log("UserService => fetchUserCareerInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.user_collaborations.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteUserCollaborationInfo = (query, transaction = null) => {
        console.log("UserService => deleteUserCareerInfo")
        return new Promise(function (resolve, reject) {
            models.user_collaborations.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchUserAllCareerInfo = (query, transaction = null) => {
        console.log("UserService => fetchUserAllCareerInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.user_careers.findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const addUserSkill = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_skills.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchUserSkill = (query, transaction = null) => {
        console.log("UserService => fetchUserSkill")
        return new Promise(function (resolve, reject) {
            let orm = models.user_skills.findOne({
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteUserSkill = (query, transaction = null) => {
        console.log("UserService => deleteUserSkill")
        return new Promise(function (resolve, reject) {
            models.user_skills.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addUserServiceInfo = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_services.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateUserServiceInfo = (query, data, transaction = null) => {
        console.log("UserService => updateUserServiceInfo")
        return new Promise(function (resolve, reject) {
            models.user_services.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchUserServiceInfo = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchUserServiceInfo")
        return new Promise(function (resolve, reject) {
            let orm = models.user_services.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteUserServiceInfo = (query, transaction = null) => {
        console.log("UserService => deleteUserServiceInfo")
        return new Promise(function (resolve, reject) {
            models.user_services.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const getAllServiceList = (filters, transaction = null) => {
        console.log("UserService => getAllServiceList")
        return new Promise(function (resolve, reject) {

            let where = {};
            if (filters.user_type) where = { [Op.or]: [{ service_for: filters.user_type }, { service_for: "both" }] };
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') };
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
            let orm = models.services.findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const addStudentWorkExperience = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.student_work_experiences.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateStudentWorkExperience = (query, data, transaction = null) => {
        console.log("UserService => updateStudentWorkExperience")
        return new Promise(function (resolve, reject) {
            models.student_work_experiences.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchStudentWorkExperience = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchStudentWorkExperience")
        return new Promise(function (resolve, reject) {
            let orm = models.student_work_experiences.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }
    const fetchAllStudentWorkExperience = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchAllStudentWorkExperience")
        return new Promise(function (resolve, reject) {
            let orm = models.student_work_experiences.scope(scope).findAll({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteStudentWorkExperience = (query, transaction = null) => {
        console.log("UserService => deleteStudentWorkExperience")
        return new Promise(function (resolve, reject) {
            models.student_work_experiences.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addWorkExperienceMedia = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.student_work_experience_media.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateWorkExperienceMedia = (query, data, transaction = null) => {
        console.log("UserService => updateWorkExperienceMedia")
        return new Promise(function (resolve, reject) {
            models.student_work_experience_media.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const fetchWorkExperienceMedia = (query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetchWorkExperienceMedia")
        return new Promise(function (resolve, reject) {
            let orm = models.student_work_experience_media.scope(scope).findOne({
                where: query,
                transaction
            })

            orm.then(resolve).catch(reject);
        })
    }

    const deleteWorkExperienceMedia = (query, transaction = null) => {
        console.log("UserService => deleteWorkExperienceMedia")
        return new Promise(function (resolve, reject) {
            models.student_work_experience_media.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const deleteOTPAndToken = (query, transaction = null) => {
        console.log("UserService => deleteWorkExperienceMedia")
        return new Promise(function (resolve, reject) {
            models.user_OTP_and_tokens.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const addOTPAndToken = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_OTP_and_tokens.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const getOTPAndToken = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => fetch")
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };


            let orm = models.user_OTP_and_tokens.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateOTPAndToken = (query, data, transaction = null) => {
        console.log("UserService => updateFamilyMemberProfile")
        return new Promise(function (resolve, reject) {
            models.user_OTP_and_tokens.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addRating = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.user_ratings.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const getUserRequestCompleted = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => getRating")
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };


            let orm = models.user_requests.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }
    const getRating = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => getRating")
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };


            let orm = models.user_ratings.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateRating = (query, data, transaction = null) => {
        console.log("UserService => updateRating")
        return new Promise(function (resolve, reject) {
            models.user_ratings.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const getAllRatingList = (filters, transaction = null) => {
        console.log("UserService => getAllRatingList")
        return new Promise(function (resolve, reject) {

            let where = {};
            if (filters.search) {
                let search = filters.search.toLowerCase();
                where = { title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + search + '%') };
            }
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
            let orm = models.user_ratings.findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const addStudentContactDetails = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.student_contact_details.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const getStudentContactDetails = (where_query, transaction = null, scope = "defaultScope") => {
        console.log("UserService => getStudentContactDetails")
        return new Promise(function (resolve, reject) {
            let query = {
                where: where_query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            };


            let orm = models.student_contact_details.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateStudentContactDetails = (query, data, transaction = null) => {
        console.log("UserService => updateStudentContactDetails")
        return new Promise(function (resolve, reject) {
            models.student_contact_details.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    // const updateServiceList = (query, data, transaction = null) => {
    //     console.log("UserService => updateStudentContactDetails")
    //     return new Promise(function (resolve, reject) {
    //         models.services.update({title : "Resume/C.V Guidance"}, { where: {id: 7}, transaction })
    //             .then(resolve).catch(reject);
    //     })
    // }
    
    const addUserWalletPayment = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.wallet_payments.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    
    const addUserWalletPaymentRequest = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.wallet_payment_requests.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    
    const addAdminEarning = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.admin_earnings.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    
    const addUserQuery = (data, transaction = null) => {
        return new Promise(function(resolve, reject){
            models.user_queries.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    return {
        add,
        getUserEmail,
        fetch,
        updateProfile,
        fetchByQuery,
        userList,
        deleteOTPAndToken,
        // userListTest,
        countUser,
        countUserWithFilter,
        getUserDetails,
        removeUser,
        verifyPassword,
        addStudentAmbassador,
        fetchStudentAmmbassador,
        addTeamRequest,
        fetchTeamRequest,
        addCollegePartnership,
        fetchCollegePartnership,
        addAdvertisement,
        fetchAdvertisement,
        addInvestorRelations,
        fetchInvestorRelations,
        addEarlyJoin,
        fetchEarlyJoin,
        addStudentDegree,
        fetchStudentDegree,
        deleteStudentDegree,
        addStudentCareerInfo,
        // updateStudentSpecialization,
        fetchStudentCareerInfo,
        deleteStudentCareerInfo,
        addStudentSpecialization,
        fetchStudentSpecialization,
        deleteStudentSpecialization,
        addStudentSkill,
        fetchStudentSkill,
        fetchStudentAllSkill,
        deleteStudentSkill,
        addSkill,
        getAllSpecialityList,
        countSpeciality,
        getAllCareerList,
        countCareer,
        getAllSkillList,
        countSkill,
        addCounsellerDetails,
        fetchCounsellerDetails,
        updateCounsellerDetails,
        addRecruiterDetails,
        fetchRecruiterDetails,
        updateRecruiterDetails,
        addCertificate,
        updateCertificate,
        fetchCertificateByQuery,
        certificateList,
        countCertificate,
        deleteCertificate,
        saveCertificateTaggedSkill,
        fetchCertificateTaggedSkillByQuery,
        deleteCertificateTaggedSkill,
        addUserCareerInfo,
        fetchUserCareerInfo,
        fetchUserAllCareerInfo,
        deleteUserCareerInfo,
        addUserSkill,
        fetchUserSkill,
        deleteUserSkill,
        addUserServiceInfo,
        updateUserServiceInfo,
        fetchUserServiceInfo,
        deleteUserServiceInfo,
        getAllServiceList,
        // updateServiceList,
        addStudentWorkExperience,
        updateStudentWorkExperience,
        fetchStudentWorkExperience,
        fetchAllStudentWorkExperience,
        deleteStudentWorkExperience,
        addWorkExperienceMedia,
        updateWorkExperienceMedia,
        fetchWorkExperienceMedia,
        deleteWorkExperienceMedia,
        addOTPAndToken,
        getOTPAndToken,
        updateOTPAndToken,
        addRating,
        getRating,
        updateRating,
        getAllRatingList,
        addStudentContactDetails,
        getStudentContactDetails,
        updateStudentContactDetails,
        addUserWalletPayment,
        addUserWalletPaymentRequest,
        addAdminEarning,
        addUserQuery,
        // updateStudentCareerInfo,
        addUserProjectInfo,
        updateUserProjectInfo,
        fetchUserProjectInfo,
        deleteUserProjectInfo,
        addUserSocialMedia,
        updateUserSocialMedia,
        fetchUserSocialMedia,
        deleteUserSocialMedia,
        addUserPersonasInfo,
        fetchUserPersonasInfo,
        updateUserPersonaInfo,
        deleteUserPersonasInfo,
        addUserCollaborationInfo,
        fetchUserCollaborationInfo,
        updateUserCollaborationInfo,
        deleteUserCollaborationInfo,
        fetchAllStudentCareerInfo,
        getUserRequestCompleted,
        addSocialMediaLinks,
        updateSocialMediaLinks,
        fetchAllSocialMediaLinks,
        deleteSocialMediaLinks
    }
}
