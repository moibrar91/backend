const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const StudentWorkExperienceMedia = require("./StudentWorkExperienceMedia");

module.exports = function (sequelize) {
    const StudentWorkExperiences = sequelize.define('student_work_experiences', {
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
        title: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        employment_type: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        company_name: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        start_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        end_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        isCurrentlyWorking: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        industry: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "industries",
                key: 'id'
            }
        },
        description: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        profile_headline: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        country: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        state: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        city: {
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
            },
            include:["media"]
        }
      }
    );

    

    StudentWorkExperiences.hasMany(StudentWorkExperienceMedia(sequelize), {
        foreignKey: 'work_experience_id',
        onDelete: "CASCADE",
        as: 'media'
    });

    return StudentWorkExperiences;
};
