const {Op} = require("sequelize");
const Sequelize = require('sequelize');
const UserService = require("../services/UserService");
const SettingService = require("../services/SettingService");
const AdminService = require("../services/AdminService");
const helpers = require("../util/helpers");
const colors = require("colors");
let Country = require('country-state-city').Country;
let State = require('country-state-city').State;
let City = require('country-state-city').City;

module.exports = () => {
  const each_column_value = parseFloat(100 / 11).toFixed(2);
  const valid_fields = ["first_name", "gender", "email", "image", "country", "state", "city", "about", "student_degree_details", "student_career_details", "student_skill_details"];

  const addBasicInfo = async (req, res, next, transaction) => {
    console.log("StudentController => addBasicInfo");

    let {first_name, last_name, gender, country, state, city, state_isocode, city_isocode, image, about, username, countryCode, mobile, userId} = req.body;
    let user = {first_name, last_name, gender, country, state, city, state_isocode, city_isocode, image, about, username};

    if(req.authUser.profile_stag == "0") user.profile_stag = "1";
    let update_result = await UserService().updateProfile(userId, user, transaction);
    let percenage_result = await calculateCompleteProfilePercentage(userId, transaction);
    let personal_contact_info = {studentId: userId, countryCode, mobile};
    let exist = await UserService().getStudentContactDetails({studentId: userId}, transaction);
    if(!exist) {
      let result = await UserService().addStudentContactDetails(personal_contact_info, transaction);
    } else {
      let result = await UserService().updateStudentContactDetails({id: exist.id}, personal_contact_info, transaction);
    }
    user = await UserService().fetch(userId, transaction, "student_details");
    req.rData = {user};
    next();

  }

  const updateStudentBackCover = async (req, res, next, transaction) => {
    console.log("StudentController => updateStudentBackgroundCover");
    let {backgroundCoverColor, userId} = req.body;
    console.log("req data", req.body);
    let update_data = {backgroundCoverColor}
    let exist = await UserService().getStudentContactDetails({studentId: userId}, transaction);
    if(!exist) {
      let result = await UserService().addStudentContactDetails({backgroundCoverColor, studentId}, transaction);
    } else {
      let result = await UserService().updateStudentContactDetails({id: exist.id}, update_data, transaction);
    }

    req.rData = {};
    next();
  }

  const addStudentDegree = async (req, res, next, transaction) => {
    console.log("StudentController => addStudentDegree");
    let {degree_data, userId} = req.body;
    try {
      if(degree_data) degree_data = JSON.parse(degree_data.replace(/\\/g, ""));
    } catch(e) {

    }
    if(req.authUser.profile_stag == "1") update_result = await UserService().updateProfile(userId, {profile_stag: "2"}, transaction);
    let degree_ids = [];
    if(degree_data.length > 0) degree_ids = await saveStudentDegree(degree_data, userId, transaction);
    if(degree_ids.length > 0) delete_result = await UserService().deleteStudentDegree({student_id: userId, id: {[Op.notIn]: degree_ids}}, transaction);
    user = await UserService().fetch(userId, transaction, "student_details");
    let percenage_result = await calculateCompleteProfilePercentage(userId, transaction);
    req.rData = {user};
    next();
  }


  const saveStudentDegree = async (data, userId, transaction) => {
    let ids = [];
    for(const item of data) {
      let {college_name, degree, field_of_study, start_year, end_year, college_country, college_state, college_city} = item;
      let degree_info = {student_id: userId, college_name, degree, field_of_study, start_year, end_year, college_country, college_state, college_city};
      let exist = await UserService().fetchStudentDegree(degree_info, transaction);
      if(!exist) {
        let result = await UserService().addStudentDegree(degree_info, transaction);
        ids.push(result.id)
      } else {
        ids.push(exist.id)
      }

    }
    return ids;

  }

  const addStudentCareerInfo = async (req, res, next, transaction) => {
    console.log("StudentController => addStudentCareerInfo");
    let {career_data, userId} = req.body;
    try {
      if(career_data) career_data = JSON.parse(career_data.replace(/\\/g, ""));
    } catch(e) {}
    let career_ids = [];
    if(req.authUser.profile_stag == "3") update_result = await UserService().updateProfile(userId, {profile_stag: "4"}, transaction);
    if(career_data.length > 0) career_ids = await saveStudentCareerInfo(career_data, userId, transaction);
    if(career_ids.length > 0) delete_result = await UserService().deleteStudentCareerInfo({student_id: userId, id: {[Op.notIn]: career_ids}}, transaction);
    let percenage_result = await calculateCompleteProfilePercentage(userId, transaction);
    user = await UserService().fetch(userId, transaction, "student_details");
    req.rData = {user};
    next();
  }

  const removeCareerPathAdded = async (req, res, next, transaction) => {
    console.log("StudentController => removeCareerPathAdded");
    let {career_id, userId} = req.body;
    console.log("req remove", req.body);
    delete_result = await UserService().deleteStudentCareerInfo({student_id: userId, career_id: career_id}, transaction);
    user = await UserService().fetch(userId, transaction, "student_details");
    req.rData = {user};
    next();
  }

  const getAllAddedStudentCareerInfo = async (req, res, next, transaction) => {
    let {userId} = req.body;
    console.log("userId", userId);
    let career_info = {student_id: userId};
    let student = await UserService().fetchAllStudentCareerInfo(career_info, transaction, "defaultScope");
    console.log("exist");
    // user = await UserService().fetch(userId, transaction, "student_details");
    req.rData = {student};
    next();
  }
  const getAllStudentCareerInfo = async (req, res, next, transaction) => {
    let {career_id, userId} = req.body;
    let career_info = {student_id: userId, career_id};
    let student = await UserService().fetchStudentCareerInfo(career_info, transaction, "defaultScope");
    console.log("exist");
    // user = await UserService().fetch(userId, transaction, "student_details");
    req.rData = {student};
    next();
  }

  const saveStudentCareerInfo = async (data, userId, transaction) => {
    let ids = [];
    for(const item of data) {
      let {career_id, specializations} = item;
      console.log("specializations");
      console.log(specializations);
      let career_info = {student_id: userId, career_id};
      let exist = await UserService().fetchStudentCareerInfo(career_info, transaction, "list");
      console.log("exist");
      console.log(exist);
      let student_career_info_id = null;
      if(!exist) {
        let add_result = await UserService().addStudentCareerInfo(career_info, transaction);
        console.log("add_result");
        console.log(add_result);
        ids.push(add_result.id);
        student_career_info_id = add_result.id;
      } else {
        ids.push(exist.id);
        student_career_info_id = exist.id;
      }
      let specialization_ids = [];
      if(specializations.length > 0) specialization_ids = await saveStudentSpecialization(specializations, student_career_info_id, transaction);
      if(specialization_ids.length > 0) delete_result = await UserService().deleteStudentSpecialization({student_career_info_id, id: {[Op.notIn]: specialization_ids}}, transaction);

    }
    return ids;

  }

  const saveStudentSpecialization = async (specializations, student_career_info_id, transaction) => {
    console.log("controler=>saveStudentSpecialization");
    console.log(student_career_info_id);
    let ids = [];
    for(const specialization_id of specializations) {

      let specialization_info = {student_career_info_id, specialization_id};
      let exist = await UserService().fetchStudentSpecialization(specialization_info, transaction);
      if(!exist) {
        let result = await UserService().addStudentSpecialization(specialization_info, transaction);
        ids.push(result.id)
      } else {
        ids.push(exist.id)
        // let result = await UserService().updateStudentSpecialization(specialization_info, student_career_info_id, transaction);
      }
    }
    return ids;

  }

  const addStudentCareerPath = async (req, res, next, transaction) => {
    console.log("StudentController => addStudentCareerPath");
    let {career_path_name, userId} = req.body;
    let add_career_result = await AdminService().addCareer({title: career_path_name}, transaction);

    let add_result = await UserService().addStudentCareerInfo({student_id: userId, career_id: add_career_result.id}, transaction);

    user = await UserService().fetch(userId, transaction, "student_details");
    req.rData = {user};
    next();
  }

  const addStudentSkill = async (req, res, next, transaction) => {
    console.log("StudentController => addStudentSkill");
    let {skill_data, userId} = req.body;
    try {
      if(skill_data) skill_data = JSON.parse(skill_data.replace(/\\/g, ""));
    } catch(e) {

    }
    let skill_ids = [];
    if(req.authUser.profile_stag == "4") update_result = await UserService().updateProfile(userId, {profile_stag: "5", isProfileComplete: true}, transaction);
    if(skill_data.length > 0) skill_ids = await saveStudentSkill(skill_data, userId, transaction);
    if(skill_ids.length > 0) delete_result = await UserService().deleteStudentSkill({student_id: userId, id: {[Op.notIn]: skill_ids}}, transaction);
    let percenage_result = await calculateCompleteProfilePercentage(userId, transaction);
    user = await UserService().fetch(userId, transaction, "student_details");
    req.rData = {user};
    next();
  }


  const saveStudentSkill = async (data, userId, transaction) => {
    let ids = [];
    for(const item of data) {
      let {skill_id, skill_name, level, skill_type, career_id} = item;
      if(skill_name) {
        let add_skill_result = await UserService().addSkill({title: skill_name, career_id}, transaction);
        skill_id = add_skill_result.id;
      }
      let skill_info = {student_id: userId, skill_id, level, skill_type};
      let exist = await UserService().fetchStudentSkill(skill_info, transaction);
      if(!exist) {
        let add_result = await UserService().addStudentSkill(skill_info, transaction);
        ids.push(add_result.id);
      } else {
        ids.push(exist.id);
      }

    }

    return ids;

  }

  const addSkill = async (req, res, next, transaction) => {
    console.log("StudentController => addSkill");
    let {userId, skill_id, level, skill_type} = req.body;
    let skill_info = {student_id: userId, skill_id, level, skill_type};

    let add_result = await UserService().addStudentSkill(skill_info, transaction);
    next();
  }

  const calculateCompleteProfilePercentage = async (userId, transaction) => {
    return new Promise(async function (resolve, reject) {
      let student_details = await UserService().fetchByQuery({id: userId}, transaction, "student_details");
      let {first_name, mobile, gender, email, image, country, state, city, student_degree_details, student_career_details, student_skill_details} = student_details;
      let personal_details = {first_name, mobile, gender, email, image, country, state, city};

      let personal_non_empty = await countNonEmptyColumn(personal_details);
      let other_non_empty_field = (student_degree_details && student_degree_details.length > 0) ? Number(1) : Number(0);
      other_non_empty_field += (student_career_details && student_career_details.length > 0) ? Number(1) : Number(0);
      other_non_empty_field += (student_skill_details && student_skill_details.length > 0) ? Number(1) : Number(0);

      let total_non_empty_field = Number(personal_non_empty) + Number(other_non_empty_field);

      let new_percentage = await parseFloat(total_non_empty_field * each_column_value).toFixed(2);

      new_percentage = new_percentage > 99 ? 100 : new_percentage;
      let update_data = {profile_complete_percentage: new_percentage};
      let update_result = await UserService().updateProfile(userId, update_data, transaction);
      if(update_result) resolve(true);
    })
  }

  function countNonEmptyColumn(myObj) {
    return new Promise(async function (resolve, reject) {
      let total_non_empty_item = 0;
      let total = 0;
      if(myObj) {
        for(const x in myObj) {
          if(valid_fields.indexOf(x) != "-1") {
            if(myObj[x] != null && myObj[x] != "") total_non_empty_item = total_non_empty_item + 1;
            total++;
          }
        }
      }
      resolve(total_non_empty_item);
    })
  }

  const getSkillDetails = async (req, res, next, transaction) => {
    console.log("StudentController => getSkillDetails");
    let {userId} = req.body;
    let {skill_id} = req.query;
    let skill_info = {student_id: userId, skill_id};

    let skill_details = await UserService().fetchStudentSkill(skill_info, transaction);
    req.rData = {skill_details};
    next();
  }

  const addCertificate = async (req, res, next, transaction) => {
    console.log("StudentController => addCertificate");
    let {name, organization, expiry_date, can_expire, issue_date, credential_url, credential_id, tagged_skills, userId, certificateId} = req.body;
    try {
      if(tagged_skills) tagged_skills = JSON.parse(tagged_skills.replace(/\\/g, ""));
    } catch(e) {

    }
    let certificate_data = {name, organization, can_expire, expiry_date, issue_date, credential_url, credential_id, userId};
    if(certificateId) {
      let update_result = await UserService().updateCertificate({id: certificateId}, certificate_data, transaction);

    } else {
      let add_result = await UserService().addCertificate(certificate_data, transaction);
      certificateId = add_result.id;
    }
    let skill_ids = [];
    if(tagged_skills && tagged_skills.length > 0) skill_ids = await saveTaggedSkill(tagged_skills, certificateId, transaction);
    if(skill_ids.length > 0) delete_result = await UserService().deleteCertificateTaggedSkill({certificateId, id: {[Op.notIn]: skill_ids}}, transaction);
    let certificate = await UserService().fetchCertificateByQuery({id: certificateId}, transaction);
    req.rData = certificate;
    next();
  }


  const saveTaggedSkill = async (data, certificateId, transaction) => {
    let ids = [];
    for(const skill_id of data) {

      let tag_data = {certificateId, skill_id};

      let exist = await UserService().fetchCertificateTaggedSkillByQuery(tag_data, transaction);
      if(!exist) {
        let result = await UserService().saveCertificateTaggedSkill(tag_data, transaction);
        ids.push(result.id)
      } else {
        ids.push(exist.id)
      }
    }

    return ids;

  }

  const certificateList = async (req, res, next, transaction) => {
    console.log("StudentController => certificateList");
    let {userId} = req.body;
    let {search, page, limit, status} = req.query;
    let filters = {search, page, limit, status, userId};
    let question_list = await UserService().certificateList(filters, transaction);
    let count_query = {userId};
    let total_question = await UserService().countCertificate(count_query, transaction);
    req.rData = {total_question, question_list};
    next();
  }

  const getCertificateDetails = async (req, res, next, transaction) => {
    console.log("StudentController => getCertificateDetails");
    let {userId} = req.body;
    let {certificateId} = req.params;
    let certificate = await UserService().fetchCertificateByQuery({id: certificateId, userId}, transaction);
    req.rData = {certificate};
    next();
  }


  const deleteCertificate = async (req, res, next, transaction) => {
    console.log("UserController => deleteCertificate");
    let {certificateId, userId} = req.body;
    let result = await UserService().deleteCertificate({id: certificateId, userId}, transaction);

    next();
  }

  const studentList = async (req, res, next, transaction) => {
    console.log("StudentController=>studentList");
    let {search, page, limit, status} = req.query;

    let filters = {search, page, limit, status, user_type: "student"};
    let user = await UserService().userList(filters, transaction);
    if(user.length > 0) result = await saveProfilePercentage(user, transaction);
    req.rData = {user};
    next();

  }

  const saveProfilePercentage = async (data, transaction) => {
    for(const item of data) {
      let {id} = item;
      let percenage_result = await calculateCompleteProfilePercentage(id, transaction);

    }
    return true;

  }

  const addStudentBasicInfo = async (req, res, next, transaction) => {
    console.log("StudentController => addStudentBasicInfo");
    let {first_name, last_name, gender, country, state, city, state_isocode, city_isocode, image, about, email, password, userId} = req.body;
    if(password) password = await helpers().hashPassword(password);
    let user_data = {first_name, last_name, gender, country, state, city, state_isocode, city_isocode, image, about, email, password, user_type: "student"};
    if(userId) {
      let update_result = await UserService().updateProfile(userId, user_data, transaction);

    } else {
      user_data.profile_stag = "1";
      let add_result = await UserService().add(user_data, transaction);
      userId = add_result.id;
    }
    let percenage_result = await calculateCompleteProfilePercentage(userId, transaction);
    let user = await UserService().fetch(userId, transaction, "student_details");
    req.rData = {user};
    next();

  }

  const addStudentWorkExperience = async (req, res, next, transaction) => {
    console.log("StudentController => addStudentWorkExperience");
    let {experience_data, userId} = req.body;
    try {
      if(experience_data) experience_data = JSON.parse(experience_data.replace(/\\/g, ""));
    } catch(e) {

    }
    if(req.authUser.profile_stag == "2") update_result = await UserService().updateProfile(userId, {profile_stag: "3"}, transaction);
    let experience_ids = [];
    if(experience_data.length > 0) experience_ids = await saveStudentWorkExperience(experience_data, userId, transaction);
    if(experience_ids.length > 0) delete_result = await UserService().deleteStudentWorkExperience({student_id: userId, id: {[Op.notIn]: experience_ids}}, transaction);

    req.rData = {};
    next();
  }


  const saveStudentWorkExperience = async (data, userId, transaction) => {
    let ids = [];
    for(const item of data) {

      let {title, employment_type, company_name, start_date, end_date, isCurrentlyWorking, industry, description, profile_headline, country, state, city, media} = item;
      let experience_info = {student_id: userId, title, employment_type, company_name, start_date, end_date, isCurrentlyWorking, industry, description, profile_headline, country, state, city};
      let exist = await UserService().fetchStudentWorkExperience(experience_info, transaction);
      let work_experience_id = null;
      if(!exist) {
        let result = await UserService().addStudentWorkExperience(experience_info, transaction);
        ids.push(result.id);
        work_experience_id = result.id;
      } else {
        ids.push(exist.id);
        work_experience_id = exist.id;
      }
      let media_ids = [];
      if(media.length > 0) media_ids = await saveWorkExperienceMedia(media, work_experience_id, transaction);
      if(media_ids.length > 0) delete_result = await UserService().deleteWorkExperienceMedia({work_experience_id, id: {[Op.notIn]: media_ids}}, transaction);

    }
    return ids;

  }


  const saveWorkExperienceMedia = async (data, work_experience_id, transaction) => {
    let ids = [];
    for(const media of data) {
      let media_info = {work_experience_id, media};
      let exist = await UserService().fetchWorkExperienceMedia(media_info, transaction);
      if(!exist) {
        let result = await UserService().addWorkExperienceMedia(media_info, transaction);
        ids.push(result.id);
      } else {
        ids.push(exist.id);
      }

    }
    return ids;

  }



  const addRating = async (req, res, next, transaction) => {
    console.log("VendorController => addRating");
    let {rating, review, user_id, userId, title} = req.body;
    let rating_data = {rating, studentId: userId, userId: user_id, review, title};
    rating = Number(rating);
    let exist = await UserService().getRating({studentId: userId, userId: user_id}, transaction);
    let mentor_details = await UserService().fetchByQuery({id: user_id}, transaction);
    let old_rating = Number(mentor_details.rating || 0);
    let total_rating = Number(mentor_details.total_rating || 0);
    console.log("old_rating => ", old_rating);
    console.log("total_rating => ", total_rating);
    if(exist) {
      let update_result = await UserService().updateRating({id: exist.id}, rating_data, transaction);
      let absolute_rating = Number(rating - Number(exist.rating))
      console.log("absolute_rating => ", absolute_rating);
      let new_rating = ((old_rating * total_rating) + absolute_rating) / (total_rating)
      console.log("{rating:new_rating} => ", {rating: new_rating});
      let update_result2 = await UserService().updateProfile(user_id, {rating: new_rating}, transaction);
    } else {
      let add_result = await UserService().addRating(rating_data, transaction);

      let new_rating = ((old_rating * total_rating) + rating) / (total_rating + 1)
      console.log("{rating:new_rating,total_rating:total_rating+1} => ", {rating: new_rating, total_rating: total_rating + 1});
      let update_result = await UserService().updateProfile(user_id, {rating: new_rating, total_rating: total_rating + 1}, transaction);
    }

    rating_data = await UserService().getRating({studentId: userId, userId: user_id}, transaction);
    req.rData = {rating_data};
    next();
  }
  return {
    addBasicInfo,
    addStudentDegree,
    addStudentCareerInfo,
    addStudentCareerPath,
    addStudentSkill,
    addSkill,
    getSkillDetails,
    addCertificate,
    certificateList,
    getCertificateDetails,
    deleteCertificate,
    studentList,
    addStudentBasicInfo,
    addStudentWorkExperience,
    addRating,
    getAllStudentCareerInfo,
    getAllAddedStudentCareerInfo,
    removeCareerPathAdded,
    updateStudentBackCover
  }
}
