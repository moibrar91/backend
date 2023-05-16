const Sequelize = require('sequelize');
const SequelizeP = require('sequelize-paginate');

module.exports = function (sequelize) {
  const UserHelpSupportQuery = sequelize.define('user_queries',{
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
    subject: {
        type: Sequelize.STRING
    },
    query: {
        type: Sequelize.TEXT
    },
    reply: {
        type: Sequelize.TEXT,
        default:null
    }
  },
  {
      timestamps: true,
      //paranoid: true,
      defaultScope: {
          attributes: {
              exclude: ['userId','createdAt', 'updatedAt']
          },
          include:["userDetails"]
      }
    });


    UserHelpSupportQuery.associate = function(models) {

      UserHelpSupportQuery.belongsTo(models.users, {
       foreignKey: 'userId',
       as: 'userDetails'
     });



  };



  return UserHelpSupportQuery;
}
