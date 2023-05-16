const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const CounsellerDetails = sequelize.define('counsellers_details', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        user_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        experience: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        designation: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        company_name: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        secondary_email: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        countryCode: {
            type: Sequelize.STRING(4),
            allowNull: true,
            defaultValue: null
        },
        mobile: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        secondary_countryCode: {
            type: Sequelize.STRING(4),
            allowNull: true,
            defaultValue: null
        },
        secondary_mobile: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        backgroundCoverColor: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: "linear-gradient(92.59deg, #04619F 0%, #191A1A 97.85%)"
        },

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

    return CounsellerDetails;
};
