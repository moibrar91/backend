const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Jobs = sequelize.define('jobs', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        company_name: {
            type: Sequelize.TEXT
        },
        job_type: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "job_types",
                key: 'id'
            }
        },
        experience: {
            type: Sequelize.STRING
        },
        posted_date: {
            type: Sequelize.DATEONLY
        },
        last_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        price: {
            type: Sequelize.STRING
        },
        posted_by: {
            type: Sequelize.TEXT
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
                    exclude: ['createdAt', 'updatedAt']
                },
                include: ["jobTypeDetails"]
            }
        }
    );


    Jobs.associate = function (models) {

        Jobs.belongsTo(models.job_types, {
            foreignKey: 'job_type',
            as: 'jobTypeDetails'
        });
    }

        return Jobs;
    };
