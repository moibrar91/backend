const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const User = require('./User');

module.exports = function (sequelize) {
    const CollaborationRequest = sequelize.define('collaboration_requests', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        requestedById: {  //requested by user
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        requestedToId: {  //requested on user
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
        requestedToUserType: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        lastMsgDate:{
            type:Sequelize.DATE
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
            withRequestedDetails: {
              attributes: {
                  exclude: [ 'createdAt', 'updatedAt']
              },
              include:["requestedDetails",]
            },
            withUserDetails: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                },
                include:["userDetails", "usersDetails", "requestedDetails"]
            },
            withAllDetails: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                },
                include:["userDetails", "requestedDetails", "collareqtagslist"]
            },
            
        }
      }
    );

    // CollaborationRequest.belongsTo(User(sequelize), {
    //     foreignKey: 'requestedById',
    //     onDelete: "CASCADE",
    //     as: 'requestedDetails'
    // });

    CollaborationRequest.belongsTo(User(sequelize), {
        foreignKey: 'requestedToId',
        onDelete: "CASCADE",
        as: 'userDetails'
    });


    CollaborationRequest.associate = function(models) {
        CollaborationRequest.belongsTo(models.users, {
            foreignKey: 'requestedById',
            as: 'requestedDetails',
            onDelete: "CASCADE"
        });

        CollaborationRequest.belongsTo(models.users, {
            foreignKey: 'requestedToId',
            onDelete: "CASCADE",
            as: 'usersDetails'
        });

        CollaborationRequest.hasMany(models.colla_req_tags, {
            foreignKey: 'colla_req_id',
            // as: 'collareqtagslist',
        //   scope: { 'added_by':'student'},
            onDelete: "CASCADE"
        });

    }


    // .sync({alter: true})
    
    return CollaborationRequest;
};
