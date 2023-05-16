const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const TeamRequest = sequelize.define('team_requests', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        first_name: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        last_name: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        countryCode: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        mobile: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        file: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        }
      }
    );

    return TeamRequest;
};
