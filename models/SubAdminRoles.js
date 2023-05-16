const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const SubAdminRoles = sequelize.define('sub_admin_roles', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        adminId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "admins",
                key: 'id'
            }
        },
        manage_career_path: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_speciality: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_skill: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_student: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_counseller: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_mentor: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_request: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_forum: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_setting: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        manage_withdrawal: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
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
    return SubAdminRoles;
};
