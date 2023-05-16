const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const StudentWorkExperienceMedia = sequelize.define('student_work_experience_media', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        work_experience_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "student_work_experiences",
                key: 'id'
            }
        },
        media: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        }

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

    return StudentWorkExperienceMedia;
};
