const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Organizations = sequelize.define('organizations', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
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

    return Organizations;
};
