const Sequelize = require('sequelize');

module.exports = function (sequelize) {
    const UserFestivalDetails = sequelize.define('user_festival_details', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        userId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        studentId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        adminId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        meetingId: {  
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "user_meeting_details",
                key: 'id'
            }
        },
        meeting_id: {  
            type: Sequelize.STRING(300),
        },
        role: {
            type: Sequelize.ENUM,
            values: ["student", "counsellor", "mentor", "recruiter", "admin"],
            allowNull: false
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

    // .sync({alter:true})
    return UserFestivalDetails;
};
