const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const User = require("./User");

module.exports = function (sequelize) {
    const QuestionLike = sequelize.define('question_likes', {
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
        },
        isLiked: {
            type: Sequelize.BOOLEAN,
            default:true
        }

    },
        {
            timestamps: true,
            defaultScope: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'questionId']
                }
            },
            scopes: {
                withUserDetails: {
                    attributes: {
                        exclude: [ 'updatedAt','questionId']
                    },
                    include:["user_details"]
                },
                withQuestionDetails: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'questionId']
                    },
                    include: ["question_details"]
                }
            }
        }
    );

    QuestionLike.belongsTo(User(sequelize), {
        foreignKey: 'userId',
        onDelete: "CASCADE",
        as: 'user_details'
    });

    QuestionLike.associate = function (models) {

        QuestionLike.belongsTo(models.questions.scope("withAllDetails"), {
            foreignKey: 'questionId',
            as: 'question_details',
            onDelete: "CASCADE"
        });
    }
    return QuestionLike;
};
