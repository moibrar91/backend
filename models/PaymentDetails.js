const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const UserRequest = require("./UserRequest");

module.exports = function (sequelize) {
  const PaymentDetails = sequelize.define('payment_details', {
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
    orderId: {
      type: Sequelize.STRING
    },
    amount: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    },
    transactionId: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    },
    request_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      onDelete: 'CASCADE',
      references: {
        model: "user_requests",
        key: 'id'
      }
    }
  },
    {
      timestamps: true,
      defaultScope: {
        attributes: {
          exclude: ['updatedAt']
        }
      },
      scopes: {
        withRequestDetails: {
          attributes: {
            exclude: ['updatedAt']
          },
          include: ["request_details"]
        }
      }
    }
  );

  PaymentDetails.belongsTo(UserRequest(sequelize).scope("withUserServiceDetails"), {
    foreignKey: 'request_id',
    onDelete: "CASCADE",
    as: 'request_details'
  });

  return PaymentDetails;
};
