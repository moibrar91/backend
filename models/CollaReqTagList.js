const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const CollaReqTagList = sequelize.define('colla_req_tags', {
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
        userId: {  //requested by user
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        requestedByUserType: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        selectedTag:{
            type:Sequelize.TEXT,
            defaultValue:null,
            allowNull:true
        },
        selectedImage:{
            type:Sequelize.TEXT,
            defaultValue:null,
            allowNull:true
        },

        message:{
            type:Sequelize.TEXT,
            defaultValue:null,
            allowNull:true
        },

        isRequestedStatus: {
            type: Sequelize.ENUM,
            values: ["0","1", "2"],  // 0 ==> pending, 1 ==> Interested, 2 ==> Ignored
            defaultValue: "0"
        },


    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ ]
            }
        },
        
      }
    );
    CollaReqTagList.associate = (models) => {
        // associations can be defined here
        // CollaReqTagList.belongsTo(models.collaboration_requests, {foreignKey: "colla_req_id"});
        CollaReqTagList.belongsTo(models.users, {foreignKey: "userId"});
    };
    // .sync({alter: true})
    return CollaReqTagList;
};
