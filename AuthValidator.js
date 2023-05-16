const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const mobileValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          mobile: validations.general.required,
          countryCode: validations.general.required,
          device_type:validations.general.required,
          device_token:validations.general.required
      });

        validate(v, res, next, req);
    }

    const resendOtpMobileValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
            user_type: validations.general.required
      });

        validate(v, res, next, req);
    }

    const loginValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            email: validations.general.required,
            // password: validations.general,
            // user_type:validations.general.required
        });

        validate(v, res, next, req);
    }

    const signupValidator = async (req, res, next) => {
      // console.log('sss');
        const v = new Validator(req.body, {
            email: validations.user.email,
            username: validations.user.username,
            password: validations.general.required,
            user_type:validations.general.required
        });

        validate(v, res, next, req);
    }



    const otpValidator = async (req, res, next) => {
        const v = new Validator(req.body, {
          userId: validations.user.id,
          code: validations.general.required,
          otp_for: validations.general.required,
          user_type: validations.general.required,
        });

        validate(v, res, next, req);
    }

    const forgotPasswordValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
            email: validations.user.existEmail
      });

        validate(v, res, next, req);
    }
    const resetPasswordValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
          password: validations.general.required
      });

        validate(v, res, next, req);
    }

    

    const changePasswordValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
          new_password: validations.general.required,
          current_password: validations.general.required
        });

        validate(v, res, next, req);
    }

    
    return {
        mobileValidator,
        otpValidator,
        loginValidator,
        signupValidator,
        resendOtpMobileValidator,
        forgotPasswordValidator,
        resetPasswordValidator,
        changePasswordValidator
    }
}
