const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const Skill = require("./Skill");

module.exports = function (sequelize) {
    const TaggedSkills = sequelize.define('tagged_skills', {
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
                exclude: [ 'createdAt', 'updatedAt','questionId']
            },
            include:["skill_details"]
        },
        scopes:{
            basic: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt','questionId']
                }
            }
        }
      }
    );

    TaggedSkills.belongsTo(Skill(sequelize), {
        foreignKey: 'skill_id',
        onDelete: "CASCADE",
        as: 'skill_details'
    });
    return TaggedSkills;
};
