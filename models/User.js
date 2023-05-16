const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");
const StudentDegreeDetails = require("./StudentDegreeInfo");
const StudentWorkDetails = require("./StudentWorkExperiences");

module.exports = function (sequelize) {
    const User = sequelize.define('users', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        first_name: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        last_name: {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        username: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        password: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        gender: {
            type: Sequelize.ENUM,
            values: ["Male", "Female", "Other"],
            allowNull: true,
            defaultValue: null
        },
        image: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        
        about: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        user_type: {
            type: Sequelize.ENUM,
            values: ["student", "counseller", "mentor", "recruiter"],
            allowNull: false
        },
        device_type: {
            type: Sequelize.ENUM,
            values: ["ios", "android", "web"],
            allowNull: true,
            defaultValue: null
        },
        device_token: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        isMobileVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isEmailVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        notification_permission: {
            type: Sequelize.ENUM,
            values: ["allow", "deny"],
            defaultValue: "allow"
        },
        profile_stag: {
            type: Sequelize.ENUM,
            values: ["0", "1", "2", "3", "4", "5", "6"],
            defaultValue: "0"
        },
        country: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        state: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        city: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        state_isocode: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        city_isocode: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        latitude: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        longitude: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        location: {
            type: Sequelize.GEOMETRY('POINT'),
            allowNull: true,
            defaultValue: null
        },
        profile_complete_percentage: {
            type: Sequelize.STRING(10),
            defaultValue: "10"
        },
        isProfileComplete: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        rating: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0
        },
        total_rating: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        commented_count: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        wallet_amount: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 0
        },

    },
        {
            paranoid:true,
            timestamps: true,
            defaultScope: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt',  'wallet_amount', 'email', 'gender', 'country', 'state', 'city', 'password', 'device_token', 'device_type', 'isActive', 'latitude', 'longitude', 'location',  'about', 'minimum_fee']
                }
            },
            scopes: {
                basic: {
                    attributes: {
                        exclude: ['createdAt', 'password', 'updatedAt']
                    },
                    
                },
                withUserFewDetails: {
                    attributes: {
                        exclude: ['createdAt', 'password', 'updatedAt', 'state_isocode', 'city_isocode','deletedAt', 'wallet_amount', 'email', 'gender', 'country', 'state', 'city', 'password', 'device_token', 'device_type', 'isActive', 'latitude', 'longitude', 'location', 'about', 'minimum_fee',  "certificates"]
                    },
                    include: ["student_degree_details", "work_experience"]
                    
                },
                student_details: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'device_token', 'device_type', 'notification_permission', 'latitude', 'longitude', 'location']

                    },
                    // include: ["student_degree_details", "student_career_details", "student_skill_details", "work_experience","certificates","student_contact_details"]
                    include: ["student_degree_details", "student_career_details", "student_skill_details", "work_experience","certificates","student_contact_details", 'user_persona_list','user_collaboration_list', "user_project_info", "user_social_media"]
                    // include: ["student_degree_details", "student_career_details", "student_skill_details", "work_experience","certificates","student_contact_details", "user_project_info", "user_social_media"]
                },
                withCounsellerDetails: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'device_token', 'device_type', 'notification_permission', 'latitude', 'longitude', 'location']

                    },
                    include: ["user_other_details", "career_list", "service_list","certificates"]
                },
                withRequestedToDetails: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'device_token', 'device_type', 'notification_permission', 'latitude', 'longitude', 'location']

                    },
                    include: ["user_other_details"]
                },
                withRecruiterDetails: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'device_token', 'device_type', 'notification_permission', 'latitude', 'longitude', 'location']

                    },
                    include: ["recruiter_other_details","certificates"]
                },
                counsellerList: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt',  'profile_stag', 'password', 'device_token', 'device_type', 'notification_permission', 'latitude', 'longitude', 'location', 'isProfileComplete', 'profile_complete_percentage']

                    },
                    // include: ["user_other_details", "career_list", "service_list"]
                    include: ["user_other_details", "user_rating", "career_list", "service_list", 'user_persona_list','user_collaboration_list', "user_project_info", "user_social_media"]
                    // include: ["user_other_details", "career_list", "service_list", "user_project_info", "user_social_media"]
                },
                recruiterList: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'user_type', 'profile_stag', 'password', 'device_token', 'device_type', 'notification_permission', 'latitude', 'longitude', 'location', 'isProfileComplete', 'profile_complete_percentage']

                    },
                    include: ["recruiter_other_details"]
                },
                counsellerListWithoutCareer: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'user_type', 'profile_stag', 'password', 'device_token', 'device_type', 'notification_permission', 'latitude', 'longitude', 'location', 'isProfileComplete', 'profile_complete_percentage']

                    },
                    include: ["user_other_details", "service_list"]
                },
                studentDetailsWithDegreeAndWork: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'device_token', 'device_type', 'notification_permission', 'latitude', 'longitude', 'location']

                    },
                    include: ["student_degree_details", "work_experience"]
                },
                onlyName: {
                    attributes:['id', 'first_name', 'last_name','email','image','wallet_amount','username']
                }
            }
        }
    );

    User.hasMany(StudentDegreeDetails(sequelize), {
        foreignKey: 'student_id',
        onDelete: "CASCADE",
        as: 'student_degree_details'
    });

    User.hasMany(StudentWorkDetails(sequelize), {
        foreignKey: 'student_id',
        onDelete: "CASCADE",
        as: 'work_experience'
    });

    User.associate = function (models) {

        User.hasMany(models.student_career_infos, {
            foreignKey: 'student_id',
            as: 'student_career_details',
            onDelete: "CASCADE"
        });

        User.hasMany(models.student_skills, {
            foreignKey: 'student_id',
            as: 'student_skill_details',
            onDelete: "CASCADE"
        });

        User.hasOne(models.counsellers_details, {
            foreignKey: 'user_id',
            as: 'user_other_details',
            onDelete: "CASCADE"
        });

        User.hasOne(models.recruiter_details, {
            foreignKey: 'recruiter_id',
            as: 'recruiter_other_details',
            onDelete: "CASCADE"
        });

        User.hasMany(models.user_careers, {
            foreignKey: 'userId',
            as: 'career_list',
            onDelete: "CASCADE"
        });
        

        User.hasMany(models.user_careers, {
            foreignKey: 'userId',
            as: 'one_career_list',
            onDelete: "CASCADE",
            limit: "1"
        });
        User.hasMany(models.user_personas, {
            foreignKey: 'userId',
            as: 'user_persona_list',
            onDelete: "CASCADE"
        });
        User.hasMany(models.user_collaborations, {
            foreignKey: 'userId',
            as: 'user_collaboration_list',
            onDelete: "CASCADE"
        });

        User.hasOne(models.user_project_info, {
            foreignKey: 'userId',
            as: 'user_project_info',
            onDelete: "CASCADE"
        });

        User.hasMany(models.user_social_media, {
            foreignKey: 'userId',
            as: 'user_social_media',
            onDelete: "CASCADE"
        });

        User.hasMany(models.user_services, {
            foreignKey: 'userId',
            as: 'service_list',
            onDelete: "CASCADE"
        });
        User.hasMany(models.certificates, {
            foreignKey: 'userId',
            as: 'certificates',
            onDelete: "CASCADE"
        });

        User.hasOne(models.student_contact_details, {
            foreignKey: 'studentId',
            as: 'student_contact_details',
            onDelete: "CASCADE"
        });

        User.hasMany(models.user_ratings, {
            foreignKey: 'userId',
            as: 'user_rating',
            onDelete: "CASCADE"
        });
    }

    return User;
};
