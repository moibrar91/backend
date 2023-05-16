const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const JoinEarlyUser = sequelize.define('join_early_users', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        user_type: {
            type: Sequelize.ENUM,
            values: ["student","counseller","mentor","recruiter"],
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

    return JoinEarlyUser;
};
