const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const StudentSpecialization = sequelize.define('student_specializations', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        student_career_info_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "student_career_infos",
                key: 'id'
            }
        },
        specialization_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "specializations",
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
            include:["specialization_details"]
        }
      }
    );

    StudentSpecialization.associate = function(models) {

        StudentSpecialization.belongsTo(models.specializations, {
            foreignKey: 'specialization_id',
            as: 'specialization_details',
            onDelete: "CASCADE"
          });
    }

    return StudentSpecialization;
};
