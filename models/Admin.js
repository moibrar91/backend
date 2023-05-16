const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Admin = sequelize.define('admins', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        email: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        image: {
            type: Sequelize.STRING,
            allowNull: true
        },
        user_type: {
            type: Sequelize.ENUM,
            values: ["super-admin","sub-admin"],
            defaultValue: "sub-admin"
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            }
        },
        
        scopes:{
            withAssignedRoles: {
              attributes: {
                  exclude: [ 'password','createdAt', 'updatedAt']
              },
              include:["assigned_roles"]
            }
        }
      }
      );

      Admin.associate = function(models) {
        Admin.hasOne(models.sub_admin_roles, {
          foreignKey: 'adminId',
          as: 'assigned_roles',
          onDelete: "CASCADE"
        });
    }

    return Admin;
};
