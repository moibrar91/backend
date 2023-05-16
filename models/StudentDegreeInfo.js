const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const StudentDegreeInfo = sequelize.define('student_degree_infos', {
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
        college_name: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        degree: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        field_of_study: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        start_year: {
            type: Sequelize.STRING(20),
            allowNull: true,
            defaultValue: null
        },
        end_year: {
            type: Sequelize.STRING(20),
            allowNull: true,
            defaultValue: null
        },
        college_country: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        college_state: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        college_city: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        }

    },
    {
        timestamps: true,
        /*defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        }*/
      }
    );

    StudentDegreeInfo.addScope('defaultScope', {
        order: [['id', 'DESC']],
      }, { override: true })

    return StudentDegreeInfo;
};
