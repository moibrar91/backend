const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');

module.exports = function (sequelize) {
  const UserOTPAndToken = sequelize.define('user_OTP_and_tokens',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
    },
    countryCode: {
        type: Sequelize.STRING(20),
        allowNull:true,
        defaultValue:null
    },
    mobile: {
        type: Sequelize.STRING(20),
        allowNull:true,
        defaultValue:null
    },
    email: {
        type: Sequelize.STRING(100),
        allowNull:true,
        defaultValue:null
    },
    otp: {
        type: Sequelize.STRING(20),
        allowNull:true,
        defaultValue:null
    },
    token: {
        type: Sequelize.TEXT,
        allowNull:true,
        defaultValue:null
    }
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['createdAt', 'updatedAt']
          }
      }
    });




  return UserOTPAndToken;
}
