const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const addStudentAmbassadorValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        first_name:validations.general.required,
        mobile: validations.student_ambassador.mobile,
        countryCode: validations.general.required,
        email:validations.student_ambassador.email,
        college:validations.general.required,
        degree:validations.general.required,
        country:validations.general.required,
        state:validations.general.required,
        city:validations.general.required,
      });

        validate(v, res, next, req);
    }

    const addTeamRequestValidator = async (req, res, next) => {
        console.log("UserValidator => addTeamRequestValidator");

        const v = new Validator(req.body, {
          first_name:validations.general.required,
          mobile: validations.team_request.mobile,
          countryCode: validations.general.required,
          email:validations.team_request.email
        });
        validate(v, res, next, req);
  
    }

    const addCollegePartnershipValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
          first_name:validations.general.required,
          mobile: validations.college_partnership.mobile,
          countryCode: validations.general.required,
          email:validations.college_partnership.email
        });
        validate(v, res, next, req);
  
    }

    const addAdvertisementValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
          first_name:validations.general.required,
          mobile: validations.advertisement.mobile,
          countryCode: validations.general.required,
          email:validations.advertisement.email
        });
        validate(v, res, next, req);
  
    }

    const addInvestorRelationsValidator = async (req, res, next) => {

        const v = new Validator(req.body, {
          first_name:validations.general.required,
          mobile: validations.investor_relation.mobile,
          countryCode: validations.general.required,
          email:validations.investor_relation.email
        });
        validate(v, res, next, req);
  
    }
    
    const addBasicInfoValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        first_name:validations.general.required,
        last_name:validations.general.required,
        username:validations.general.required,
        gender: validations.general.required,
        country: validations.general.required,
        state:validations.general.required,
        city:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const addStudentBasicInfoValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        email:validations.general.required,
        password:validations.general.required,
        first_name:validations.general.required,
        last_name:validations.general.required,
        gender: validations.general.required,
        country: validations.general.required,
        state:validations.general.required,
        city:validations.general.required
      });

        validate(v, res, next, req);
    }

    const addStudentDegreeDataValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        degree_data:validations.general.required,
        userId:validations.user.id
      });

        validate(v, res, next, req);
    }

    const addStudentDegreeValidator = async (req, res, next) => {

      const v = new Validator(req.body.degree_data, {
        college_name:validations.general.required,
        degree:validations.general.required,
        field_of_study: validations.general.required,
        start_year: validations.general.required,
        end_year:validations.general.required
      });

        validate(v, res, next, req);
    }

    const addStudentCareerDataValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        career_data:validations.general.required,
        userId:validations.user.id
      });

        validate(v, res, next, req);
    }

    const addStudentSKillDataValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        userId:validations.user.id
      });

        validate(v, res, next, req);
    }
    
    const addCounsellerInfoValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        first_name:validations.general.required,
        last_name:validations.general.required,
        username:validations.general.required,
        gender: validations.general.required,
        country: validations.general.required,
        state:validations.general.required,
        city:validations.general.required
      });

        validate(v, res, next, req);
    }

    const addCounsellerInfoValidator2 = async (req, res, next) => {

      const v = new Validator(req.body, {
        email:validations.general.required,
        first_name:validations.general.required,
        last_name:validations.general.required,
        username:validations.general.required,
        gender: validations.general.required,
        country: validations.general.required,
        state:validations.general.required,
        city:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const addRecruiterDetailsValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        first_name:validations.general.required,
        last_name:validations.general.required,
        username:validations.general.required,
        country: validations.general.required,
        state:validations.general.required,
        city:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const addEarlyJoinValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        email:validations.early_join.email,
        user_type:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const addSkillValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        skill_id:validations.general.required,
        level:validations.general.required
      });

        validate(v, res, next, req);
    }

    const getSkillDetailsValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
        skill_id:validations.general.required
      });

        validate(v, res, next, req);
    }

    const addCertificateValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        name:validations.general.required,
        organization:validations.general.required,
        issue_date: validations.general.required
      });

        validate(v, res, next, req);
    }

    const deleteCertificateValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        certificateId:validations.certificate.id
      });

        validate(v, res, next, req);
    }
    
    const addStudentCareerPathValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        career_path_name:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const addRequestValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        user_id:validations.user.id,
        service_id:validations.service.id,
        price:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const addRequestDetailsValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        request_id:validations.user_request.id,
        time_slots:validations.general.required,
        // meeting_link:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const acceptTimeSlotValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        request_id:validations.user_request.id,
        time_slot_id:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const rejectRequestValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        request_id:validations.user_request.id
      });

        validate(v, res, next, req);
    }
    
    const completeRequestValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        request_id:validations.user_request.id,
        recorded_video_link:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const addUserServiceInfoValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        service_id:validations.service.id,
        fee:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    const removeUserServiceInfoValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        service_id:validations.service.id
      });

        validate(v, res, next, req);
    }

    const addStudentWorkExperience = async (req, res, next) => {

      const v = new Validator(req.body.experience_data, {
        title:validations.general.required,
        employment_type:validations.general.required,
        company_name: validations.general.required,
        start_date: validations.general.required
      });

        validate(v, res, next, req);
    }

    const addRatingValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        rating:validations.general.required,
        review:validations.general.required,
        user_id: validations.user.id
      });

        validate(v, res, next, req);
    }

    const addWalletAmountValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        amount:validations.general.required
      });

        validate(v, res, next, req);
    }

    const saveQueryValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        subject:validations.general.required,
        query:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    return {
        addStudentAmbassadorValidator,
        addTeamRequestValidator,
        addCollegePartnershipValidator,
        addAdvertisementValidator,
        addInvestorRelationsValidator,
        addBasicInfoValidator,
        addStudentBasicInfoValidator,
        addStudentDegreeDataValidator,
        addStudentDegreeValidator,
        addStudentCareerDataValidator,
        addStudentSKillDataValidator,
        addCounsellerInfoValidator,
        addCounsellerInfoValidator2,
        addRecruiterDetailsValidator,
        addEarlyJoinValidator,
        addSkillValidator,
        getSkillDetailsValidator,
        addCertificateValidator,
        deleteCertificateValidator,
        addStudentCareerPathValidator,
        addRequestValidator,
        addRequestDetailsValidator,
        acceptTimeSlotValidator,
        rejectRequestValidator,
        completeRequestValidator,
        addUserServiceInfoValidator,
        removeUserServiceInfoValidator,
        addStudentWorkExperience,
        addRatingValidator,
        addWalletAmountValidator,
        saveQueryValidator
    }
}
