const Sequelize = require('sequelize');

module.exports = function (sequelize) {
    const UserProjectInfo = sequelize.define('user_project_info', {
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
        title: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: "What is the coolest side project you have worked on ?"
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            }
        },
        
      }
      
    );


    return UserProjectInfo;
};
