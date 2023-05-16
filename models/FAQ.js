const Sequelize = require('sequelize');
const SequelizeP = require("sequelize-paginate");

module.exports = function (sequelize) {
    const FAQ = sequelize.define('FAQs', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        question: {
            type: Sequelize.TEXT
        },
        answer: {
            type: Sequelize.TEXT
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
                exclude: [ 'createdAt', 'updatedAt']
            }
        }
      });

    return FAQ;
};
