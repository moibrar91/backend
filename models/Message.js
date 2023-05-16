const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Message = sequelize.define('messages', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        colla_req_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "collaboration_requests",
                key: 'id'
            }
        },
        senderId: {  //requested by user
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        receiverId: {  //requested on user
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },

        message:{
            type:Sequelize.TEXT,
            defaultValue:null,
            allowNull:true
        },

        isMsgRead: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }


    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: []
            }
        },
        
        // scopes:{
        //     withStudentDetails: {
        //       attributes: {
        //           exclude: [ 'createdAt', 'updatedAt']
        //       },
        //       include:["studentDetails",]
        //     },
        //     withUserDetails: {
        //         attributes: {
        //             exclude: [ 'createdAt', 'updatedAt']
        //         },
        //         include:["userDetails"]
        //     },
            
        // }
      }
    );

    // .sync({alter: true})
    
    return Message;
};
