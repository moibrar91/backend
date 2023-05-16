const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const OpportunityLike = sequelize.define('opportunity_likes', {
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
        },
        isLiked: {
            type: Sequelize.BOOLEAN,
            default: true,
            
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
    return OpportunityLike
};
