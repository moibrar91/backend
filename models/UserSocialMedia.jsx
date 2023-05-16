const Sequelize = require('sequelize');

module.exports = function (sequelize) {
    const UserSocialMedia = sequelize.define('user_social_media', {
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

        title: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        image: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        url: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },

    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        },
        
      }
      
    );


    return UserSocialMedia;
};
