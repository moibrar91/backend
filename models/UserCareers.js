const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const UserCareers = sequelize.define('user_careers', {
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
            include:["career_details"]
        }
      }
      
    );

    UserCareers.associate = function(models) {

        UserCareers.belongsTo(models.careers, {
            foreignKey: 'career_id',
            as: 'career_details',
            onDelete: "CASCADE"
        });

        UserCareers.hasMany(models.user_skills, {
            foreignKey: 'user_career_id',
            as: 'user_skills',
            onDelete: "CASCADE"
        });
    }
    return UserCareers;
};
