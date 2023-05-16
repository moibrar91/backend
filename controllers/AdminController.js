const {Op} = require("sequelize");
const AdminService = require("../services/AdminService");
const SettingService = require("../services/SettingService");
const UserService = require("../services/UserService");
const helpers = require("../util/helpers");

module.exports = () => {
  const login = async (req, res, next, transaction) => {
    console.log("AdminController => login");
    let {email, password} = req.query;

    let token = "";
    let admin = await AdminService().fetchByEmail(email, transaction);
    if(admin) {
      let passwordVerify = await AdminService().verifyPassword(admin.id, password, transaction);

      if(!passwordVerify) {
        req.rCode = 0;
        req.msg = "incorrect_password";
        req.rData = {token};
      } else {
        let adminId = admin.id;
        let name = admin.name;
        email = admin.email;
        let admin_type = admin.user_type;
        token = await helpers().createJWT({adminId: admin.id, isAdmin: true, user_type: "admin", verified: true});
        let assigned_roles = await AdminService().fetchAdminRoles({adminId}, transaction);
        req.rData = {adminId, name, email, admin_type, token, assigned_roles};
      }
    } else {
      req.rCode = 0;
      req.msg = "wrong_email";
      req.rData = {token};
    }

    next();
  }

  const forgotpassword = async (req, res, next, transaction) => {
    let {email} = req.query;

    let admin = await AdminService().fetchByEmail(email, transaction);
    if(admin) {
      let otp = helpers().generateOTP();
      req.rData = {otp}
      req.msg = 'otp_sent_email';
    } else {
      req.rCode = 0;
      req.msg = "wrong_email";
      req.rData = {};
    }
    next();
  }

  const resetPassword = async (req, res, next, transaction) => {
    console.log("AdminController => resetPassword");
    let {password, adminId} = req.body;
    let admin = {password};

    admin.password = await helpers().hashPassword(password);

    admin = await AdminService().updatePassword(adminId, admin, transaction);

    req.msg = 'password_changed';
    next();


  }

  const changePassword = async (req, res, next, transaction) => {
    console.log("AdminController => changePassword");
    let {current_password, new_password, adminId} = req.body;


    let passwordVerify = await AdminService().verifyPassword(adminId, current_password, transaction);

    if(!passwordVerify) {
      req.rCode = 0;
      req.msg = "incorrect_current_password";

    } else {
      let admin = {};
      new_password = await helpers().hashPassword(new_password);
      admin.password = new_password;
      admin = await AdminService().updatePassword(adminId, admin, transaction);
      req.msg = 'password_changed';
    }
    next();
  }

  const verifyOtp = async (req, res, next, transaction) => {
    console.log("AdminController => verifyOtp");
    let {email, code} = req.query;

    var verify = code == '123456' ? true : false;

    let token = "";
    if(verify) {
      let admin = await AdminService().fetchByEmail(email, transaction);
      if(admin) {
        token = await helpers().createJWT({adminId: admin.id, isAdmin: true, verified: true});
        req.rData = {token};
        req.msg = 'otp_verified';
      } else {
        req.rCode = 0;
        req.msg = "wrong_email";
        req.rData = {token};
      }
    } else {
      req.rCode = 0;
      req.msg = "incorrect_otp";
    }
    next();
  }

  const changeAboutUs = async (req, res, next, transaction) => {
    console.log("AdminController => changeAboutUs");

    let {about, image, adminId, status} = req.body;


    let exist = await SettingService().getAbout({}, transaction);
    if(exist) {
      let result = await SettingService().updateAbout({id: exist.id}, {about, image, status}, transaction);
    } else {
      let result = await SettingService().addAboutUs({about, image, status}, transaction);
    }

    let data = await SettingService().getAbout({}, transaction);

    req.rData = {data};
    req.msg = 'about_changed';
    next();
  }

  const changePrivacyPolicy = async (req, res, next, transaction) => {
    console.log("AdminController => changePrivacyPolicy");
    let {privacy_and_policy, image, status, adminId} = req.body;
    let setting = {privacy_and_policy, image, status};
    let exist = await SettingService().getPrivacyAndPolicies({}, transaction);
    if(exist) {
      let result = await SettingService().updatePrivacyAndPolicy({id: exist.id}, setting, transaction);
    } else {
      let result = await SettingService().addPrivacyAndPolicy(setting, transaction);
    }
    let data = await SettingService().getPrivacyAndPolicies({}, transaction);

    req.rData = {data};
    req.msg = 'privacy_policy_changed';
    next();
  }

  const changeTermAndCondition = async (req, res, next, transaction) => {
    console.log("AdminController => changeTermAndCondition");
    let {term_and_condition, image, adminId, status} = req.body;
    let setting = {term_and_condition, image, status};
    let exist = await SettingService().getTermAndCondition({}, transaction);
    if(exist) {
      let result = await SettingService().updateTermAndCondition({id: exist.id}, setting, transaction);
    } else {
      let result = await SettingService().addTermAndCondition(setting, transaction);
    }
    let data = await SettingService().getTermAndCondition({}, transaction);
    req.rData = {data};
    req.msg = 'term_and_conditions_changed';
    next();
  }

  const getYearList = async (req, res, next) => {
    console.log("AdminController => getYearList");
    var today = new Date();
    var yyyy = today.getFullYear();
    let year_list = [];
    for(var i = yyyy;i >= yyyy - 30;i--) {
      let isCurrentYear = yyyy == i ? true : false;
      year_list.push({year: i, isCurrentYear});
    }
    req.rData = {year_list};
    req.msg = 'year_list';

    next();

  }



  const addCareerCollaboration = async (req, res, next, transaction) => {
    console.log("AdminController => addPlan collaboration");
    let {title, image, career_id} = req.body;
    console.log('body', req.body);

    let data = {title, image, career_id};
    let result = await AdminService().addCareerCollaboration(data, transaction);
    // let result = await AdminService().fetchCareerPersonas({id:41}, transaction, "withPersonas");
    req.rData = result;

    // res.json({"status": "success", result})
    next();
  }

  const addCareerPersonas = async (req, res, next, transaction) => {
    console.log("AdminController => addPlan personas");
    let {title, image, career_id} = req.body;
    console.log('body', req.body);
    // if (career_id) {
    //   let update_data = { title, image };
    //   let update_result = await AdminService().updateCareerPersonas({ id: career_id }, update_data, transaction);
    //   req.rData = update_result;
    // } else {
    //   let data = { title, image,career_id };
    //   let add_result = await AdminService().addCareerPersonas(data, transaction);
    //   req.rData = add_result;
    // }
    //   let data = {
    //     title: "Clean Code10",
    //     author: "Robert Cecil Martin111",
    //     release_date: "2023-02-14",
    //     subject: 3
    // }

    let data = {title, image, career_id};
    let result = await AdminService().addCareerPersonas(data, transaction);
    // let result = await AdminService().fetchCareerPersonas({id:41}, transaction, "withPersonas");
    req.rData = result;

    // res.json({"status": "success", result})
    next();
  }

  const addCareer = async (req, res, next, transaction) => {
    console.log("AdminController => addPlan");
    let {title, image, description, skill_description, effective_tools_description, certifications, career_options, core_skills, booster_skills, effective_tools, careerId} = req.body;
    let data = {title, image, description, skill_description, effective_tools_description, certifications, career_options};
    try {
      if(core_skills) core_skills = JSON.parse(core_skills.replace(/\\/g, ""));
      if(booster_skills) booster_skills = JSON.parse(booster_skills.replace(/\\/g, ""));
      if(effective_tools) effective_tools = JSON.parse(effective_tools.replace(/\\/g, ""));
    } catch(e) {

    }
    if(careerId) {
      let update_result = await AdminService().updateCareer({id: careerId}, data, transaction);
    } else {
      let add_result = await AdminService().addCareer(data, transaction);
      careerId = add_result.id;
    }
    let core_ids = [];
    let booster_ids = [];
    let tool_ids = [];
    if(core_skills && core_skills.length > 0) core_ids = await saveCareerSkills(core_skills, careerId, "core", transaction);
    if(core_ids.length > 0) delete_result = await AdminService().deleteCareerSkill({career_id: careerId, id: {[Op.notIn]: core_ids}, skill_type: "core"}, transaction);
    if(booster_skills && booster_skills.length > 0) booster_ids = await saveCareerSkills(booster_skills, careerId, "booster", transaction);
    if(booster_ids.length > 0) delete_result = await AdminService().deleteCareerSkill({career_id: careerId, id: {[Op.notIn]: booster_ids}, skill_type: "booster"}, transaction);
    if(effective_tools && effective_tools.length > 0) tool_ids = await saveEffectiveTools(effective_tools, careerId, transaction);
    if(tool_ids.length > 0) delete_result = await AdminService().deleteEffectiveToolRelation({career_id: careerId, id: {[Op.notIn]: tool_ids}}, transaction);
    data = await AdminService().fetchCareer({id: careerId}, transaction, "withSpecialization");
    req.rData = data;
    next();
  }

  const saveCareerSkills = async (data, careerId, skill_type, transaction) => {
    let ids = [];
    for(const item of data) {
      let {skill_id} = item;
      let skill_info = {career_id: careerId, skill_id, skill_type};
      let exist = await AdminService().fetchCareerSkill(skill_info, transaction);
      if(!exist) {
        let result = await AdminService().addCareerSkill(skill_info, transaction);
        ids.push(result.id)
      } else {
        ids.push(exist.id)
      }

    }
    return ids;

  }

  const saveEffectiveTools = async (data, careerId, transaction) => {
    let ids = [];
    for(const item of data) {
      let {tool_id, tool_name} = item;
      if(tool_name) {
        let add_result = await AdminService().addEffectiveTool({title: tool_name}, transaction);
        tool_id = add_result.id;
      }
      let tool_info = {career_id: careerId, tool_id};
      let exist = await AdminService().fetchEffectiveToolRelation(tool_info, transaction);
      if(!exist) {
        let result = await AdminService().addEffectiveToolRelation(tool_info, transaction);
        ids.push(result.id)
      } else {
        ids.push(exist.id)
      }

    }
    return ids;

  }

  const changeCareerStatus = async (req, res, next, transaction) => {
    console.log("AdminController => changeCareerStatus");
    let {careerId, status, adminId} = req.body;
    let data = {isActive: status};
    let update_result = await AdminService().updateCareer({id: careerId}, data, transaction);
    next();
  }

  const getCareerDetails = async (req, res, next, transaction) => {
    console.log("AdminController => getCareerDetails");
    let {careerId} = req.query;
    let career_details = await AdminService().fetchCareer({id: careerId}, transaction, "withSpecialization");
    req.rData = {career_details}
    next();
  }

  const deleteCareer = async (req, res, next, transaction) => {
    console.log("AdminController => deleteCareer");
    let {careerId} = req.body;
    let delete_result = await AdminService().deleteCareer({id: careerId}, transaction);
    next();
  }
  const deleteCareerPersonas = async (req, res, next, transaction) => {
    console.log("AdminController => deleteCareer");
    let {careerId} = req.body;
    let delete_result = await AdminService().deleteCareerPersonas({id: careerId}, transaction);
    next();
  }
  const deleteCareerCollaboration = async (req, res, next, transaction) => {
    console.log("AdminController => deleteCareer");
    let {careerId} = req.body;
    let delete_result = await AdminService().deleteCareerCollaboration({id: careerId}, transaction);
    next();
  }

  const getCareerPersonasDetails = async (req, res, next, transaction) => {
    console.log("AdminController => getSkillDetails");
    // let { skillId } = req.query;
    let career_personas_list = await AdminService().fetchCareerPeronas();
    req.rData = {career_personas_list}
    next();
  }

  const getCareerCollaborationDetails = async (req, res, next, transaction) => {
    console.log("AdminController => getSkillDetails");
    // let { skillId } = req.query;
    let career_collaboration_list = await AdminService().fetchCareerCollaboration();
    req.rData = {career_collaboration_list}
    next();
  }


  const addSpeciality = async (req, res, next, transaction) => {
    console.log("AdminController => addSpeciality");
    let {title, image, description, career_id, specialityId} = req.body;
    let data = {title, image, description, career_id};
    if(specialityId) {
      let update_result = await AdminService().updateSpeciality({id: specialityId}, data, transaction);
    } else {
      let add_result = await AdminService().addSpeciality(data, transaction);
      specialityId = add_result.id;
    }
    data = await AdminService().fetchSpeciality({id: specialityId}, transaction);
    req.rData = data;
    next();
  }

  const changeSpecialityStatus = async (req, res, next, transaction) => {
    console.log("AdminController => changeSpecialityStatus");
    let {specialityId, status, adminId} = req.body;
    let data = {isActive: status};
    let update_result = await AdminService().updateSpeciality({id: specialityId}, data, transaction);
    next();
  }

  const getSpecialityDetails = async (req, res, next, transaction) => {
    console.log("AdminController => getSpecialityDetails");
    let {specialityId} = req.query;
    let speciality_details = await AdminService().fetchSpeciality({id: specialityId}, transaction);
    req.rData = {speciality_details}
    next();
  }

  const deleteSpeciality = async (req, res, next, transaction) => {
    console.log("AdminController => deleteSpeciality");
    let {specialityId} = req.body;
    let delete_result = await AdminService().deleteSpeciality({id: specialityId}, transaction);
    next();
  }

  const addSkill = async (req, res, next, transaction) => {
    console.log("AdminController => addSkill");
    let {title, career_ids, skillId} = req.body;
    try {
      if(career_ids) career_ids = JSON.parse(career_ids.replace(/\\/g, ""));
    } catch(e) {

    }
    let data = {title};
    if(skillId) {
      let update_result = await AdminService().updateSkill({id: skillId}, data, transaction);
    } else {
      let add_result = await AdminService().addSkill(data, transaction);
      skillId = add_result.id;
    }
    let result_ids = [];
    if(career_ids && career_ids.length > 0) result_ids = await saveSkillCareer(career_ids, skillId, transaction);
    if(result_ids.length > 0) delete_result = await AdminService().deleteCareerSkill({skill_id: skillId, id: {[Op.notIn]: result_ids}}, transaction);
    data = await AdminService().fetchSkill({id: skillId}, transaction, "withCareerPath");
    req.rData = data;
    next();
  }

  const saveSkillCareer = async (data, skill_id, transaction) => {
    let ids = [];
    for(const item of data) {
      let {id, skill_type} = item;
      let skill_info = {career_id: id, skill_id, skill_type};
      let exist = await AdminService().fetchCareerSkill(skill_info, transaction);
      if(!exist) {
        let result = await AdminService().addCareerSkill(skill_info, transaction);
        ids.push(result.id)
      } else {
        ids.push(exist.id)
      }

    }
    return ids;

  }

  const changeSkillStatus = async (req, res, next, transaction) => {
    console.log("AdminController => changeSkillStatus");
    let {skillId, status, adminId} = req.body;
    let data = {isActive: status};
    let update_result = await AdminService().updateSkill({id: skillId}, data, transaction);
    next();
  }

  const getSkillDetails = async (req, res, next, transaction) => {
    console.log("AdminController => getSkillDetails");
    let {skillId} = req.query;
    let skill_details = await AdminService().fetchSkill({id: skillId}, transaction, "withCareerPath");
    req.rData = {skill_details}
    next();
  }

  const deleteSkill = async (req, res, next, transaction) => {
    console.log("AdminController => deleteSkill");
    let {skillId} = req.body;
    let delete_result = await AdminService().deleteSkill({id: skillId}, transaction);
    next();
  }

  const getAllSkillList = async (req, res, next, transaction) => {
    console.log("AdminController => getAllSkillList");
    let {page, limit, status, career_id, search} = req.query;
    let filters = {page, limit, status, career_id, search};
    let scope = career_id ? "withCareerPathRelation" : "defaultScope";
    let total_query = career_id ? {"$career_path_relation.career_id$": career_id} : {};
    let total_active_query = career_id ? {"$career_path_relation.career_id$": career_id, isActive: 1} : {isActive: 1};
    let total_inactive_query = career_id ? {"$career_path_relation.career_id$": career_id, isActive: 0} : {isActive: 0};
    let skill_list = await AdminService().getAllSkillList(filters, transaction, scope);
    let total_skill = await AdminService().countSkill(total_query, transaction, scope);
    let total_active_skill = await AdminService().countSkill(total_active_query, transaction, scope);
    let total_inactive_skill = await AdminService().countSkill(total_inactive_query, transaction, scope);
    req.rData = {total_skill, total_active_skill, total_inactive_skill, skill_list};
    next();
  }

  const userList = async (req, res, next, transaction) => {
    console.log("AdminController=>userList");
    let {search, page, limit, user_type, status} = req.query;
    let {adminId} = req.body;
    let filters = {search, page, limit, user_type, status};
    let scope = (user_type == "counseller" || user_type == "mentor") ? "counsellerList" : user_type == "recruiter" ? "recruiterList" : user_type == "student" ? "student_details" : "defaultScope";
    let user_list = await UserService().userList(filters, transaction, scope);
    let total_user = await UserService().countUser({user_type, isProfileComplete: 1}, transaction);
    let total_active_user = await UserService().countUser({user_type, isActive: 1, isProfileComplete: 1}, transaction);
    let total_inactive_user = await UserService().countUser({user_type, isActive: 0, isProfileComplete: 1}, transaction);
    req.rData = {page, limit, total_user, total_active_user, total_inactive_user, user_list};
    req.msg = 'user_list';
    next();

  }

  const changeUserStatus = async (req, res, next, transaction) => {
    console.log("AdminController => changeUserStatus");
    let {userId, status, adminId} = req.body;
    let data = {isActive: status};
    let update_result = await UserService().updateProfile(userId, data, transaction);
    next();
  }

  const getUserDetails = async (req, res, next, transaction) => {
    console.log("AdminController=>getUserDetails");
    let {userId, user_type} = req.query;

    let query = {id: userId, user_type};
    let scope = (user_type == "counseller" || user_type == "mentor") ? "counsellerList" : user_type == "recruiter" ? "recruiterList" : user_type == "student" ? "student_details" : "defaultScope";
    let user_details = await UserService().fetchByQuery(query, transaction, scope);
    req.rData = {user_details};
    next();

  }


  const addSubAdmin = async (req, res, next, transaction) => {
    console.log("AdminController => addSubAdmin");
    let {name, email, password, image, manage_career_path, manage_speciality, manage_skill, manage_student, manage_counseller, manage_mentor, manage_request, manage_forum, manage_setting, manage_withdrawal, subAdminId} = req.body;
    let data = {name, email, image};
    if(subAdminId) {
      let update_result = await AdminService().updateAdmin({id: subAdminId}, data, transaction);

    } else {
      if(password) data.password = await helpers().hashPassword(password);
      let add_result = await AdminService().addAdmin(data, transaction);
      subAdminId = add_result.id;
    }
    let role_data = {adminId: subAdminId, manage_career_path, manage_speciality, manage_skill, manage_student, manage_counseller, manage_mentor, manage_request, manage_forum, manage_setting, manage_withdrawal}

    let exist_role = await AdminService().fetchAdminRoles({adminId: subAdminId}, transaction);
    if(exist_role) {
      let update_result = await AdminService().updateAdminRoles({id: exist_role.id}, role_data, transaction);

    } else {
      let add_result = await AdminService().addAdminRoles(role_data, transaction);
      subAdminId = add_result.id;
    }
    next();
  }

  const subAdminList = async (req, res, next, transaction) => {
    console.log("AdminController=>subAdminList");
    let {search, page, limit, status} = req.query;
    let {adminId} = req.body;
    let filters = {search, page, limit, status};
    let sub_admin_list = await AdminService().subAdminList(filters, transaction, "withAssignedRoles");
    let total_sub_admin = await AdminService().countSubAdmin({}, transaction);
    let total_active_sub_admin = await AdminService().countSubAdmin({isActive: 1}, transaction);
    let total_inactive_sub_admin = await AdminService().countSubAdmin({isActive: 0}, transaction);
    req.rData = {page, limit, total_sub_admin, total_active_sub_admin, total_inactive_sub_admin, sub_admin_list};
    next();

  }

  const getAdminDetails = async (req, res, next, transaction) => {
    console.log("AdminController=>getAdminDetails");
    let {sub_admin_id} = req.params;
    let admin_details = await AdminService().fetchAdmin({id: sub_admin_id}, transaction, "withAssignedRoles");
    req.rData = {admin_details};
    next();

  }

  const deleteSubAdmin = async (req, res, next, transaction) => {
    console.log("AdminController => deleteSubAdmin");
    let {sub_admin_id} = req.params;
    let delete_result = await AdminService().deleteSubAdmin({id: sub_admin_id, user_type: "sub-admin"}, transaction);
    next();
  }

  const changeSubAdminStatus = async (req, res, next, transaction) => {
    console.log("AdminController => changeSubAdminStatus");
    let {sub_admin_id, status, adminId} = req.body;
    let data = {isActive: status};
    let update_result = await AdminService().updateAdmin({id: sub_admin_id}, data, transaction);
    next();
  }

  const getAllModules = async (req, res, next, transaction) => {
    console.log("AdminController => getAllModules");
    let {adminId} = req.body;
    let data = [{key: "manage_career_path", name: "Career path"}, {key: "manage_speciality", name: "Speciality"}, {key: "manage_skill", name: "Skill"}, {key: "manage_student", name: "Student"}, {key: "manage_counseller", name: "Counseller"}, {key: "manage_mentor", name: "Mentor"}, {key: "manage_request", name: "Request"}, {key: "manage_forum", name: "Forum"}, {key: "manage_setting", name: "Setting"}, {key: "manage_withdrawal", name: "Withdrawal requests"}];
    req.rData = data;
    next();
  }

  const addOrganization = async (req, res, next, transaction) => {
    console.log("AdminController => addOrganization");
    let {name, organization_id, adminId} = req.body;
    let data = {name};
    if(organization_id) {
      let result = await SettingService().updateOrganization({id: organization_id}, data, transaction);
    } else {
      let result = await SettingService().addOrganization(data, transaction);
      organization_id = result.id;
    }
    data = await SettingService().getOrganization({id: organization_id}, transaction);

    req.rData = data;
    next();
  }

  const addIndustry = async (req, res, next, transaction) => {
    console.log("AdminController => addIndustry");
    let {name, image, industry_id, adminId} = req.body;
    let data = {name, image};
    if(industry_id) {
      let result = await SettingService().updateIndustry({id: industry_id}, data, transaction);
    } else {
      let result = await SettingService().addIndustry(data, transaction);
      industry_id = result.id;
    }
    data = await SettingService().getIndustry({id: industry_id}, transaction);

    req.rData = data;
    next();
  }



  const deleteIndustry = async (req, res, next, transaction) => {
    console.log("AdminController => deleteIndustry");
    let {industry_id} = req.params;
    let delete_result = await SettingService().deleteIndustry({id: industry_id}, transaction);
    next();
  }

  /*----------------------------withdrawal request -----------------------*/


  const withdrawalRequestList = async (req, res, next, transaction) => {
    console.log("AdminController=>withdrawalRequestList");
    let {search, page, limit, status} = req.query;
    let {adminId} = req.body;
    let filters = {search, page, limit, status};
    let request_list = await AdminService().withdrawalRequestList(filters, transaction, "withUserDetails");
    let total_request = await AdminService().countWithdrawalRequest({}, transaction);
    let total_pending_request = await AdminService().countWithdrawalRequest({status: "0"}, transaction);
    let total_accepted_request = await AdminService().countWithdrawalRequest({status: "1"}, transaction);
    let total_rejected_request = await AdminService().countWithdrawalRequest({status: "2"}, transaction);
    req.rData = {page, limit, total_request, total_pending_request, total_accepted_request, total_rejected_request, request_list};
    next();

  }

  const getWithdrawalRequestDetails = async (req, res, next, transaction) => {
    console.log("AdminController=>getWithdrawalRequestDetails");
    let {request_id} = req.params;
    let request_details = await AdminService().fetchWithdrawalRequest({id: request_id}, transaction, "withUserDetails");
    req.rData = {request_details};
    next();

  }

  const deleteWithdrawalRequest = async (req, res, next, transaction) => {
    console.log("AdminController => deleteWithdrawalRequest");
    let {request_id} = req.params;
    let delete_result = await AdminService().deleteWithdrawalRequest({id: request_id}, transaction);
    next();
  }

  const changeWithdrawalRequestStatus = async (req, res, next, transaction) => {
    console.log("AdminController => changeWithdrawalRequestStatus");
    let {request_id, status, adminId} = req.body;
    let data = {status};
    let update_result = await AdminService().updateWithdrawalRequest({id: request_id}, data, transaction);
    next();
  }

  /*-----------------------------------------------FAQs-----------------------------------*/
  const addFAQ = async (req, res, next, transaction) => {
    console.log("AdminController => addFAQ");
    let {question, answer, faq_id} = req.body;
    let data = {question, answer};
    if(faq_id) {
      let update_result = await AdminService().updateFAQ({id: faq_id}, data, transaction);

    } else {
      let add_result = await AdminService().addFAQ(data, transaction);
      faq_id = add_result.id;
    }
    next();
  }

  const FAQList = async (req, res, next, transaction) => {
    console.log("AdminController=>FAQList");
    let {search, page, limit, status} = req.query;
    if(!status) status = true;
    let filters = {search, page, limit, status};
    let FAQ_list = await AdminService().FAQList(filters, transaction);
    let total_FAQ = await AdminService().countFAQ({}, transaction);
    let total_active_FAQ = await AdminService().countFAQ({isActive: 1}, transaction);
    let total_inactive_FAQ = await AdminService().countFAQ({isActive: 0}, transaction);
    req.rData = {page, limit, total_FAQ, total_active_FAQ, total_inactive_FAQ, FAQ_list};
    next();

  }

  const getFAQDetails = async (req, res, next, transaction) => {
    console.log("AdminController=>getFAQDetails");
    let {FAQ_id} = req.params;
    let FAQ_details = await AdminService().fetchFAQ({id: FAQ_id}, transaction);
    req.rData = {FAQ_details};
    next();

  }

  const deleteFAQ = async (req, res, next, transaction) => {
    console.log("AdminController => deleteFAQ");
    let {FAQ_id} = req.params;
    let delete_result = await AdminService().deleteFAQ({id: FAQ_id}, transaction);
    next();
  }

  const changeFAQStatus = async (req, res, next, transaction) => {
    console.log("AdminController => changeFAQStatus");
    let {FAQ_id, status, adminId} = req.body;
    let data = {isActive: status};
    let update_result = await AdminService().updateFAQ({id: FAQ_id}, data, transaction);
    next();
  }
  /*-----------------------------------------------FAQs-----------------------------------*/

  /*-----------------------------------------------Help support query-----------------------------------*/

  const queryList = async (req, res, next, transaction) => {
    console.log("AdminController=>queryList");
    let {search, page, limit, } = req.query;

    let filters = {search, page, limit};
    let query_list = await AdminService().queryList(filters, transaction);
    let total_query = await AdminService().countQuery({}, transaction);
    req.rData = {page, limit, total_query, query_list};
    next();

  }

  const getQueryDetails = async (req, res, next, transaction) => {
    console.log("AdminController=>getQueryDetails");
    let {query_id} = req.params;
    let query_details = await AdminService().fetchQuery({id: query_id}, transaction);
    req.rData = {query_details};
    next();

  }

  const addReply = async (req, res, next, transaction) => {
    console.log("AdminController => changeFAQStatus");
    let {query_id, reply, adminId} = req.body;
    let data = {reply};
    let update_result = await AdminService().updateQuery({id: query_id}, data, transaction);
    next();
  }
  /*-----------------------------------------------Help support query-----------------------------------*/
  /*-----------------------------------------------Job types-----------------------------------*/

  const addJobType = async (req, res, next, transaction) => {
    console.log("AdminController => addJobType");
    let {job_type_id, name} = req.body;
    let data = {name};
    if(job_type_id) {
      let update_result = await AdminService().updateJobType({id: job_type_id}, data, transaction);

    } else {
      let add_result = await AdminService().addJobType(data, transaction);
      job_type_id = add_result.id;
    }
    let job_type_details = await AdminService().fetchJobType({id: job_type_id}, transaction);
    req.rData = {job_type_details}
    next();
  }

  const jobTypeList = async (req, res, next, transaction) => {
    console.log("AdminController=>jobTypeList");
    let {search, page, limit, } = req.query;

    let filters = {search, page, limit};
    let job_type_list = await AdminService().jobTypeList(filters, transaction);
    let total_job_type = await AdminService().countJobType({}, transaction);
    req.rData = {page, limit, total_job_type, job_type_list};
    next();

  }

  /*-----------------------------------------------Job types-----------------------------------*/

  /*-----------------------------------------------Jobs-----------------------------------*/

  const addJob = async (req, res, next, transaction) => {
    console.log("AdminController => addJob");
    let {job_id, company_name, job_type, experience, posted_date, last_date, price, posted_by} = req.body;
    let data = {company_name, job_type, experience, posted_date, last_date, price, posted_by};
    if(job_id) {
      let update_result = await AdminService().updateJob({id: job_id}, data, transaction);

    } else {
      let add_result = await AdminService().addJob(data, transaction);
      job_id = add_result.id;
    }
    let job_details = await AdminService().fetchJob({id: job_id}, transaction);
    req.rData = {job_details}
    next();
  }

  const jobList = async (req, res, next, transaction) => {
    console.log("AdminController=>jobList");
    let {search, page, limit, } = req.query;

    let filters = {search, page, limit};
    let job_list = await AdminService().jobList(filters, transaction);
    let total_job = await AdminService().countJob({}, transaction);
    req.rData = {page, limit, total_job, job_list};
    next();

  }

  /*-----------------------------------------------Jobs-----------------------------------*/


  return {
    login,
    forgotpassword,
    resetPassword,
    changePassword,
    verifyOtp,
    changeAboutUs,
    changePrivacyPolicy,
    changeTermAndCondition,
    getYearList,
    addCareer,
    changeCareerStatus,
    getCareerDetails,
    deleteCareer,
    addSpeciality,
    changeSpecialityStatus,
    getSpecialityDetails,
    deleteSpeciality,
    addSkill,
    changeSkillStatus,
    getSkillDetails,
    deleteSkill,
    getAllSkillList,
    userList,
    changeUserStatus,
    getUserDetails,
    addSubAdmin,
    subAdminList,
    getAdminDetails,
    deleteSubAdmin,
    changeSubAdminStatus,
    getAllModules,
    addOrganization,
    addIndustry,
    deleteIndustry,
    withdrawalRequestList,
    getWithdrawalRequestDetails,
    deleteWithdrawalRequest,
    changeWithdrawalRequestStatus,
    addFAQ,
    FAQList,
    getFAQDetails,
    deleteFAQ,
    changeFAQStatus,
    addJobType,
    jobTypeList,
    addJob,
    jobList,
    addCareerPersonas,
    addCareerCollaboration,
    deleteCareerPersonas,
    deleteCareerCollaboration,
    getCareerCollaborationDetails,
    getCareerPersonasDetails
  }
}
