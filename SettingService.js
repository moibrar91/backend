const { Op } = require("sequelize");
const { models } = require("../models");
const helpers = require("../util/helpers");

module.exports = () => {


    const getSetting = (transaction = null, scope = "defaultScope") => {
        console.log("SettingService => getSetting")
        return new Promise(function (resolve, reject) {
            let query = {
                attributes: {
                    exclude: ["deletedAt", "createdAt", "updatedAt"]
                },
                transaction
            };


            let orm = models.setting.scope(scope).findOne(query)
            orm.then(resolve).catch(reject);
        })
    }

    const updateSetting = (setting, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => updateSetting")
        return new Promise(function (resolve, reject) {
            models.setting.update(setting, { where: {}, transaction })
                .then(resolve).catch(reject);
        })
    }

    const addAboutUs = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.about.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateAbout = (query, data, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => updateAbout")
        return new Promise(function (resolve, reject) {
            models.about.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const getAbout = (query, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => getSetting")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            }
            let orm = models.about.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const addTermAndCondition = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.term_and_conditions.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const updateTermAndCondition = (query, data, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => updateTermAndCondition")
        return new Promise(function (resolve, reject) {
            models.term_and_conditions.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const getTermAndCondition = (query, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => getTermAndCondition")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            }
            let orm = models.term_and_conditions.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const addPrivacyAndPolicy = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.privacy_and_policies.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }
    const updatePrivacyAndPolicy = (query, data, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => updatePrivacyAndPolicy")
        return new Promise(function (resolve, reject) {
            models.privacy_and_policies.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    const getPrivacyAndPolicies = (query, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => getPrivacyAndPolicies")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            }
            let orm = models.privacy_and_policies.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const getHelplineNumber = (query, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => getTermAndCondition")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            }
            let orm = models.setting.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const addOrganization = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.organizations.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateOrganization = (query, data, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => updateOrganization")
        return new Promise(function (resolve, reject) {
            models.organizations.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const getOrganization = (query, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => getOrganization")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            }
            let orm = models.organizations.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const getAllOrganizationList = (filters, transaction = null) => {
        console.log("UserService => getAllOrganizationList")
        return new Promise(function(resolve, reject){
            
            let where = {};
            if(filters.search){
              let search = filters.search.toLowerCase();
              where={ name:Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%')};
            }
            if(filters.status) where.isActive = filters.status;
            console.log("where")
            console.log(where);
            let query = {};
            if(filters.page && filters.limit){
                let page = parseInt(filters.page);
                let limit = parseInt(filters.limit);
                let offset = (page - 1) * limit;
                query = {
                    limit,
                    offset,
                    where: where,
                    subQuery:false,
                    order: [
                        ['name', 'ASC']
                    ],
                    transaction
                }
            }else {
                query = {
                    where: where,
                    subQuery:false,
                    order: [
                        ['name', 'ASC']
                    ],
                    transaction
                }
            }
            let orm = models.organizations.findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    const addIndustry = (data, transaction = null) => {
        return new Promise(function (resolve, reject) {
            models.industries.create(data, { transaction })
                .then(resolve).catch(reject);
        })
    }

    const updateIndustry = (query, data, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => updateIndustry")
        return new Promise(function (resolve, reject) {
            models.industries.update(data, { where: query, transaction })
                .then(resolve).catch(reject);
        })
    }
    const getIndustry = (query, transaction = null, scope = "defaultScope") => {
        console.log("SettingService => getIndustry")
        return new Promise(function (resolve, reject) {
            let where_query = {
                where: query,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                transaction
            }
            let orm = models.industries.scope(scope).findOne(where_query)
            orm.then(resolve).catch(reject);
        })
    }

    const getAllIndustryList = (filters, transaction = null) => {
        console.log("UserService => getAllIndustryList")
        return new Promise(function(resolve, reject){
            
            let where = {};
            if(filters.search){
              let search = filters.search.toLowerCase();
              where={ name:Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%')};
            }
            if(filters.status) where.isActive = filters.status;
            console.log("where")
            console.log(where);
            let query = {};
            if(filters.page && filters.limit){
                let page = parseInt(filters.page);
                let limit = parseInt(filters.limit);
                let offset = (page - 1) * limit;
                query = {
                    limit,
                    offset,
                    where: where,
                    subQuery:false,
                    order: [
                        ['name', 'ASC']
                    ],
                    transaction
                }
            }else {
                query = {
                    where: where,
                    subQuery:false,
                    order: [
                        ['name', 'ASC']
                    ],
                    transaction
                }
            }
            let orm = models.industries.findAll(query)

            orm.then(resolve).catch(reject);
        })
    }

    

    const deleteIndustry = (query, transaction = null) => {
        console.log("AdminService => deleteIndustry")
        return new Promise(function (resolve, reject) {
            models.industries.destroy({ where: query, transaction })
                .then(resolve).catch(reject);
        })
    }

    return {
        getSetting,
        updateSetting,
        addAboutUs,
        getAbout,
        updateAbout,
        addTermAndCondition,
        updateTermAndCondition,
        getTermAndCondition,
        addPrivacyAndPolicy,
        updatePrivacyAndPolicy,
        getPrivacyAndPolicies,
        getHelplineNumber,
        addOrganization,
        updateOrganization,
        getOrganization,
        getAllOrganizationList,
        addIndustry,
        updateIndustry,
        getIndustry,
        getAllIndustryList,
        deleteIndustry
    }
}
