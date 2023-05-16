const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const SocialMediaLinks = sequelize.define('social_media_links', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
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
        }
      }
    );

    return SocialMediaLinks;
};
