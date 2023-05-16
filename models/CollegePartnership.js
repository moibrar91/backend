const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const CollegePartnership = sequelize.define('college_partnerships', {
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
        designation: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        college_name: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        country: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        state: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        city: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        state_isocode: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        city_isocode: {
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

    return CollegePartnership;
};
