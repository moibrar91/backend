const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
  const AdminEarnings = sequelize.define('admin_earnings', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    requestId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: "user_requests",
        key: 'id'
      }
    },
    amount: {
      type: Sequelize.INTEGER,
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
  

  

  return AdminEarnings;
};
