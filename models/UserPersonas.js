const Sequelize = require('sequelize');
const CareerPersonasList = require('./CareerPersonasList');

module.exports = function (sequelize) {
    const UserPersonas = sequelize.define('user_personas', {
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
        personasId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "career_personas_lists",
                key: 'id'
            }
        },
        career_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "careers",
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
            include:[ "career_persona"]
        },
        
      }
      
    );


    UserPersonas.associate = function(models) {

        UserPersonas.belongsTo(models.career_personas_lists, {
            foreignKey: 'personasId',
            as: 'career_persona',
            onDelete: "CASCADE"
        });

    }
    return UserPersonas;
};
