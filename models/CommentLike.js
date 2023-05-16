const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const CommentLike = sequelize.define('comment_likes', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        commentId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "question_comments",
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
    return CommentLike
};
