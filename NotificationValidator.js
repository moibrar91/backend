const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {


    const validateNotificationPermission = async (req, res, next) => {

        const v = new Validator(req.body, {
          notification_permission: validations.general.requiredString
        });

        validate(v, res, next, req);
    }

    const validateUpdateNotification = async (req, res, next) => {

        const v = new Validator(req.body, {
          isRead: validations.general.requiredString,
          message_id: validations.general.requiredString,
        });

        validate(v, res, next, req);
    }


    const validateGetNotification = async (req, res, next) => {

      const v = new Validator(req.query, {
          notification_type: validations.general.required
      });

        validate(v, res, next, req);
    }

    const validateNotificationStatus = async (req, res, next) => {

      const v = new Validator(req.body, {
        notificationId: validations.general.required,
        status: validations.general.required,
      });

        validate(v, res, next, req);
    }

    return {
        validateNotificationPermission,
        validateUpdateNotification,
        validateGetNotification,
        validateNotificationStatus
    }
}
