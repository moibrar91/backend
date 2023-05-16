const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Industry = sequelize.define('industries', {
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
        image: {
            type: Sequelize.STRING(300),
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

    return Industry;
};
