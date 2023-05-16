const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const RecruiterDetails = sequelize.define('recruiter_details', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        recruiter_id: {
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
        brand_name: {
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
        recruiter_type: {
            type: Sequelize.ENUM,
            values: ["company","agency"],
            allowNull: false
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

    return RecruiterDetails;
};
