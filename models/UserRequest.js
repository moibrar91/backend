const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const User = require("./User");
const Service = require("./Services");

module.exports = function (sequelize) {
    const UserRequest = sequelize.define('user_requests', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        studentId: {  //requested by user
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        userId: {  //requested on user
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        service_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "services",
                key: 'id'
            }
        },
        status:{
            type:Sequelize.ENUM,
            values:["0","1","2","3","4"], //0=pending,1=in-progress,2=upcoming,3=canelled,4=completed
            defaultValue:"0"
        },
        note:{
            type:Sequelize.TEXT,
            defaultValue:null,
            allowNull:true
        },
        price:{
            type:Sequelize.STRING(300),
            defaultValue:null,
            allowNull:true
        },
        wallet_amount:{
            type:Sequelize.STRING(300),
            defaultValue:0,
            allowNull:true
        },
        meeting_link:{
            type:Sequelize.STRING(300),
            defaultValue:null,
            allowNull:true
        },
        recorded_video_link:{
            type:Sequelize.STRING(300),
            defaultValue:null,
            allowNull:true
        },
        isActive:{
            type:Sequelize.BOOLEAN,
            defaultValue:true
        }


    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        },
        
        scopes:{
            withStudentDetails: {
              attributes: {
                  exclude: [ 'createdAt', 'updatedAt']
              },
              include:["studentDetails","serviceDetails", "meetingDetails","studentTimeSlots","teacherTimeSlots","selectedTimeSlot"]
            },
            withUserDetails: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                },
                include:["userDetails","serviceDetails", "meetingDetails","studentTimeSlots","teacherTimeSlots","selectedTimeSlot"]
            },
            withAllDetails: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                },
                include:["userDetails","serviceDetails", "meetingDetails","studentDetails","studentTimeSlots","teacherTimeSlots","selectedTimeSlot"]
            },
            withMeetingDetails: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                },
                include:[ "meetingDetails","selectedTimeSlot"]
            },

            withUserServiceDetails: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                },
                include:["userDetails","serviceDetails"]
            }
        }
      }
    );

    
    UserRequest.belongsTo(User(sequelize), {
        foreignKey: 'userId',
        onDelete: "CASCADE",
        as: 'userDetails'
    });

    UserRequest.belongsTo(Service(sequelize), {
        foreignKey: 'service_id',
        onDelete: "CASCADE",
        as: 'serviceDetails'
    });

    UserRequest.associate = function(models) {
        UserRequest.belongsTo(models.users, {
            foreignKey: 'studentId',
            as: 'studentDetails',
            onDelete: "CASCADE"
        });

        UserRequest.hasMany(models.user_request_time_slots, {
          foreignKey: 'request_id',
          as: 'studentTimeSlots',
          scope: { 'added_by':'student'},
          onDelete: "CASCADE"
        });

        UserRequest.hasMany(models.user_request_time_slots, {
          foreignKey: 'request_id',
          as: 'teacherTimeSlots',
          scope: { 'added_by':'teacher'},
          onDelete: "CASCADE"
        });

        UserRequest.hasOne(models.user_meeting_details, {
          foreignKey: 'request_id',
          as: 'meetingDetails',
          onDelete: "CASCADE"
        });
        
        UserRequest.hasOne(models.user_request_time_slots, {
          foreignKey: 'request_id',
          as: 'selectedTimeSlot',
          scope: { 'isSelected':1},
          onDelete: "CASCADE"
        });

    }
    
    return UserRequest;
};
