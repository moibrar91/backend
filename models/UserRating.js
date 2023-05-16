const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const User = require("./User");
const StudentDegreeDetails = require("./StudentDegreeInfo");
const StudentWorkDetails = require("./StudentWorkExperiences");

module.exports = function (sequelize) {
  const UserRating = sequelize.define('user_ratings', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    studentId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: "users",
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
    rating: {
      type: Sequelize.STRING,
      allowNull: false
    },
    review: {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    },
    title: {
     type: Sequelize.TEXT,
     allowNull: true,
     defaultValue: null
    }

  },
    {
      timestamps: true,
      defaultScope: {
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        include: ["user_details", "student_degree_details", "work_experience"]
      },
      scopes: {
        withStudentDetails: {
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          },
          include: ["studentDetails"]
        },
        withUserDetails: {
          attributes: {
            exclude: ['createdAt', 'password', 'updatedAt', 'state_isocode', 'city_isocode', 'deletedAt', 'wallet_amount', 'email', 'gender', 'country', 'state', 'city', 'password', 'device_token', 'device_type', 'isActive', 'latitude', 'longitude', 'location', 'isProfileComplete', 'profile_complete_percentage', 'about', 'commented_count', 'minimum_fee', "student_degree_details", "student_career_details", "student_skill_details", "certificates", "student_contact_details"]
          },
          include: ["user_details"]
        },
      }
    }
  );

  UserRating.belongsTo(User(sequelize), {
    foreignKey: 'studentId',
    as: 'user_details',
    onDelete: "CASCADE"
  });

  UserRating.hasMany(StudentDegreeDetails(sequelize), {
    foreignKey: 'student_id',
    onDelete: "CASCADE",
    as: 'student_degree_details'
  });

  UserRating.hasMany(StudentWorkDetails(sequelize), {
    foreignKey: 'student_id',
    onDelete: "CASCADE",
    as: 'work_experience'
  });

  UserRating.associate = function (models) {
    UserRating.belongsTo(models.users, {
      foreignKey: 'studentId',
      as: 'studentDetails',
      onDelete: "CASCADE"
    });
  }
  // .sync({alter:true})
  return UserRating;
};
