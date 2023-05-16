const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const UserServices = sequelize.define('user_services', {
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
        service_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "services",
                key: 'id'
            }
        },
        fee: {
            type: Sequelize.INTEGER
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
        }

    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            },
            include:["service_details"]
        },
        scopes:{
            onlyFee: {
                attributes: ["fee"]
            }
        }
      }
      
    );

    UserServices.associate = function(models) {

        UserServices.belongsTo(models.services, {
            foreignKey: 'service_id',
            as: 'service_details',
            onDelete: "CASCADE"
        });
    }
    // .sync({alter:true})
    return UserServices;
};
