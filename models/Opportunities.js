const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const User = require("./User");
const Admin = require("./Admin");
const TaggedSkills = require("./TaggedSkills");
const QuestionComment = require("./QuestionComment");
const QuestionLike = require("./QuestionLike");

module.exports = function (sequelize) {
    const Opportunities = sequelize.define('opportunities', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        title: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        personaTag: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        collaborationTag: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },

        total_comment: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        total_like: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        total_unlike: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        total_share: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        total_view: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
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
                    exclude: ['updatedAt']
                },
                // include: ["tagged_skills"]
            },
            scopes: {
                withUserDetails: {
                    attributes: {
                        exclude: ['updatedAt', 'wallet_amount', 'email']
                    },
                    // include: ["user_basic_details"]
                },
                // withUserFewDetails: {
                //     attributes: {
                //         exclude: ['updatedAt', 'wallet_amount', 'email']
                //     },
                //     include: ["user_few_details", "tagged_skills", "comments_list","like_list"]
                // },
                
                // list: {
                //     attributes: {
                //         exclude: ['updatedAt']
                //     }
                // },
                // withAllDetails: {
                //     attributes: {
                //         exclude: ['updatedAt', 'wallet_amount', 'email']
                //     },
                //     include: ["user_details", "admin_details", "tagged_skills", "comments_list","like_list"]
                // },
                // withUserAndSkillDetails: {
                //     attributes: {
                //         exclude: ['updatedAt']
                //     },
                //     include: ["user_details", "tagged_skills"]
                // }
            }
        }
    );

    // Questions.belongsTo(User(sequelize).scope("studentDetailsWithDegreeAndWork"), {
    //     foreignKey: 'userId',
    //     onDelete: "CASCADE",
    //     as: 'user_details'
    // });

    // Questions.belongsTo(Admin(sequelize), {
    //     foreignKey: 'adminId',
    //     onDelete: "CASCADE",
    //     as: 'admin_details'
    // });

    // Questions.hasMany(TaggedSkills(sequelize), {
    //     foreignKey: 'questionId',
    //     onDelete: "CASCADE",
    //     as: 'tagged_skills'
    // });

    // Questions.hasMany(QuestionComment(sequelize).scope("withUserDetails"), {
    //     foreignKey: 'questionId',
    //     onDelete: "CASCADE",
    //     as: 'comments_list'
    // });

    // Questions.hasMany(QuestionLike(sequelize).scope("withUserDetails"), {
    //     foreignKey: 'questionId',
    //     onDelete: "CASCADE",
    //     as: 'like_list'
    // });


    // Questions.associate = function (models) {

    //     Questions.belongsTo(models.users.scope("basic"), {
    //         foreignKey: 'userId',
    //         as: 'user_basic_details',
    //         onDelete: "CASCADE"
    //     });
    //     Questions.belongsTo(models.users.scope("withUserFewDetails"), {
    //         foreignKey: 'userId',
    //         as: 'user_few_details',
    //         onDelete: "CASCADE"
    //     });
        
    // }
    
    return Opportunities;
};
