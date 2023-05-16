const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const StudentSkill = sequelize.define('student_skills', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        student_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
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
        level: {
            type: Sequelize.STRING(10),
            allowNull: true,
            defaultValue: null
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
        }
      }
    );

    StudentSkill.associate = function(models) {

        StudentSkill.belongsTo(models.skills, {
            foreignKey: 'skill_id',
            as: 'skill_details',
            onDelete: "CASCADE"
          });
    }
    return StudentSkill;
};
