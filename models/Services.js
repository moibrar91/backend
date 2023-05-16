const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Services = sequelize.define('services', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        title: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        service_for: {
            type: Sequelize.ENUM,
            values: ["counseller","mentor","both"],
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
                exclude: [ 'createdAt', 'updatedAt','service_for']
            }
        }
      }
    );

    return Services;
};
