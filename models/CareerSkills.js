const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const CareerSkills = sequelize.define('career_skills', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        career_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "careers",
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
        },
        skill_type: {
            type: Sequelize.ENUM,
            values:["core","booster"]
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            },
            include:["skill_details"]
        },
        scopes: {
            withCareerDetails: {
              attributes: {
                  exclude: ['createdAt','password']

              },
              include:["career_details"]
            },
            list: {
                attributes: {
                    exclude: ['createdAt','password']
  
                }
              }
        }
      }
    );

    CareerSkills.associate = function(models) {

        CareerSkills.belongsTo(models.skills, {
            foreignKey: 'skill_id',
            as: 'skill_details',
            onDelete: "CASCADE"
          });
          
        CareerSkills.belongsTo(models.careers, {
            foreignKey: 'career_id',
            as: 'career_details',
            onDelete: "CASCADE"
          });
    }


    return CareerSkills;
};
