const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const PrivacyAndPolicy = sequelize.define('privacy_and_policies', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        privacy_and_policy: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: ""
        },
        image	: {
            type: Sequelize.STRING(150),
            allowNull: true,
            defaultValue: ""
        },
        status: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: true
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }
      });



    return PrivacyAndPolicy;
};
