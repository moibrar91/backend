const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const User = require("./User");

module.exports = function (sequelize) {
  const WalletPaymentRequests = sequelize.define('wallet_payment_requests', {
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
    amount: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: Sequelize.ENUM,
      values:["0","1","2"],  //0=pending,1=accepted,2=rejected
      allowNull: true,
      defaultValue: "0"
    }

  },
    {
      timestamps: true,
      defaultScope: {
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      },
        
      scopes:{
          withUserDetails: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            },
            include:["user_details"]
          }
        }
    }
  );
  
  WalletPaymentRequests.belongsTo(User(sequelize).scope('onlyName'), {
    foreignKey: 'userId',
    onDelete: "CASCADE",
    as: 'user_details'
});
  

  return WalletPaymentRequests;
};
