const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Career = sequelize.define('careers', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        title: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        image: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        skill_description: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        effective_tools_description: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        certifications: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        career_options: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
        }
    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: [ 'createdAt', 'updatedAt',"skill_description","effective_tools_description","certifications","career_options"]
            }
        },
        scopes:{
            withSpecialization: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                },
                include:["specialization_list","core_skills","booster_skills","effective_tools"]
            },
            withPersonasAndCollaboration: {
                attributes: {
                    exclude: [ 'createdAt', 'updatedAt']
                },
                include:["career_personas", "career_collaboration"]
            }
            
        }
      }
    );

    Career.associate = function(models) {

        Career.hasMany(models.specializations, {
            foreignKey: 'career_id',
            as: 'specialization_list',
            onDelete: "CASCADE"
        });

        Career.hasMany(models.career_skills, {
            foreignKey: 'career_id',
            as: 'core_skills',
            onDelete: "CASCADE",
            scope:{skill_type:"core"}
        });

        Career.hasMany(models.career_skills, {
            foreignKey: 'career_id',
            as: 'booster_skills',
            onDelete: "CASCADE",
            scope:{skill_type:"booster"}
        });

        Career.hasMany(models.career_tool_relations, {
            foreignKey: 'career_id',
            as: 'effective_tools',
            onDelete: "CASCADE"
        });

        // Career.hasMany(models.career_personas_list, {
        //     foreignKey: 'career_id',
        //     as: 'career_personas',
        //     onDelete: "CASCADE"
        // });

        // Career.hasMany(models.career_collaboration_lists, {
        //     foreignKey: 'career_id',
        //     as: 'career_collaboration',
        //     onDelete: "CASCADE"
        // });
    }

    return Career;
};
