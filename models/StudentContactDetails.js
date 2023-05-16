const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const StudentContactDetails = sequelize.define('student_contact_details', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        studentId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        countryCode: {
            type: Sequelize.STRING(4),
            allowNull: true,
            defaultValue: null
        },
        mobile: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        backgroundCoverColor: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: "linear-gradient(92.59deg, #04619F 0%, #191A1A 97.85%)"
        },
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

    return StudentContactDetails;
};
