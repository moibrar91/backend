const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const JobTypes = sequelize.define('job_types', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.TEXT
        }

    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        }
      });

    return JobTypes;
};
