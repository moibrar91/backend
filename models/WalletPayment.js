const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
  const WalletPayment = sequelize.define('wallet_payments', {
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
    date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      defaultValue: null
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    transaction_id: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    }

  },
    {
      timestamps: true,
      defaultScope: {
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      }
    }
  );
  

  

  return WalletPayment;
};
