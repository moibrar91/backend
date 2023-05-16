const Sequelize = require('sequelize');

module.exports = function (sequelize) {
    const UserCollaboration = sequelize.define('user_collaborations', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        userId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        collaborationId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "career_collaboration_lists",
                key: 'id'
            }
        },
        career_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "careers",
                key: 'id'
            }
        }

    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            },
            include:[ "career_collaboration"]
        },
        
      }
      
    );

    UserCollaboration.associate = function(models) {
        UserCollaboration.belongsTo(models.career_collaboration_lists, {
            foreignKey: 'collaborationId',
            as: 'career_collaboration',
            onDelete: "CASCADE"
        });
    }
    return UserCollaboration;
};
