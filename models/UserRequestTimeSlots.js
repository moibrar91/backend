const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const UserRequestTimeSlots = sequelize.define('user_request_time_slots', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        request_id: {  
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "user_requests",
                key: 'id'
            }
        },
        date:{
            type:Sequelize.DATEONLY
        },
        time:{
            type:Sequelize.TIME
        },
        isSelected:{
            type:Sequelize.BOOLEAN,
            defaultValue:false
        },
        added_by: {
            type: Sequelize.ENUM,
            values: ["student","teacher"]
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
        }
      }
    );

    
    return UserRequestTimeSlots;
};
