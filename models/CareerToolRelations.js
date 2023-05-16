const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const CareerToolRelations = sequelize.define('career_tool_relations', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        career_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "careers",
                key: 'id'
            }
        },
        tool_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "tools",
                key: 'id'
            }
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt']
            },
            include:["tool_details"]
        },
        scopes: {
            basic: {
              attributes: {
                  exclude: ['createdAt','password']

              }
            }
        }
      }
    );

    CareerToolRelations.associate = function(models) {

        CareerToolRelations.belongsTo(models.tools, {
            foreignKey: 'tool_id',
            as: 'tool_details',
            onDelete: "CASCADE"
          });
    }

    return CareerToolRelations;
};
