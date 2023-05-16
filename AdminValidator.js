const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const loginValidator = async (req, res, next) => {

        const v = new Validator(req.query, {
            email: validations.general.required,
            password: validations.general.required,
        });

        validate(v, res, next, req);
    }

    const forgotPasswordValidator = async (req, res, next) => {

        const v = new Validator(req.query, {
            email: validations.general.required
        });

        validate(v, res, next, req);
    }

    const otpValidator = async (req, res, next) => {
        const v = new Validator(req.query, {
            code: validations.general.required,
            email: validations.general.required
        });

        validate(v, res, next, req);
    }

    const passwordValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            password: validations.general.required
        });

        validate(v, res, next, req);
    }

    const changePasswordValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            current_password: validations.general.required,
            new_password: validations.general.required
        });

        validate(v, res, next, req);
    }

    const privacyPolicyValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            privacy_policy: validations.general.required
        });

        validate(v, res, next, req);
    }

    const termAndConditionValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            term_and_condition: validations.general.required
        });

        validate(v, res, next, req);
    }

    const userIdValidator = async (req, res, next) => {
        if (!req.body.userId) {
            const v = new Validator(req.query, {
                userId: validations.general.required
            });

            validate(v, res, next, req);
        }
    }

    const addUserValidator = async (req, res, next) => {

        if (!req.body.userId) {
            const v = new Validator(req.body, {
                first_name: validations.general.required,
                last_name: validations.general.required,
                mobile: validations.user.unique_mobile,
                countryCode: validations.general.required,
                email: validations.user.email,
            });

            validate(v, res, next, req);
        } else {
            const v = new Validator(req.body, {
                first_name: validations.general.required,
                last_name: validations.general.required,
                mobile: validations.general.required,
                countryCode: validations.general.required,
                email: validations.general.required,
            });

            validate(v, res, next, req);
        }
    }

    const userStatusValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            userId: validations.general.required,
            status: validations.general.required
        });

        validate(v, res, next, req);
    }

    const titleValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            title: validations.general.required
        });

        validate(v, res, next, req);
    }

    const changeCareerStatusValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            careerId: validations.career.id,
            status: validations.general.required
        });

        validate(v, res, next, req);
    }

    const changeSpecialityStatusValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            specialityId: validations.speciality.id,
            status: validations.general.required
        });

        validate(v, res, next, req);
    }

    const changeSkillStatusValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            skillId: validations.skill.id,
            status: validations.general.required
        });

        validate(v, res, next, req);
    }

    const deleteCareerValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            careerId: validations.career.id,
        });

        validate(v, res, next, req);
    }

    const deleteSpecialityValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            specialityId: validations.speciality.id,
        });

        validate(v, res, next, req);
    }

    const deleteSkillValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            skillId: validations.skill.id,
        });

        validate(v, res, next, req);
    }

    const changeUserStatusValidator = async (req, res, next) => {
        const v = new Validator(req.body, {
            userId: validations.user.id,
            status: validations.general.required
        });
        validate(v, res, next, req);
    }

    const addAdminResponseValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            request_id: validations.user_request.id,
            status: validations.general.required
        });

        validate(v, res, next, req);
    }

    const removeRequestValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
            request_id: validations.user_request.id
        });

        validate(v, res, next, req);
    }

    const addSubAdminValidator = async (req, res, next) => {

        if (!req.body.subAdminId) {
            const v = new Validator(req.body, {
                name: validations.general.required,
                email: validations.admin.email,
                password: validations.general.required
            });

            validate(v, res, next, req);
        } else {
            const v = new Validator(req.body, {
                name: validations.general.required,
                email: validations.general.required
            });

            validate(v, res, next, req);
        }
    }

    const changeSubAdminStatusValidator = async (req, res, next) => {
        const v = new Validator(req.body, {
            sub_admin_id: validations.admin.id,
            status: validations.general.required
        });
        validate(v, res, next, req);
    }

    const subAdminIdValidator = async (req, res, next) => {
        const v = new Validator(req.params, {
            sub_admin_id: validations.admin.id
        });
        validate(v, res, next, req);
    }

    const addOrganizationValidator = async (req, res, next) => {
        const v = new Validator(req.body, {
            name: validations.general.required
        });
        validate(v, res, next, req);
    }

    const addIndustryValidator = async (req, res, next) => {
        const v = new Validator(req.body, {
            name: validations.general.required,
            image : validations.general.required
        });
        validate(v, res, next, req);
    }

    const changeWithdrawalRequestStatusValidator = async (req, res, next) => {
        const v = new Validator(req.body, {
            request_id: validations.general.required,
            status: validations.general.required
        });
        validate(v, res, next, req);
    }

    const addFAQValidator = async (req, res, next) => {
            const v = new Validator(req.body, {
                question: validations.general.required,
                answer: validations.general.required
            });

            validate(v, res, next, req);
        
    }

    const changeFAQStatusValidator = async (req, res, next) => {
        const v = new Validator(req.body, {
            FAQ_id: validations.general.required,
            status: validations.general.required
        });
        validate(v, res, next, req);
    }

    const addJobTypeValidator = async (req, res, next) => {
            const v = new Validator(req.body, {
                name: validations.general.required
            });

            validate(v, res, next, req);
        
    }

    const addJobValidator = async (req, res, next) => {
            const v = new Validator(req.body, {
                company_name: validations.general.required,
                job_type: validations.general.required,
                experience: validations.general.required,
                posted_date: validations.general.required,
                last_date: validations.general.required,
                price: validations.general.required,
                posted_by: validations.general.required,
            });

            validate(v, res, next, req);
        
    }


    return {
        loginValidator,
        forgotPasswordValidator,
        otpValidator,
        passwordValidator,
        changePasswordValidator,
        privacyPolicyValidator,
        termAndConditionValidator,
        userIdValidator,
        addUserValidator,
        userStatusValidator,
        titleValidator,
        changeCareerStatusValidator,
        changeSpecialityStatusValidator,
        changeSkillStatusValidator,
        deleteSkillValidator,
        deleteCareerValidator,
        deleteSpecialityValidator,
        changeUserStatusValidator,
        addAdminResponseValidator,
        removeRequestValidator,
        addSubAdminValidator,
        changeSubAdminStatusValidator,
        subAdminIdValidator,
        addOrganizationValidator,
        addIndustryValidator,
        changeWithdrawalRequestStatusValidator,
        addFAQValidator,
        changeFAQStatusValidator,
        addJobTypeValidator,
        addJobValidator
    }
}
