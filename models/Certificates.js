const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const Certificates = sequelize.define('certificates', {
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
        name: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        organization: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        can_expire: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        expiry_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        issue_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: 0
        },
        credential_id: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        credential_url: {
            type: Sequelize.STRING(300),
            allowNull: true,
            defaultValue: null
        },
        status: {
            type: Sequelize.ENUM,
            values:["0","1"],
            allowNull: true,
            defaultValue: "0"
        }

    },
    {
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ['updatedAt']
            },
            include:["tagged_skills"]
        }
      }
    );

    SequelizeP.paginate(Certificates);
    Certificates.associate = function(models) {

        Certificates.hasMany(models.certificate_tagged_skills, {
            foreignKey: 'certificateId',
            as: 'tagged_skills',
            onDelete: "CASCADE"
          });

       
    }
    return Certificates;
};
