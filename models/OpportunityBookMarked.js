const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const OpportunityBookMarked = sequelize.define('opportunity_bookmarks', {
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
                exclude: [ 'createdAt', 'updatedAt','questionId']
            }
        },
        scopes: {
            // withQuestionDetails: {
            //     attributes: {
            //         exclude: ['createdAt', 'updatedAt', 'questionId']
            //     },
            //     include: []
            // }
        }
      }
    );

    // OpportunityBookMarked.associate = function (models) {

    //     OpportunityBookMarked.belongsTo(models.questions.scope("withAllDetails"), {
    //         foreignKey: 'questionId',
    //         as: 'question_details',
    //         onDelete: "CASCADE"
    //     });
    // }
    return OpportunityBookMarked;
};
