const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Skill = sequelize.define('skills', {
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
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        },
        scopes: {
            withCareerPath: {
              attributes: {
                  exclude: ['createdAt','updatedAt']
               },
               include:["career_list"]
            },
            withCareerPathRelation: {
                attributes: {
                    exclude: ['createdAt','updatedAt']
                 },
                 include:["career_path_relation"]
              }
        }
      }
    );

    Skill.associate = function(models) {

        Skill.hasMany(models.career_skills.scope("withCareerDetails"), {
            foreignKey: 'skill_id',
            as: 'career_list',
            onDelete: "CASCADE"
        });

        Skill.hasMany(models.career_skills.scope("list"), {
            foreignKey: 'skill_id',
            as: 'career_path_relation',
            onDelete: "CASCADE"
        });
    }

    return Skill;
};
