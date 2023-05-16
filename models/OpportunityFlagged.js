const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const OpportunityFlagged = sequelize.define('opportunity_flagged', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        opportunityId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "opportunities",
                key: 'id'
            }
        },
        userId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
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
    return OpportunityFlagged;
};
