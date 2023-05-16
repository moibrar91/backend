const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Setting = sequelize.define('setting', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        helpline_mobile	: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        admin_percentage	: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: "10"
        }

    });

    return Setting;
};
