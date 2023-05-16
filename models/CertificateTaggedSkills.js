const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const CertificateTaggedSkills = sequelize.define('certificate_tagged_skills', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        certificateId: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "certificates",
                key: 'id'
            }
        },
        skill_id: {
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: "skills",
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
            include:["skill_details"]
        }
      }
    );

    CertificateTaggedSkills.associate = function(models) {

        CertificateTaggedSkills.belongsTo(models.skills, {
            foreignKey: 'skill_id',
            as: 'skill_details',
            onDelete: "CASCADE"
          });
    }
    return CertificateTaggedSkills;
};
