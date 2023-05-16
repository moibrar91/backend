const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const BookmarkedQuestions = sequelize.define('bookmarked_questions', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        questionId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "questions",
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
            withQuestionDetails: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'questionId']
                },
                include: ["question_details"]
            }
        }
      }
    );

    BookmarkedQuestions.associate = function (models) {

        BookmarkedQuestions.belongsTo(models.questions.scope("withAllDetails"), {
            foreignKey: 'questionId',
            as: 'question_details',
            onDelete: "CASCADE"
        });
    }
    return BookmarkedQuestions;
};
