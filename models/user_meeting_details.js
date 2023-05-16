const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const UserMeetingDetails = sequelize.define('user_meeting_details', {
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
        request_id: {  
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "user_requests",
                key: 'id'
            }
        },
        meetingId: {  
            type: Sequelize.STRING(300),
        },
        recordID: {  
            type: Sequelize.STRING(300),
        },
        meetingName: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        speaker: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        studentPW: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        moderatorPW: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        meeting_link:{
            type:Sequelize.TEXT,
            defaultValue:null,
            allowNull:true
        },
        recorded_meeting_link:{
            type:Sequelize.TEXT,
            defaultValue:null,
            allowNull:true
        },
        isMeetingActive:{
            type:Sequelize.BOOLEAN,
            defaultValue:false
        },
        isRecordedMeetingActive:{
            type:Sequelize.BOOLEAN,
            defaultValue:false
        },
        isPublished:{
            type:Sequelize.BOOLEAN,
            defaultValue:false
        },
        isChanged:{
            type:Sequelize.BOOLEAN,
            defaultValue:false
        },
        isMeetingRunning:{
            type:Sequelize.ENUM,
            values:["0","1","2","3","4","5"], //0=pending,1=in-progress,2=upcoming,3=canelled,4=completed, 5=published
            defaultValue:"0"
        },
        meetingType:{
            type:Sequelize.ENUM,
            values:["Festival","Normal"], 
            defaultValue:"Normal"
        },
        date:{
            type:Sequelize.DATEONLY
        },
        startTime:{
            type:Sequelize.TIME
        },
        endTime:{
            type:Sequelize.TIME
        },
        startMeetingTime:{
            type:Sequelize.TIME
        },
        endMeetingTime:{
            type:Sequelize.TIME
        },
        cancelledMeetingTime:{
            type:Sequelize.TIME
        },

    },
    {
        timestamps: true,
        defaultScope: {
            // attributes: {
            //     exclude: [ 'createdAt', 'updatedAt']
            // }
        }
      }
    );

    // .sync({alter:true})
    return UserMeetingDetails;
};
