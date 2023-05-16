const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const UserSkills = sequelize.define('user_skills', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        user_career_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "user_careers",
                key: 'id'
            }
        },
        skill_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "skills",
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
            include:["skill_details"]
        }
      }
    );

    UserSkills.associate = function(models) {

        UserSkills.belongsTo(models.skills, {
            foreignKey: 'skill_id',
            as: 'skill_details',
            onDelete: "CASCADE"
          });
    }
    return UserSkills;
};
