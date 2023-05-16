const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const StudentCareerInfo = sequelize.define('student_career_infos', {
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
            include:["career_details","specialization_list"]
        },
        scopes:{
            list: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                }
            }
        }
      }
    );

    

    StudentCareerInfo.associate = function(models) {
        StudentCareerInfo.hasMany(models.student_specializations, {
          foreignKey: 'student_career_info_id',
          as: 'specialization_list',
          onDelete: "CASCADE"
        });

        StudentCareerInfo.belongsTo(models.careers, {
            foreignKey: 'career_id',
            as: 'career_details',
            onDelete: "CASCADE"
          });
    }

    return StudentCareerInfo;
};
