const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const User = require("./User");

module.exports = function (sequelize) {
    const QuestionComment = sequelize.define('question_comments', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        questionId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "questions",
                key: 'id'
            }
        },
        userId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "users",
                key: 'id'
            }
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        total_like: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        total_share: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        }

    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                // exclude: [ 'updatedAt','questionId']
                exclude: ['createdAt', 'password', 'updatedAt', 'user_type', 'isMobileVerified', 'isEmailVerified', 'state_isocode', 'city_isocode','rating','total_rating','deletedAt', 'wallet_amount', 'email', 'gender', 'profile_stag', 'country', 'state', 'city', 'password', 'device_token', 'device_type', 'isActive', 'notification_permission', 'latitude', 'longitude', 'location', 'isProfileComplete', 'profile_complete_percentage', 'about', 'commented_count', 'minimum_fee', "student_degree_details", "student_career_details", "student_skill_details","certificates","student_contact_details"]
            },
            include:["user_details"]
        },
        scopes:{
            withUserDetails: {
                attributes: {
                    // exclude: [ 'updatedAt','questionId']
                    exclude: ['createdAt', 'password', 'updatedAt', 'state_isocode', 'city_isocode','deletedAt', 'wallet_amount', 'email', 'gender', 'country', 'state', 'city', 'password', 'device_token', 'device_type', 'isActive', 'latitude', 'longitude', 'location', 'isProfileComplete', 'profile_complete_percentage', 'about', 'commented_count', 'minimum_fee', "student_degree_details", "student_career_details", "student_skill_details","certificates","student_contact_details"]
                },
                include:["user_details"]
            },
            // withUserFewDetails: {
            //     attributes: {
            //         exclude: ['createdAt', 'password', 'updatedAt', 'user_type', 'isMobileVerified', 'isEmailVerified', 'state_isocode', 'city_isocode','rating','total_rating','deletedAt', 'wallet_amount', 'email', 'gender', 'profile_stag', 'country', 'state', 'city', 'password', 'device_token', 'device_type', 'isActive', 'notification_permission', 'latitude', 'longitude', 'location', 'isProfileComplete', 'profile_complete_percentage', 'about', 'commented_count', 'minimum_fee', "student_degree_details", "student_career_details", "student_skill_details","certificates","student_contact_details"]
            //     },
            //     include:["user_few_details"]
            // },
            withQuestionDetails: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'questionId']
                },
                include: ["question_details"]
            },
            basic: {
                attributes: {
                    // exclude: [ 'updatedAt','questionId']
                    exclude: ['createdAt', 'password', 'updatedAt', 'user_type', 'isMobileVerified', 'isEmailVerified', 'state_isocode', 'city_isocode','rating','total_rating','deletedAt', 'wallet_amount', 'email', 'gender', 'profile_stag', 'country', 'state', 'city', 'password', 'device_token', 'device_type', 'isActive', 'notification_permission', 'latitude', 'longitude', 'location', 'isProfileComplete', 'profile_complete_percentage', 'about', 'commented_count', 'minimum_fee', "student_degree_details", "student_career_details", "student_skill_details","certificates","student_contact_details"]
                }
            }
        }
      }
    );

    
    QuestionComment.belongsTo(User(sequelize), {
        foreignKey: 'userId',
        onDelete: "CASCADE",
        as: 'user_details'
    });


    QuestionComment.associate = function(models) {

        QuestionComment.hasMany(models.flagged_comments, {
            foreignKey: 'commentId',
            as: 'flag_details',
            onDelete: "CASCADE"
        });

        QuestionComment.belongsTo(models.questions.scope("withAllDetails"), {
            foreignKey: 'questionId',
            as: 'question_details',
            onDelete: "CASCADE"
        });
    }
    return QuestionComment;
};
