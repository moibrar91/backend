const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const UserService = require("../services/UserService");
const SettingService = require("../services/SettingService");
const RequestService = require("../services/RequestService");
const QuestionService = require("../services/QuestionService");
const OtpController = require("./OtpController");
const helpers = require("../util/helpers");
const colors = require("colors");
let Country = require("country-state-city").Country;
let State = require("country-state-city").State;
let City = require("country-state-city").City;
const serverConfig = require("../../config/server");
const urlMetadata = require("url-metadata");
var validUrl = require("valid-url");

module.exports = () => {
  const counseller_column_value = parseFloat(100 / 11).toFixed(2);
  const counseller_valid_fields = [
    "first_name",
    "gender",
    "email",
    "image",
    "mobile",
    "designation",
    "company_name",
    "about",
    "country",
    "state",
    "city",
  ];

  const recruiter_column_value = parseFloat(100 / 12).toFixed(2);
  const recruiter_valid_fields = [
    "first_name",
    "gender",
    "email",
    "image",
    "mobile",
    "brand_name",
    "designation",
    "company_name",
    "about",
    "country",
    "state",
    "city",
  ];

  const login = async (req, res, next, transaction) => {
    console.log("UserController => login");
    let { email, password, user_type, user_signin_type } = req.body;
    console.log("password", password);

    // if(parseInt(user_signin_type)){
    //   console.log(parseInt(user_signin_type) );
    // }
      email = email.toLowerCase();
      let query = {
        [Op.or]: [
          {
            email: Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col("email")),
              email
            ),
          },
          {
            username: Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col("username")),
              email
            ),
          },
        ],
      };
      let user = await UserService().fetchByQuery(query, null, "basic");
      if (user) {
        if (user.isActive == true) {
          let passwordVerify = await UserService().verifyPassword(
            user.id,
            password
          );
          let userId = user.id;
          user_type = user.user_type;
          
          passwordVerify = parseInt(user_signin_type) ? true : passwordVerify
          console.log(passwordVerify, 'passsssssssssssssss');
          if (!passwordVerify) {
            console.log("hello password", passwordVerify);
            req.rCode = 0;
            req.msg = "incorrect_password";
          }
          else {
            console.log("pppppp", passwordVerify);
            if (user_type != "student" && !user.isEmailVerified) {
              let otp = helpers().generateOTP();
              let sent_mail = await sendEmail(email, otp, transaction);
              let otp_query = { email };
              let otp_data = { email, otp };
              let save_otp_result = await saveOtpAndToken(
                otp_query,
                otp_data,
                transaction
              );
              req.rCode = 0;
              req.msg = "email_not_verified";
              // req.rData = { userId, otp, user_type };
              req.rData = { userId, user_type, email };
            } else {
              if (
                user_type != "student" &&
                user.profile_stag == "1" &&
                !user.isMobileVerified
              ) {
                let additional_info = null;
                if (user_type == "counseller" || user_type == "mentor")
                  additional_info = await UserService().fetchCounsellerDetails(
                    { user_id: userId },
                    transaction
                  );
                else if (user_type == "recruiter")
                  additional_info = await UserService().fetchRecruiterDetails(
                    { recruiter_id: userId },
                    transaction
                  );
                let countryCode = additional_info.countryCode;
                let mobile = additional_info.mobile;
                let otp = helpers().generateOTP();
                let otp_result = await sendOTPOnMobile(
                  countryCode,
                  mobile,
                  otp,
                  user.first_name,
                  transaction
                );
                let otp_query = { countryCode, mobile };
                let otp_data = { countryCode, mobile, otp };
                let save_otp_result = await saveOtpAndToken(
                  otp_query,
                  otp_data,
                  transaction
                );
                req.rCode = 0;
                req.msg = "mobile_not_verified";
                // req.rData = { userId, otp, user_type };
                req.rData = { userId, email, user_type };
              } else {
                if (user.isProfileComplete) {
                  if (user_type != "student") {
                    let otp = helpers().generateOTP();
                    let sent_mail = await sendEmail(email, otp, transaction);
                    let otp_query = { email };
                    let otp_data = { email, otp };
                    let save_otp_result = await saveOtpAndToken(
                      otp_query,
                      otp_data,
                      transaction
                    );
                    req.msg = "otp_sent_email";
                    // req.rData = { userId, otp, user_type };
                    req.rData = { userId, email, user_type };
                  } else {
                    let token = helpers().createJWT({
                      userId: user.id,
                      user_type,
                      verified: true,
                    });
                    let otp_query = { email };
                    let otp_data = { email, token };
                    let save_otp_result = await saveOtpAndToken(
                      otp_query,
                      otp_data,
                      transaction
                    );
                    req.rData = { user, token };
                  }
                } else {
                  req.msg = "profile_not_complete";
                  let token = helpers().createJWT({
                    userId: user.id,
                    user_type,
                    verified: true,
                  });
                  let otp_query = { email };
                  let otp_data = { email, token };
                  let save_otp_result = await saveOtpAndToken(
                    otp_query,
                    otp_data,
                    transaction
                  );
                  req.rData = { user, token };
                  req.rCode = 0;
                }
              }
            }
          }
        } else {
          req.rCode = 0;
          req.msg = "ac_deactivated";
        }
      } else {
        req.rCode = 0;
        req.msg = "wrong_email";
      }

    next();
  };

  const saveOtpAndToken = async (query, data, transaction) => {
    let exist = await UserService().getOTPAndToken(query, transaction);
    if (exist) {
      let update_result = await UserService().updateOTPAndToken(
        { id: exist.id },
        data,
        transaction
      );
    } else {
      let add_result = await UserService().addOTPAndToken(data, transaction);
    }
    return true;
  };

  const checkEmailExist = async (req, res, next, transaction) => {
    let { email, username } = req.body;
    email = email.toLowerCase();
    // let usernameExist = await UserService().fetchByQuery(username_query);
    console.log("uuu", req.body);
    // let query = { [Op.or]: [{ email: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), email) }, { username: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), email) }] };
    let emailExist = await UserService().fetchByQuery(
      { email },
      null,
      "defaultScope"
    );
    let usernameExist = await UserService().fetchByQuery(
      { username },
      null,
      "defaultScope"
    );
    if (emailExist) {
      req.rCode = 0;
      req.msg = "email_exist";
    } else if (usernameExist) {
      req.rCode = 0;
      req.msg = "username_exist";
      ResponseMiddleware(req, res, next);
    }
    next();
  };

  const signup = async (req, res, next, transaction) => {
    console.log("sssssign");
    let { email, password, username, user_type } = req.body;

    let user_data = { email, username, user_type };
    if (password) user_data.password = await helpers().hashPassword(password);
    let add_result = await UserService().add(user_data, transaction);
    let userId = add_result.id;

    if (userId) {
      let otp = helpers().generateOTP();
      // let token = await helpers().createJWT({ userId,user_type,verified:false });
      req.msg = "otp_sent_email";
      let sent_mail = await sendEmail(email, otp, transaction);
      // req.rData = { userId, otp, user_type };
      req.rData = { userId, user_type, email, username };
      // res.send({ code: 1, message: 'OTP sent to the given email', data:{ userId, user_type, email, username } })
    }

    next();
  };

  const completeSignup = async (req, res, next, transaction) => {
    console.log("sssssign", req.body);
    let {
      email,
      password,
      username,
      user_type,
      first_name,
      image,
      last_name,
      career_data,
      service_data,
      career_personas,
      career_collaboration,
    } = req.body;
    // username = email.substring(0,email.indexOf("@"));
    let user = await UserService().getUserEmail({ email }, transaction);

    // console.log("user",JSON.parse(career_data.replace(/\\/g, "")));
    if (user) {
      res.send({ code: 0, message: "email is already taken!", data: {} });
    } else {
      let user_data = {
        email,
        username,
        user_type,
        first_name,
        last_name,
        image,
        about: "",
      };
      if (password) user_data.password = await helpers().hashPassword(password);
      let add_result = await UserService().add(user_data, transaction);
      let userId = add_result.id;
      let token = helpers().createJWT({
        userId: userId,
        user_type,
        verified: true,
      });
      let otp_query = { email };
      let otp_data = { email, token };
      let save_otp_result = await saveOtpAndToken(
        otp_query,
        otp_data,
        transaction
      );
      if (career_data.length > 0) career_data = JSON.parse(career_data);
      if (service_data.length > 0)
        service_data = JSON.parse(service_data.replace(/\\/g, ""));
      if (career_personas.length > 0)
        career_personas = JSON.parse(career_personas);
      if (career_collaboration.length > 0)
        career_collaboration = JSON.parse(career_collaboration);
      if (add_result && user_type == "student" && career_data.length > 0) {
        let career_ids = [];
        console.log(career_data);
        if (career_data.length > 0)
          career_ids = await saveStudentCareerInfo(
            career_data,
            userId,
            transaction
          );
        if (career_ids.length > 0)
          delete_result = await UserService().deleteStudentCareerInfo(
            { student_id: userId, id: { [Op.notIn]: career_ids } },
            transaction
          );
      } else if (add_result && user_type != "student") {
        let career_ids = [];
        if (career_data && career_data.length > 0)
          career_ids = await saveUserCareerInfo(
            career_data,
            userId,
            transaction
          );
        if (career_ids.length > 0)
          delete_result = await UserService().deleteUserCareerInfo(
            { userId, id: { [Op.notIn]: career_ids } },
            transaction
          );
        let service_ids = [];
        if (service_data && service_data.length > 0)
          service_ids = await saveUserServiceInfo(
            service_data,
            userId,
            transaction
          );
        if (service_ids.length > 0)
          delete_result = await UserService().deleteUserServiceInfo(
            { userId, id: { [Op.notIn]: service_ids } },
            transaction
          );
      }

      let personas_ids = [];
      if (career_personas && career_personas.length > 0)
        personas_ids = await saveUserPersonasInfo(
          career_personas,
          userId,
          transaction
        );
      if (personas_ids.length > 0)
        delete_result = await UserService().deleteUserPersonasInfo(
          { userId, id: { [Op.notIn]: personas_ids } },
          transaction
        );
      let collaboration_ids = [];
      if (career_collaboration && career_collaboration.length > 0)
        collaboration_ids = await saveUserCollaborationInfo(
          career_collaboration,
          userId,
          transaction
        );
      if (collaboration_ids.length > 0)
        delete_result = await UserService().deleteUserCollaborationInfo(
          { userId, id: { [Op.notIn]: collaboration_ids } },
          transaction
        );

      let update_result = await UserService().updateProfile(
        userId,
        {
          profile_stag: "5",
          profile_complete_percentage: 60,
          isProfileComplete: 1,
        },
        transaction
      );
      req.rData = { user: add_result, token };
      next();
    }
  };

  const addSocialMediaLinks = async (req, res, next, transaction) => {
    console.log("userController => addSocialMediaLinks");
    let { title, image, url } = req.body;
    let data = { title, image, url };
    let add_result = await UserService().addSocialMediaLinks(data, transaction);

    req.rData = { social_links: add_result };
    next();
  };

  const getAllSocialMediaLinks = async (req, res, next, transaction) => {
    console.log("userController => getAllSocialMediaLinks");
    let fetch_links = await UserService().fetchAllSocialMediaLinks();
    req.rData = { social_links: fetch_links };
    next();
  };

  const addUserPersonaInfo = async (req, res, next, transaction) => {
    let { userId, career_personas } = req.body;
    console.log("career_personas", career_personas);
    if (career_personas.length > 0)
      career_personas = JSON.parse(career_personas);
    let personas_ids = [];
    if (career_personas && career_personas.length > 0)
      personas_ids = await saveUserPersonasInfo(
        career_personas,
        userId,
        transaction
      );
    if (personas_ids.length > 0)
      delete_result = await UserService().deleteUserPersonasInfo(
        { userId, id: { [Op.notIn]: personas_ids } },
        transaction
      );

    req.rData = {};
    next();
  };

  //ADD USER COLLOBORATION INFO
  const addUserCollaborationInfo = async (req, res, next, transaction) => {
    let { userId, career_collaboration } = req.body;
    console.log("colloba", req.body);
    if (career_collaboration.length > 0)
      career_collaboration = JSON.parse(career_collaboration);
    let collaboration_ids = [];
    if (career_collaboration && career_collaboration.length > 0)
      collaboration_ids = await saveUserCollaborationInfo(
        career_collaboration,
        userId,
        transaction
      );
    if (collaboration_ids.length > 0)
      delete_result = await UserService().deleteUserCollaborationInfo(
        { userId, id: { [Op.notIn]: collaboration_ids } },
        transaction
      );

    req.rData = {};
    next();
  };

  const addUserProjectInfo = async (req, res, next, transaction) => {
    let { userId, projectId, title, description } = req.body;
    let query = { userId, id: projectId };
    title = "What is the coolest side project you have worked on ?";
    let exist = await UserService().fetchUserProjectInfo(
      { userId },
      transaction
    );
    if (exist) {
      let update_data = { userId, title, description };
      let update_result = await UserService().updateUserProjectInfo(
        { id: exist.id },
        update_data,
        transaction
      );
    } else {
      let data = { userId, title, description };
      let add_result = await UserService().addUserProjectInfo(
        data,
        transaction
      );
    }

    req.rData = {};
    next();
  };
  const addUserSocialMedia = async (req, res, next, transaction) => {
    let { userId, user_social_link } = req.body;
    console.log("user_social_link", user_social_link);
    if (user_social_link.length > 0)
      user_social_link = JSON.parse(user_social_link);
    let social_ids = [];
    if (user_social_link && user_social_link.length > 0)
      social_ids = await saveUserSocialMedia(
        user_social_link,
        userId,
        transaction
      );
    if (social_ids.length > 0)
      delete_result = await UserService().deleteUserSocialMedia(
        { userId, id: { [Op.notIn]: social_ids } },
        transaction
      );

    req.rData = {};
    next();
  };

  const saveUserSocialMedia = async (data, userId, transaction) => {
    let ids = [];
    for (const item of data) {
      let { title, url, image } = item;
      let social_info = { userId, title, url, image };
      // let add_result = await UserService().addUserSocialMedia(social_info, transaction);
      console.log("social  ", item);
      let exist = await UserService().fetchUserSocialMedia(
        { userId, title },
        transaction
      );
      let user_social_id = null;
      if (!exist) {
        console.log("ddd");
        let add_result = await UserService().addUserSocialMedia(
          social_info,
          transaction
        );
        ids.push(add_result.id);
        user_social_id = add_result.id;
      } else {
        console.log("else");
        ids.push(exist.id);
        user_social_id = exist.id;
      }
    }
    return ids;
  };

  const deleteUserSocialMedia = async (req, res, next, transaction) => {
    let delete_result = await UserService().deleteUserSocialMedia(
      { id: 2 },
      transaction
    );
    req.rData = delete_result;
    next();
  };

  const saveUserCollaborationInfo = async (data, userId, transaction) => {
    let ids = [];
    for (const item of data) {
      let { career_id, id } = item;
      let career_info = { userId, career_id, collaborationId: id };
      let exist = await UserService().fetchUserCollaborationInfo(
        career_info,
        transaction
      );
      let user_career_id = null;
      if (!exist) {
        let add_result = await UserService().addUserCollaborationInfo(
          career_info,
          transaction
        );
        ids.push(add_result.id);
        user_career_id = add_result.id;
      } else {
        ids.push(exist.id);
        user_career_id = exist.id;
      }
    }
    return ids;
  };

  const saveUserPersonasInfo = async (data, userId, transaction) => {
    let ids = [];
    for (const item of data) {
      let { career_id, id } = item;
      let career_info = { userId, career_id, personasId: id };
      console.log("carreer_info ", career_info);
      let exist = await UserService().fetchUserPersonasInfo(
        career_info,
        transaction
      );
      let user_career_id = null;
      if (!exist) {
        let add_result = await UserService().addUserPersonasInfo(
          career_info,
          transaction
        );
        ids.push(add_result.id);
        user_career_id = add_result.id;
      } else {
        ids.push(exist.id);
        user_career_id = exist.id;
      }
    }
    return ids;
  };

  const saveStudentCareerInfo = async (data, userId, transaction) => {
    let ids = [];
    for (const item of data) {
      // console.log("career_id", item);
      let { id } = item;
      let career_info = { student_id: userId, career_id: id };
      let exist = await UserService().fetchStudentCareerInfo(
        career_info,
        transaction,
        "list"
      );
      if (!exist) {
        let add_result = await UserService().addStudentCareerInfo(
          career_info,
          transaction
        );
        // console.log("add_result");
        // console.log(add_result);
        ids.push(add_result.id);
      } else {
        ids.push(exist.id);
      }
    }
    return ids;
  };

  const sendEmail = async (email, otp, transaction) => {
    let exist = await UserService().getOTPAndToken({ email }, transaction);
    if (exist) {
      let update_result = await UserService().updateOTPAndToken(
        { id: exist.id },
        { otp },
        transaction
      );
    } else {
      let add_result = await UserService().addOTPAndToken(
        { email, otp },
        transaction
      );
    }
    let html =
      "Verification Code for your Xaphal is :" +
      otp +
      ".This code is only for Your identity verification purpose.";
    let result = await helpers().sendEmail(email, "Verification code", html);
    return true;
  };

  const resetPassword = async (req, res, next, transaction) => {
    console.log("AuthController => resetPassword");
    let { password, userId } = req.body;
    let user = {};
    user.password = await helpers().hashPassword(password);

    user = await UserService().updateProfile(userId, user, transaction);

    req.msg = "password_changed";
    next();
  };

  const changePassword = async (req, res, next, transaction) => {
    console.log("UserController => changePassword");
    let { current_password, new_password, userId } = req.body;

    let passwordVerify = await UserService().verifyPassword(
      userId,
      current_password,
      transaction
    );

    if (!passwordVerify) {
      req.rCode = 0;
      req.msg = "incorrect_current_password";
    } else {
      let user = {};
      new_password = await helpers().hashPassword(new_password);
      user.password = new_password;
      user = await UserService().updateProfile(userId, user, transaction);
      req.msg = "password_changed";
    }
    next();
  };

  const getPrivacyAndPolicy = async (req, res, next, transaction) => {
    let data = await SettingService().getPrivacyAndPolicies({}, transaction);
    req.rData = data;
    req.msg = "privacy_policy";
    next();
  };

  const getTermAndCondition = async (req, res, next, transaction) => {
    let data = await SettingService().getTermAndCondition({}, transaction);
    req.rData = data;
    req.msg = "term_and_condition";
    next();
  };

  const getAboutUs = async (req, res, next, transaction) => {
    let about_us = await SettingService().getAbout({}, transaction);
    req.rData = about_us;
    req.msg = "about_us";
    next();
  };

  const getHelplineNumber = async (req, res, next, transaction) => {
    let data = await SettingService().getHelplineNumber({}, transaction);
    req.rData = data;
    req.msg = "helpline_mobile";
    next();
  };

  const logout = async (req, res, next, transaction) => {
    let { userId } = req.body;

    let user = { device_token: null };
    user = await UserService().updateProfile(userId, user);
    req.msg = "user_logout";
    next();
  };

  const userList = async (req, res, next, transaction) => {
    console.log("UserController=>userList");
    console.log("req.body");
    // console.log(req.body);
    let {
      search,
      page,
      limit,
      type,
      service_id,
      order_by,
      status,
      career,
      userId,
    } = req.body;
    // console.log("type", type);
    try {
      if (order_by) order_by = JSON.parse(order_by.replace(/\\/g, ""));
      if (career) career = JSON.parse(career.replace(/\\/g, ""));
    } catch (e) {}
    let order = [["id", "DESC"]];
    if (order_by && order_by.length > 0) {
      if (order_by[0] == "price")
        order = [["service_list", "fee", order_by[1]]];
      else if (order_by[0] == "activity")
        order = [["commented_count", order_by[1]]];
      else if (order_by[0] == "rating") order = [["total_rating", order_by[1]]];
      else if (order_by[0] == "")
        order = [
          [Sequelize.fn("lower", Sequelize.col("first_name")), order_by[1]],
        ];
    }
    // console.log("order", order);
    let filters = {
      userId,
      search,
      page,
      limit,
      user_type: type,
      service_id,
      order_by: order,
      status,
      career,
    };
    let scope =
      type == "counseller" || type == "mentor"
        ? "counsellerListWithoutCareer"
        : type == "recruiter"
        ? "recruiterList"
        : type == "student"
        ? "student_details"
        : "defaultScope";
    let user_list = await UserService().userList(filters, transaction, scope);
    // let user_list = await UserService().userListTest(filters, transaction, scope);
    // console.log("rrrr", user_list);
    if ((type == "counseller" || type == "mentor") && !career) {
      // console.log("hello");
      if (userList.length > 0)
        user_list = await validateUserCareer(user_list, transaction);
    }
    req.rData = { page, limit, user_list };
    req.msg = "user_list";
    next();
  };

  const validateUserCareer = async (data, transaction) => {
    let userData = [];
    for (const item of data) {
      let {
        id,
        first_name,
        last_name,
        username,
        email,
        gender,
        image,
        about,
        isActive,
        country,
        state,
        city,
        state_isocode,
        city_isocode,
        rating,
        total_rating,
        user_other_details,
        service_list,
      } = item;
      // console.log("username", username);
      let career_query = { userId: id };
      let career_list = await UserService().fetchUserAllCareerInfo(
        career_query,
        transaction
      );
      //let commented_count = await QuestionService().countQuestionComment({userId:id}, transaction,"basic");
      //let update_user_result = await UserService().updateProfile(id, {commented_count}, transaction);

      userData.push({
        id,
        first_name,
        last_name,
        username,
        email,
        gender,
        image,
        about,
        isActive,
        country,
        state,
        city,
        state_isocode,
        city_isocode,
        rating,
        total_rating,
        user_other_details,
        service_list,
        career_list,
      });
    }
    return userData;
  };

  const getUserDetails = async (req, res, next, transaction) => {
    console.log("UserController=>getUserDetails");
    let { userId } = req.body;
    let order_by = [["id", "DESC"]];
    // userId = 70;
    let scope =
      req.authUser.user_type == "student"
        ? "student_details"
        : req.authUser.user_type == "counseller" ||
          req.authUser.user_type == "mentor"
        ? "withCounsellerDetails"
        : req.authUser.user_type == "recruiter"
        ? "withRecruiterDetails"
        : "defaultScope";
    // let scope = "student_details"
    let user = await UserService().fetchByQuery(
      { id: userId },
      transaction,
      scope,
      order_by
    );
    //let user = await UserService().fetchByQuery({id: userId}, transaction, "student_details", order_by);
    req.rData = { user };
    req.msg = "user_details";
    next();
  };

  const updateUserStatus = async (req, res, next, transaction) => {
    console.log("UserController=>updateUserStatus");
    let { userId, status } = req.body;
    let result = await UserService().updateProfile(
      userId,
      { isActive: status },
      transaction
    );
    req.rData = {};
    req.msg = "user_status_changed";
    next();
  };

  const removeUser = async (req, res, next, transaction) => {
    console.log("UserController=>removeUser");
    let { userId } = req.query;
    let result = await UserService().removeUser({ id: userId }, transaction);
    req.rData = {};
    req.msg = "user_removed";
    next();
  };

  const addStudentAmbassador = async (req, res, next, transaction) => {
    console.log("UserController => addStudentAmbassador");
    let {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      college,
      degree,
      why_our_programme,
      awareness_about_xaphal,
      associated_with_other,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
    } = req.body;
    let user = {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      college,
      degree,
      why_our_programme,
      awareness_about_xaphal,
      associated_with_other,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
    };

    let add_result = await UserService().addStudentAmbassador(
      user,
      transaction
    );
    let data = await UserService().fetchStudentAmmbassador(
      { id: add_result.id },
      transaction
    );
    let html =
      "Dear " +
      first_name +
      ",<br><br><br>Thank you for reaching out. You have successfully registered as student ambassador. Our team will get back to you shortly.<br><br>Regards,<br>Xaphal";

    let result = await helpers().sendEmail(email, "Welcome in xaphal", html);
    user = await formatForMail(user);
    let client_html =
      "Dear kshitij,<br><br><br>New enquiry for student Ambassador,<br><br>" +
      user +
      ".<br><br>Regards,<br>Xaphal";
    console.log("client_html => ", client_html);
    let result2 = await helpers().sendEmail(
      serverConfig.CLIENT_EMAIL,
      "New enquiry for student Ambassador",
      client_html
    );
    req.rData = data;
    next();
  };

  const formatForMail = async (data) => {
    let data_string = "";
    for (var key in data) {
      console.log(key);
      console.log(data[key]);
      data_string +=
        "<b>" + key.replace(/_/g, " ") + "</b> : " + data[key] + "<br>";
    }
    return data_string;
  };

  const addTeamRequest = async (req, res, next, transaction) => {
    console.log("UserController => addTeamRequest");
    let { first_name, last_name, email, mobile, countryCode, message, file } =
      req.body;
    let request = {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      message,
      file,
    };

    let add_result = await UserService().addTeamRequest(request, transaction);
    let data = await UserService().fetchTeamRequest(
      { id: add_result.id },
      transaction
    );
    let html =
      "Dear " +
      first_name +
      ",<br><br><br>Thank you for reaching out. You request saved  successfully. Our team will get back to you shortly.<br><br>Regards,<br>Xaphal";
    let result = await helpers().sendEmail(email, "Team request", html);
    request = await formatForMail(request);
    let client_html =
      "Dear kshitij,<br><br><br>New team request,<br><br>" +
      request +
      ".<br><br>Regards,<br>Xaphal";
    console.log("client_html => ", client_html);
    let result2 = await helpers().sendEmail(
      serverConfig.CLIENT_EMAIL,
      "New team request",
      client_html
    );
    req.rData = data;
    next();
  };

  const addCollegePartnership = async (req, res, next, transaction) => {
    console.log("UserController => addCollegePartnership");
    let {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      college_name,
      designation,
      message,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
    } = req.body;
    let user = {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      college_name,
      designation,
      message,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
    };

    let add_result = await UserService().addCollegePartnership(
      user,
      transaction
    );
    let data = await UserService().fetchCollegePartnership(
      { id: add_result.id },
      transaction
    );
    let html =
      "Dear " +
      first_name +
      ",<br><br><br>Thank you for reaching out. You have successfully registered as college partnership. Our team will get back to you shortly.<br><br>Regards,<br>Xaphal";
    let result = await helpers().sendEmail(email, "Welcome in xaphal", html);
    user = await formatForMail(user);
    let client_html =
      "Dear kshitij,<br><br><br>New request for college partnership,<br><br>" +
      user +
      ".<br><br>Regards,<br>Xaphal";
    console.log("client_html => ", client_html);
    let result2 = await helpers().sendEmail(
      serverConfig.CLIENT_EMAIL,
      "New request for college partnership",
      client_html
    );
    req.rData = data;
    next();
  };

  const addAdvertisement = async (req, res, next, transaction) => {
    console.log("UserController => addAdvertisement");
    let {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      company_name,
      brand_name,
      designation,
      message,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
    } = req.body;
    let user = {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      company_name,
      brand_name,
      designation,
      message,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
    };

    let add_result = await UserService().addAdvertisement(user, transaction);
    let data = await UserService().fetchAdvertisement(
      { id: add_result.id },
      transaction
    );
    let html =
      "Dear " +
      first_name +
      ",<br><br><br>Thank you for reaching out. You data saved successfully. Our team will get back to you shortly.<br><br>Regards,<br>Xaphal";
    let result = await helpers().sendEmail(email, "Welcome in xaphal", html);
    user = await formatForMail(user);
    let client_html =
      "Dear kshitij,<br><br><br>New request for advertisement,<br><br>" +
      user +
      ".<br><br>Regards,<br>Xaphal";
    console.log("client_html => ", client_html);
    let result2 = await helpers().sendEmail(
      serverConfig.CLIENT_EMAIL,
      "New request for advertisement",
      client_html
    );
    req.rData = data;
    next();
  };

  const addInvestorRelations = async (req, res, next, transaction) => {
    console.log("UserController => addInvestorRelations");
    let {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      company_name,
      designation,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      message,
    } = req.body;
    let user = {
      first_name,
      last_name,
      email,
      mobile,
      countryCode,
      company_name,
      designation,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      message,
    };

    let add_result = await UserService().addInvestorRelations(
      user,
      transaction
    );
    let data = await UserService().fetchInvestorRelations(
      { id: add_result.id },
      transaction
    );
    let html =
      "Dear " +
      first_name +
      ",<br><br><br>Thank you for reaching out. Our team will get back to you shortly.<br><br>Regards,<br>Xaphal";
    let result = await helpers().sendEmail(email, "Welcome in xaphal", html);
    user = await formatForMail(user);
    let client_html =
      "Dear kshitij,<br><br><br>New request for investor relations,<br><br>" +
      user +
      ".<br><br>Regards,<br>Xaphal";
    console.log("client_html => ", client_html);
    let result2 = await helpers().sendEmail(
      serverConfig.CLIENT_EMAIL,
      "New request for investor relations",
      client_html
    );
    req.rData = data;
    next();
  };

  const addEarlyJoin = async (req, res, next, transaction) => {
    console.log("UserController => addEarlyJoin");
    let { email, user_type } = req.body;
    let user = { email, user_type };

    let add_result = await UserService().addEarlyJoin(user, transaction);
    let data = await UserService().fetchEarlyJoin(
      { id: add_result.id },
      transaction
    );
    req.rData = data;
    next();
  };

  const getAllCountryList = async (req, res, next, transaction) => {
    console.log("UserController => getAllCountryList");
    let country_list = Country.getCountryByCode("IN");
    req.rData = { country_list };
    next();
  };

  const getAllStateList = async (req, res, next, transaction) => {
    console.log("UserController => getAllStateList");
    let { countryIsoCode } = req.query;
    let state_list = State.getStatesOfCountry(countryIsoCode);
    req.rData = { state_list };
    next();
  };

  const getAllCityList = async (req, res, next, transaction) => {
    console.log("UserController => getAllCityList");
    let { state_code } = req.query;

    let city_list = City.getCitiesOfState("IN", state_code);
    console.log();
    req.rData = { city_list };

    next();
  };

  const getAllSpecialityList = async (req, res, next, transaction) => {
    console.log("UserController => getAllSpecialityList");
    let { page, limit, status, career_id, search } = req.query;
    let filters = { page, limit, status, career_id, search };
    let total_query = career_id ? { career_id } : {};
    let total_active_query = career_id
      ? { career_id, isActive: 1 }
      : { isActive: 1 };
    let total_inactive_query = career_id
      ? { career_id, isActive: 0 }
      : { isActive: 0 };
    let speciality_list = await UserService().getAllSpecialityList(
      filters,
      transaction
    );
    let total_speciality = await UserService().countSpeciality(
      total_query,
      transaction
    );
    let total_active_speciality = await UserService().countSpeciality(
      total_active_query,
      transaction
    );
    let total_inactive_speciality = await UserService().countSpeciality(
      total_inactive_query,
      transaction
    );
    req.rData = {
      total_speciality,
      total_active_speciality,
      total_inactive_speciality,
      speciality_list,
    };
    next();
  };

  const getAllCareerList = async (req, res, next, transaction) => {
    console.log("UserController => getAllSpecialityList");
    let { userId } = req.body;
    let { page, limit, status, search } = req.query;
    let filters = { page, limit, status, search };
    let career_list = await UserService().getAllCareerList(
      filters,
      transaction
    );
    if (career_list && career_list.length > 0)
      career_list = await validateCareerData(career_list, userId, transaction);
    let total_career = await UserService().countCareer({}, transaction);
    let total_active_career = await UserService().countCareer(
      { isActive: 1 },
      transaction
    );
    let total_inactive_career = await UserService().countCareer(
      { isActive: 0 },
      transaction
    );
    req.rData = {
      total_career,
      total_active_career,
      total_inactive_career,
      career_list,
    };
    next();
  };

  const validateCareerData = async (data, user_id, transaction) => {
    let careerData = [];
    for (const item of data) {
      let { id, title, image, description, isActive } = item;

      let career_info = { student_id: user_id, career_id: id };
      let user_added_this_career = user_id
        ? await UserService().fetchStudentCareerInfo(
            career_info,
            transaction,
            "list"
          )
        : null;
      let total_speciality = await UserService().countSpeciality(
        { career_id: id },
        transaction
      );

      let isAdded = user_added_this_career ? true : false;
      careerData.push({
        id,
        title,
        image,
        description,
        isActive,
        isAdded,
        total_speciality,
      });
    }
    return careerData;
  };

  const getAllSkillList = async (req, res, next, transaction) => {
    console.log("UserController => getAllSkillList");
    let { page, limit, status, career_id } = req.query;
    try {
      if (career_id) career_id = JSON.parse(career_id.replace(/\\/g, ""));
    } catch (e) {}
    let core_filters = {
      page,
      limit,
      status,
      career_id,
      career_id,
      skill_type: "core",
    };
    let booster_filters = {
      page,
      limit,
      status,
      career_id,
      career_id,
      skill_type: "booster",
    };
    let core_skill_list = await UserService().getAllSkillList(
      core_filters,
      transaction
    );
    let booster_skill_list = await UserService().getAllSkillList(
      booster_filters,
      transaction
    );
    req.rData = { core_skill_list, booster_skill_list };
    next();
  };

  const addCounsellerDetails = async (req, res, next, transaction) => {
    console.log("UserController => addCounsellerDetails");
    let {
      first_name,
      last_name,
      email,
      gender,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      company_name,
      secondary_email,
      about,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      image,
      experience,
      username,
      career_data,
      service_data,
      userId,
    } = req.body;
    try {
      if (career_data) career_data = JSON.parse(career_data.replace(/\\/g, ""));
      if (service_data)
        service_data = JSON.parse(service_data.replace(/\\/g, ""));
    } catch (e) {}
    // username = email.substring(0,email.indexOf("@"));
    let user = {
      first_name,
      last_name,
      email,
      gender,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      about,
      image,
      username,
    };
    let counseller_info = {
      user_id: userId,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      company_name,
      secondary_email,
      experience,
    };
    if (req.authUser.profile_stag == "0") {
      user.profile_stag = "1";
      user.isProfileComplete = true;
    }
    let update_user_result = await UserService().updateProfile(
      userId,
      user,
      transaction
    );

    let exist_counseller_info = await UserService().fetchCounsellerDetails(
      { user_id: userId },
      transaction
    );
    if (exist_counseller_info) {
      let update_result = await UserService().updateCounsellerDetails(
        { id: exist_counseller_info.id },
        counseller_info,
        transaction
      );
    } else {
      let add_result = await UserService().addCounsellerDetails(
        counseller_info,
        transaction
      );
    }
    let percenage_result = await calculateCompleteProfilePercentage(
      userId,
      counseller_valid_fields,
      counseller_column_value,
      "withCounsellerDetails",
      transaction
    );
    let career_ids = [];
    if (career_data && career_data.length > 0)
      career_ids = await saveUserCareerInfo(career_data, userId, transaction);
    if (career_ids.length > 0)
      delete_result = await UserService().deleteUserCareerInfo(
        { userId, id: { [Op.notIn]: career_ids } },
        transaction
      );
    let service_ids = [];
    if (service_data && service_data.length > 0)
      service_ids = await saveUserServiceInfo(
        service_data,
        userId,
        transaction
      );
    if (service_ids.length > 0)
      delete_result = await UserService().deleteUserServiceInfo(
        { userId, id: { [Op.notIn]: service_ids } },
        transaction
      );
    if (
      !req.authUser.isMobileVerified ||
      exist_counseller_info.mobile != mobile
    ) {
      if (exist_counseller_info && exist_counseller_info.mobile != mobile)
        update_user_result2 = await UserService().updateProfile(
          userId,
          { isMobileVerified: false },
          transaction
        );
      let otp = helpers().generateOTP();
      let otp_result = await sendOTPOnMobile(
        countryCode,
        mobile,
        otp,
        first_name,
        transaction
      );
      req.rData = { email, userId, user_type: "counseller" };
      req.msg = "otp_sent";
    } else {
      user = await UserService().fetch(
        userId,
        transaction,
        "withCounsellerDetails"
      );
      req.rData = { user };
    }
    next();
  };

  const updateCounsellorBackCover = async (req, res, next, transaction) => {
    console.log("UserController => updateCounsellorBackgroundCover");
    let { backgroundCoverColor, userId } = req.body;
    console.log("req data", req.body);
    let counseller_info = { backgroundCoverColor, user_id: userId };
    let exist_counseller_info = await UserService().fetchCounsellerDetails(
      { user_id: userId },
      transaction
    );
    if (exist_counseller_info) {
      let update_result = await UserService().updateCounsellerDetails(
        { id: exist_counseller_info.id },
        counseller_info,
        transaction
      );
    } else {
      let add_result = await UserService().addCounsellerDetails(
        counseller_info,
        transaction
      );
    }
    req.rData = {};
    next();
  };

  const addMentorDetails = async (req, res, next, transaction) => {
    console.log("UserController => addMentorDetails");
    let {
      first_name,
      last_name,
      email,
      gender,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      company_name,
      secondary_email,
      about,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      image,
      experience,
      username,
      career_data,
      service_data,
      userId,
    } = req.body;
    try {
      if (career_data) career_data = JSON.parse(career_data.replace(/\\/g, ""));
      if (service_data)
        service_data = JSON.parse(service_data.replace(/\\/g, ""));
    } catch (e) {}
    // username = email.substring(0,email.indexOf("@"));
    let user = {
      first_name,
      last_name,
      email,
      gender,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      about,
      image,
      username,
    };
    let counseller_info = {
      user_id: userId,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      company_name,
      secondary_email,
      experience,
    };
    if (req.authUser.profile_stag == "0") {
      user.profile_stag = "1";
      user.isProfileComplete = true;
    }
    let update_user_result = await UserService().updateProfile(
      userId,
      user,
      transaction
    );

    let exist_counseller_info = await UserService().fetchCounsellerDetails(
      { user_id: userId },
      transaction
    );
    if (exist_counseller_info) {
      let update_result = await UserService().updateCounsellerDetails(
        { id: exist_counseller_info.id },
        counseller_info,
        transaction
      );
    } else {
      let add_result = await UserService().addCounsellerDetails(
        counseller_info,
        transaction
      );
    }
    let percenage_result = await calculateCompleteProfilePercentage(
      userId,
      counseller_valid_fields,
      counseller_column_value,
      "withCounsellerDetails",
      transaction
    );
    let career_ids = [];
    if (career_data.length > 0)
      career_ids = await saveUserCareerInfo(career_data, userId, transaction);
    if (career_ids.length > 0)
      delete_result = await UserService().deleteUserCareerInfo(
        { userId, id: { [Op.notIn]: career_ids } },
        transaction
      );
    let service_ids = [];
    if (service_data.length > 0)
      service_ids = await saveUserServiceInfo(
        service_data,
        userId,
        transaction
      );
    if (service_ids.length > 0)
      delete_result = await UserService().deleteUserServiceInfo(
        { userId, id: { [Op.notIn]: service_ids } },
        transaction
      );
    // if (!req.authUser.isMobileVerified || exist_counseller_info.mobile != mobile) {
    //   if (exist_counseller_info && exist_counseller_info.mobile != mobile) update_user_result2 = await UserService().updateProfile(userId, { isMobileVerified: false }, transaction);
    //   let otp = helpers().generateOTP();
    //   let otp_result = await sendOTPOnMobile(countryCode, mobile, otp, first_name, transaction);
    //   req.rData = { email, userId, user_type: "mentor" };
    //   req.msg = "otp_sent";
    // } else {
    //   user = await UserService().fetch(userId, transaction, "withCounsellerDetails");
    //   req.rData = { user };
    // }
    user = await UserService().fetch(
      userId,
      transaction,
      "withCounsellerDetails"
    );
    req.rData = { user };
    next();
  };

  const addRecruiterDetails = async (req, res, next, transaction) => {
    console.log("UserController => addRecruiterDetails");
    let {
      first_name,
      last_name,
      email,
      password,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      brand_name,
      company_name,
      secondary_email,
      about,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      recruiter_type,
      userId,
      image,
      experience,
      username,
    } = req.body;
    // username = email.substring(0,email.indexOf("@"));
    let user = {
      first_name,
      last_name,
      email,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      about,
      image,
      username,
    };
    if (password) user.password = await helpers().hashPassword(password);
    let recruiter_info = {
      recruiter_id: userId,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      brand_name,
      recruiter_type,
      company_name,
      secondary_email,
      experience,
    };
    if (req.authUser.profile_stag == "0") {
      user.profile_stag = "1";
      user.isProfileComplete = true;
    }
    let update_user_result = await UserService().updateProfile(
      userId,
      user,
      transaction
    );

    let exist_recruiter_info = await UserService().fetchRecruiterDetails(
      { recruiter_id: userId },
      transaction
    );
    if (exist_recruiter_info) {
      let update_result = await UserService().updateRecruiterDetails(
        { id: exist_recruiter_info.id },
        exist_recruiter_info,
        transaction
      );
    } else {
      let add_result = await UserService().addRecruiterDetails(
        recruiter_info,
        transaction
      );
    }
    let percenage_result = await calculateCompleteProfilePercentage(
      userId,
      recruiter_valid_fields,
      recruiter_column_value,
      "withRecruiterDetails",
      transaction
    );
    if (
      !req.authUser.isMobileVerified ||
      exist_recruiter_info.mobile != mobile
    ) {
      if (exist_recruiter_info && exist_recruiter_info.mobile != mobile)
        update_user_result2 = await UserService().updateProfile(
          userId,
          { isMobileVerified: false },
          transaction
        );
      let otp = helpers().generateOTP();
      let otp_result = await sendOTPOnMobile(
        countryCode,
        mobile,
        otp,
        first_name,
        transaction
      );
      req.rData = { email, userId, user_type: "recruiter" };
      req.msg = "otp_sent";
    } else {
      user = await UserService().fetch(
        userId,
        transaction,
        "withRecruiterDetails"
      );
      req.rData = { user };
    }
    next();
  };

  const sendOTPOnMobile = async (
    countryCode,
    mobile,
    otp,
    user_name,
    transaction
  ) => {
    let exist = await UserService().getOTPAndToken(
      { countryCode, mobile },
      transaction
    );
    if (exist) {
      let update_result = await UserService().updateOTPAndToken(
        { id: exist.id },
        { otp },
        transaction
      );
    } else {
      let add_result = await UserService().addOTPAndToken(
        { countryCode, mobile, otp },
        transaction
      );
    }
    let full_mobile = countryCode + "" + mobile;
    //let msg = "Verification Code for your Xaphal is :" + otp + ".This code is only for Your identity verification purpose."
    let msg = `Hi%20${user_name},%20your%20login%20OTP%20for%20Xaphal%20is%20${otp}%20Team%20Xaphal`;
    let result = await helpers().sendSMS(msg, full_mobile);
    return true;
  };

  const getUserDetailsByName = async (req, res, next, transaction) => {
    let { name } = req.params;
    let { userId } = req.body;
    console.log("UserController=>getUserDetails");
    // let search = name.toLowerCase();
    //let query = { [Op.or]: [{ first_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('first_name')), 'LIKE', '%' + search + '%') }, { last_name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('last_name')), 'LIKE', '%' + search + '%') }] };
    // let query = { username: Sequelize.where(Sequelize.col('username'), 'LIKE', '%' + name + '%') };
    let query = {
      username: Sequelize.where(
        Sequelize.col("username"),
        "LIKE",
        "%" + name + "%"
      ),
    };
    let user_basic_details = await UserService().fetchByQuery(
      query,
      transaction
    );
    console.log("getUserDetailsByName", user_basic_details.username);
    let user = null;
    if (user_basic_details) {
      let scope =
        user_basic_details.user_type == "counseller" ||
        user_basic_details.user_type == "mentor"
          ? "counsellerList"
          : user_basic_details.user_type == "recruiter"
          ? "recruiterList"
          : user_basic_details.user_type == "student"
          ? "student_details"
          : "defaultScope";
      console.log("scope");
      console.log(scope);
      console.log(user_basic_details.user_type);
      user = await UserService().fetchByQuery(query, transaction, scope);

      let total_mentored_students = await RequestService().countRequest(
        { userId: user_basic_details.id, status: "4" },
        transaction,
        "defaultScope",
        "user_requests.studentId"
      );
      req.rData = { user, total_mentored_students };
    } else {
      req.rData = { user };
    }
    req.msg = "user_details";
    next();
  };

  const fetchUserRequestedCounsellor = async (userId, user, transaction) => {
    // let { } = user;
    // for (const item of user)
  };

  const calculateCompleteProfilePercentage = async (
    userId,
    valid_column_array,
    each_column_value,
    scope,
    transaction
  ) => {
    return new Promise(async function (resolve, reject) {
      let user_details = await UserService().fetchByQuery(
        { id: userId },
        transaction,
        scope
      );
      let {
        first_name,
        gender,
        email,
        image,
        country,
        state,
        city,
        about,
        user_other_details,
        recruiter_other_details,
      } = user_details;
      let { designation, company_name, brand_name, mobile } = user_other_details
        ? user_other_details
        : recruiter_other_details
        ? recruiter_other_details
        : {};
      let personal_details = {
        first_name,
        mobile,
        gender,
        email,
        image,
        country,
        state,
        city,
        about,
        designation,
        brand_name,
        company_name,
      };

      let total_non_empty_field = await countNonEmptyColumn(
        personal_details,
        valid_column_array
      );
      let new_percentage = parseFloat(
        total_non_empty_field * each_column_value
      ).toFixed(2);

      new_percentage = new_percentage > 99 ? 100 : new_percentage;
      let update_data = { profile_complete_percentage: new_percentage };
      let update_result = await UserService().updateProfile(
        userId,
        update_data,
        transaction
      );
      if (update_result) resolve(true);
    });
  };

  function countNonEmptyColumn(myObj, valid_fields) {
    return new Promise(async function (resolve, reject) {
      let total_non_empty_item = 0;
      let total = 0;
      if (myObj) {
        for (const x in myObj) {
          if (valid_fields.indexOf(x) != "-1") {
            if (myObj[x] != null && myObj[x] != "")
              total_non_empty_item = total_non_empty_item + 1;
            total++;
          }
        }
      }
      resolve(total_non_empty_item);
    });
  }

  const getOtherUserDetails = async (req, res, next, transaction) => {
    console.log("UserController=>getUserDetails");
    let { user_id, user_type, service_id } = req.query;
    let { userId } = req.body;
    console.log("ravi", userId);
    let query = { id: user_id, user_type };
    let scope =
      user_type == "counseller" || user_type == "mentor"
        ? "counsellerList"
        : user_type == "recruiter"
        ? "recruiterList"
        : "defaultScope";
    let user = await UserService().fetchByQuery(query, transaction, scope);
    // console.log("oops",user);
    let service_info = service_id
      ? await UserService().fetchUserServiceInfo(
          { userId: user_id, service_id },
          transaction,
          "onlyFee"
        )
      : null;
    let fee = service_info ? service_info.fee : null;
    let request_query = service_id
      ? { userId: user_id, studentId: userId, service_id }
      : { userId: user_id, studentId: userId };
    let completed_request_query = service_id
      ? { userId: user_id, status: "4", service_id }
      : { userId: user_id, status: "4" };
    let non_completed_request_query = service_id
      ? {
          userId: user_id,
          studentId: userId,
          status: { [Op.in]: ["0", "1", "2"] },
          service_id,
        }
      : {
          userId: user_id,
          studentId: userId,
          status: { [Op.in]: ["0", "1", "2"] },
        };
    let request_count = await RequestService().countRequest(
      request_query,
      transaction
    );
    let completed_request_count = await RequestService().countRequest(
      completed_request_query,
      transaction
    );
    let not_completed_request_count = await RequestService().countRequest(
      non_completed_request_query,
      transaction
    );
    // console.log('not_completed_request_count',not_completed_request_count);
    let isPendingRequest = not_completed_request_count > 0 ? true : false;
    let mentored_students = await RequestService().countRequest(
      { userId: user_id, status: "4" },
      transaction,
      "defaultScope",
      "user_requests.studentId"
    );
    let user_rating = await UserService().getRating(
      { studentId: userId, userId: user_id },
      transaction
    );
    let requestCompleteQuery = service_id ? { studentId: userId, userId: user_id, service_id, status: "4" }: { studentId: userId, userId: user_id, status: "4" }
    let user_request_completed = await UserService().getUserRequestCompleted(
      requestCompleteQuery,
      transaction
    );
    user_rating = user_rating ? true : false;
    user_request_completed = user_request_completed ? true : false;
    console.log("ppp", user_request_completed);
    req.rData = {
      user,
      user_rating,
      user_request_completed,
      fee,
      mentored_students,
      total_hours_tought: completed_request_count,
      request_count,
      total_session: completed_request_count,
      isPendingRequest,
    };
    req.msg = "user_details";
    next();
  };

  const addUserCareerInfo = async (req, res, next, transaction) => {
    console.log("UserController => addUserCareerInfo");
    let { career_data, userId } = req.body;
    try {
      if (career_data) career_data = JSON.parse(career_data.replace(/\\/g, ""));
    } catch (e) {}
    let career_ids = [];
    if (career_data.length > 0)
      career_ids = await saveUserCareerInfo(career_data, userId, transaction);
    if (career_ids.length > 0)
      delete_result = await UserService().deleteUserCareerInfo(
        { userId, id: { [Op.notIn]: career_ids } },
        transaction
      );
    let scope =
      req.authUser.user_type == "counseller" ||
      req.authUser.user_type == "mentor"
        ? "withCounsellerDetails"
        : req.authUser.user_type == "recruiter"
        ? "withRecruiterDetails"
        : "defaultScope";
    let user = await UserService().fetch(userId, transaction, scope);
    req.rData = { user };
    next();
  };

  const saveUserCareerInfo = async (data, userId, transaction) => {
    let ids = [];
    for (const item of data) {
      let { career_id, skill_ids } = item;
      let career_info = { userId, career_id };
      let exist = await UserService().fetchUserCareerInfo(
        career_info,
        transaction
      );
      let user_career_id = null;
      if (!exist) {
        let add_result = await UserService().addUserCareerInfo(
          career_info,
          transaction
        );
        ids.push(add_result.id);
        user_career_id = add_result.id;
      } else {
        ids.push(exist.id);
        user_career_id = exist.id;
      }
      /*let exist_skill_ids = [];
      if(skill_ids.length>0) exist_skill_ids = await saveUserSkills(skill_ids, user_career_id, transaction);
      if(exist_skill_ids.length>0) delete_result = await UserService().deleteUserSkill({user_career_id,id:{[Op.notIn]:exist_skill_ids}}, transaction);*/
    }
    return ids;
  };

  const saveUserSkills = async (skill_ids, user_career_id, transaction) => {
    console.log("controler=>saveUserSkills");
    console.log(user_career_id);
    let ids = [];
    for (const skill_id of skill_ids) {
      let skill_info = { user_career_id, skill_id };
      let exist = await UserService().fetchUserSkill(skill_info, transaction);
      if (!exist) {
        let result = await UserService().addUserSkill(skill_info, transaction);
        ids.push(result.id);
      } else {
        ids.push(exist.id);
      }
    }
    return ids;
  };

  const saveUserServiceInfo = async (data, userId, transaction) => {
    let ids = [];
    for (const item of data) {
      let { service_id, fee } = item;
      let service_info = { userId, service_id, fee };
      let exist = await UserService().fetchUserServiceInfo(
        service_info,
        transaction
      );
      let user_career_id = null;
      if (!exist) {
        let add_result = await UserService().addUserServiceInfo(
          service_info,
          transaction
        );
        ids.push(add_result.id);
      } else {
        ids.push(exist.id);
      }
      /*let exist_skill_ids = [];
      if(skill_ids.length>0) exist_skill_ids = await saveUserSkills(skill_ids, user_career_id, transaction);
      if(exist_skill_ids.length>0) delete_result = await UserService().deleteUserSkill({user_career_id,id:{[Op.notIn]:exist_skill_ids}}, transaction);*/
    }
    return ids;
  };

  const getAllServiceList = async (req, res, next, transaction) => {
    console.log("UserController => getAllServiceList");
    let { userId } = req.body;
    let { page, limit, status, search, user_type } = req.query;
    let filters = { page, limit, status, search, user_type };
    let service_list = await UserService().getAllServiceList(
      filters,
      transaction
    );
    if (userId && service_list.length > 0)
      service_list = await getServiceFee(service_list, userId, transaction);
    req.rData = { service_list };
    next();
  };
  const getAllUserServiceList = async (req, res, next, transaction) => {
    console.log("UserController => getAllUserServiceList");
    let { userId } = req.body;
    let { page, limit, status, search, user_type } = req.query;
    let filters = { page, limit, status, search, user_type };
    let service_list = await UserService().getAllServiceList(
      filters,
      transaction
    );
    if (userId && service_list.length > 0)
      service_list = await getServiceFee(service_list, userId, transaction);
    req.rData = { service_list };
    next();
  };
  // const updateServiceList = async (req, res, next, transaction) => {
  //   console.log("UserController => getAllServiceList");
  //   let { userId } = req.body;
  //   // let { page, limit, status, search, user_type } = req.query;
  //   let filters = { id: userId };
  //   let data = {title : "Resume/C.V Guidance"}
  //   let service_list = await UserService().updateServiceList(filters, data, transaction);
  //   req.rData = { service_list };
  //   next();
  // }

  const getServiceFee = async (data, userId, transaction) => {
    let service_data = [];
    for (const item of data) {
      let { id, title, description, isActive } = item;
      let exist_service = await UserService().fetchUserServiceInfo(
        { userId, service_id: id },
        transaction
      );
      let fee = exist_service ? exist_service.fee : null;
      let user_service_active = exist_service ? exist_service.isActive : false;
      let user_service = exist_service ? true : false;
      service_data.push({
        id,
        title,
        description,
        isActive,
        user_service_active,
        user_service,
        fee,
      });
    }
    return service_data;
  };

  const addUserServiceInfo = async (req, res, next, transaction) => {
    console.log("UserController => addUserServiceInfo");
    let { service_id, fee, userId } = req.body;
    let service_info = { userId, service_id, fee };
    let exist = await UserService().fetchUserServiceInfo(
      { userId, service_id },
      transaction
    );
    if (!exist) {
      let add_result = await UserService().addUserServiceInfo(
        service_info,
        transaction
      );
    } else {
      let update_result = await UserService().updateUserServiceInfo(
        { id: exist.id },
        service_info,
        transaction
      );
    }
    next();
  };

  const updateUserServiceInfo = async (req, res, next, transaction) => {
    console.log("UserController => updateUserServiceInfo");
    let { service_id, userId, isActive } = req.body;
    console.log("req ", req.body);
    let service_info = { userId, service_id, isActive };
    let update_result = await UserService().updateUserServiceInfo(
      { userId, service_id },
      service_info,
      transaction
    );

    next();
  };
  const removeUserServiceInfo = async (req, res, next, transaction) => {
    console.log("UserController => removeUserServiceInfo");
    let { service_id, userId } = req.body;
    console.log("req ", req.body);
    let service_info = { userId, service_id };
    let exist = await UserService().deleteUserServiceInfo(
      service_info,
      transaction
    );

    next();
  };

  const addCounseller = async (req, res, next, transaction) => {
    console.log("UserController => addCounseller");
    let {
      first_name,
      last_name,
      email,
      password,
      gender,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      company_name,
      secondary_email,
      about,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      image,
      experience,
      career_data,
      service_data,
      userId,
    } = req.body;
    try {
      if (career_data) career_data = JSON.parse(career_data.replace(/\\/g, ""));
      if (service_data)
        service_data = JSON.parse(service_data.replace(/\\/g, ""));
    } catch (e) {}
    if (password) password = await helpers().hashPassword(password);
    let user = {
      first_name,
      last_name,
      email,
      gender,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      about,
      image,
      password,
      user_type: "counseller",
    };

    if (userId) {
      let update_user_result = await UserService().updateProfile(
        userId,
        user,
        transaction
      );
    } else {
      user.profile_stag = "1";
      user.isProfileComplete = true;
      let add_result = await UserService().add(user, transaction);
      userId = add_result.id;
    }

    let counseller_info = {
      user_id: userId,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      company_name,
      secondary_email,
      experience,
    };
    let exist_counseller_info = await UserService().fetchCounsellerDetails(
      { user_id: userId },
      transaction
    );
    if (exist_counseller_info) {
      let update_result = await UserService().updateCounsellerDetails(
        { id: exist_counseller_info.id },
        counseller_info,
        transaction
      );
    } else {
      let add_result = await UserService().addCounsellerDetails(
        counseller_info,
        transaction
      );
    }
    let percenage_result = await calculateCompleteProfilePercentage(
      userId,
      counseller_valid_fields,
      counseller_column_value,
      "withCounsellerDetails",
      transaction
    );
    let career_ids = [];
    if (career_data.length > 0)
      career_ids = await saveUserCareerInfo(career_data, userId, transaction);
    if (career_ids.length > 0)
      delete_result = await UserService().deleteUserCareerInfo(
        { userId, id: { [Op.notIn]: career_ids } },
        transaction
      );
    let service_ids = [];
    if (service_data.length > 0)
      service_ids = await saveUserServiceInfo(
        service_data,
        userId,
        transaction
      );
    if (service_ids.length > 0)
      delete_result = await UserService().deleteUserServiceInfo(
        { userId, id: { [Op.notIn]: service_ids } },
        transaction
      );
    user = await UserService().fetch(
      userId,
      transaction,
      "withCounsellerDetails"
    );
    req.rData = { user };
    next();
  };

  const addMentor = async (req, res, next, transaction) => {
    console.log("UserController => addMentor");
    let {
      first_name,
      last_name,
      email,
      password,
      gender,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      company_name,
      secondary_email,
      about,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      image,
      experience,
      career_data,
      service_data,
      userId,
    } = req.body;
    try {
      if (career_data) career_data = JSON.parse(career_data.replace(/\\/g, ""));
      if (service_data)
        service_data = JSON.parse(service_data.replace(/\\/g, ""));
    } catch (e) {}
    if (password) password = await helpers().hashPassword(password);
    let user = {
      first_name,
      last_name,
      email,
      gender,
      country,
      state,
      city,
      state_isocode,
      city_isocode,
      about,
      image,
      password,
      user_type: "mentor",
    };

    if (userId) {
      let update_user_result = await UserService().updateProfile(
        userId,
        user,
        transaction
      );
    } else {
      user.profile_stag = "1";
      user.isProfileComplete = true;
      let add_result = await UserService().add(user, transaction);
      userId = add_result.id;
    }

    let counseller_info = {
      user_id: userId,
      mobile,
      countryCode,
      secondary_mobile,
      secondary_countryCode,
      designation,
      company_name,
      secondary_email,
      experience,
    };
    let exist_counseller_info = await UserService().fetchCounsellerDetails(
      { user_id: userId },
      transaction
    );
    if (exist_counseller_info) {
      let update_result = await UserService().updateCounsellerDetails(
        { id: exist_counseller_info.id },
        counseller_info,
        transaction
      );
    } else {
      let add_result = await UserService().addCounsellerDetails(
        counseller_info,
        transaction
      );
    }
    let percenage_result = await calculateCompleteProfilePercentage(
      userId,
      counseller_valid_fields,
      counseller_column_value,
      "withCounsellerDetails",
      transaction
    );
    let career_ids = [];
    if (career_data.length > 0)
      career_ids = await saveUserCareerInfo(career_data, userId, transaction);
    if (career_ids.length > 0)
      delete_result = await UserService().deleteUserCareerInfo(
        { userId, id: { [Op.notIn]: career_ids } },
        transaction
      );
    let service_ids = [];
    if (service_data.length > 0)
      service_ids = await saveUserServiceInfo(
        service_data,
        userId,
        transaction
      );
    if (service_ids.length > 0)
      delete_result = await UserService().deleteUserServiceInfo(
        { userId, id: { [Op.notIn]: service_ids } },
        transaction
      );
    user = await UserService().fetch(
      userId,
      transaction,
      "withCounsellerDetails"
    );
    req.rData = { user };
    next();
  };

  const deleteUser = async (req, res, next, transaction) => {
    console.log("UserController => deleteUser");
    let { user_type, userId } = req.body;
    let result = await UserService().removeUser(
      { id: userId, user_type },
      transaction
    );

    next();
  };

  const myActivity = async (req, res, next, transaction) => {
    console.log("UserController => myActivity");
    let { userId } = req.body;
    let { search, page, limit } = req.query;
    let filters = { search, page, limit, userId, isLiked: "1" };
    let added_question_count_query = { userId };
    added_question_count_query["$and"] = Sequelize.literal(
      "(questions.id NOT IN (SELECT f_q.questionId FROM flagged_questions f_q WHERE f_q.userId=" +
        filters.userId +
        "))"
    );
    let answered_question_count_query = { userId };
    answered_question_count_query["$and"] = Sequelize.literal(
      "(questionId NOT IN (SELECT f_q.questionId FROM flagged_questions f_q WHERE f_q.userId=" +
        filters.userId +
        "))"
    );

    let scope =
      req.authUser.user_type == "student"
        ? "student_details"
        : req.authUser.user_type == "counseller" ||
          req.authUser.user_type == "mentor"
        ? "withCounsellerDetails"
        : req.authUser.user_type == "recruiter"
        ? "withRecruiterDetails"
        : "defaultScope";
    let user_details = await UserService().fetchByQuery(
      { id: userId },
      transaction,
      scope
    );
    let liked_question = await QuestionService().likeQuestionList(
      filters,
      transaction,
      "withQuestionDetails"
    );
    let total_added_question = await QuestionService().countQuestion(
      added_question_count_query,
      transaction
    );
    let total_answered_question = await QuestionService().countQuestionComment(
      answered_question_count_query,
      transaction,
      "basic"
    );
    if (liked_question.length > 0)
      liked_question = await fetchOtherQuestionData(
        liked_question,
        userId,
        transaction
      );

    req.rData = {
      user_details,
      liked_question,
      total_added_question,
      total_answered_question,
    };
    next();
  };

  const answeredQuestion = async (req, res, next, transaction) => {
    console.log("UserController => answeredQuestion");
    let { userId } = req.body;
    let { search, page, limit } = req.query;
    let filters = { search, page, limit, userId };

    let anwered_question = await QuestionService().commentedQuestionList(
      filters,
      transaction,
      "withQuestionDetails"
    );
    if (anwered_question.length > 0)
      anwered_question = await fetchOtherQuestionData(
        anwered_question,
        userId,
        transaction
      );

    req.rData = { anwered_question };
    next();
  };

  const savedQuestion = async (req, res, next, transaction) => {
    console.log("UserController => savedQuestion");
    let { userId } = req.body;
    let { search, page, limit } = req.query;
    let filters = { search, page, limit, userId };
    let bookmarked_question = await QuestionService().bookmarkQuestionList(
      filters,
      transaction,
      "withQuestionDetails"
    );
    if (bookmarked_question.length > 0)
      bookmarked_question = await fetchOtherQuestionData(
        bookmarked_question,
        userId,
        transaction
      );

    req.rData = { bookmarked_question };
    next();
  };

  const askedQuestion = async (req, res, next, transaction) => {
    console.log("UserController => askedQuestion");
    let { userId } = req.body;
    let { search, page, limit } = req.query;
    let filters = { search, page, limit, userId, type: "1", isLiked: "1" };

    let asked_question_list = await QuestionService().questionList(
      filters,
      transaction,
      "withAllDetails"
    );
    if (asked_question_list.length > 0)
      asked_question_list = await fetchQuestionData(
        asked_question_list,
        userId,
        transaction
      );
    req.rData = { asked_question_list };
    next();
  };

  const fetchQuestionData = async (data, user_id, transaction) => {
    let questionData = [];
    for (const item of data) {
      let {
        id,
        userId,
        adminId,
        first_name,
        last_name,
        image,
        date,
        title,
        description,
        isActive,
        link,
        total_comment,
        total_like,
        total_unlike,
        total_share,
        createdAt,
        user_details,
        admin_details,
        comments_list,
        tagged_skills,
      } = item;
      let time = getTimeDifference(createdAt);
      let query = { userId: user_id, questionId: id };
      let userLike = user_id
        ? await QuestionService().fetchQuestionLikeByQuery(query, transaction)
        : null;
      let userComments = user_id
        ? await QuestionService().fetchQuestionCommentByQuery(
            query,
            transaction
          )
        : null;
      let userBookmarked = user_id
        ? await QuestionService().fetchBookmarkedQuestionByQuery(
            query,
            transaction
          )
        : null;
      // let tagged_skills = await QuestionService().fetchAllTaggedSkillByQuery({questionId:id},transaction);
      let metadata = null;
      try {
        metadata = (await (link && validUrl.isUri(link)))
          ? urlMetadata(link)
          : null;
      } catch {}

      let isCommented = userComments ? true : false;
      let isLiked = userLike && userLike.isLiked == "1" ? true : false;
      let isDisLiked = userLike && userLike.isLiked == "0" ? true : false;
      let isBookemarked = userBookmarked ? true : false;
      questionData.push({
        id,
        userId,
        adminId,
        first_name,
        last_name,
        image,
        date,
        title,
        description,
        isActive,
        link,
        metadata,
        total_comment,
        total_like,
        total_unlike,
        total_share,
        createdAt,
        isLiked,
        isDisLiked,
        isCommented,
        isBookemarked,
        time,
        tagged_skills,
        user_details,
        admin_details,
        comments_list,
      });
    }
    return questionData;
  };

  const fetchOtherQuestionData = async (data, user_id, transaction) => {
    let questionData = [];
    for (const item of data) {
      let { question_details } = item;
      let {
        id,
        userId,
        adminId,
        first_name,
        last_name,
        image,
        date,
        title,
        description,
        isActive,
        link,
        total_comment,
        total_like,
        total_unlike,
        total_share,
        createdAt,
        user_details,
        admin_details,
        comments_list,
        tagged_skills,
      } = question_details;
      let time = getTimeDifference(createdAt);
      let query = { userId: user_id, questionId: id };
      let userLike = user_id
        ? await QuestionService().fetchQuestionLikeByQuery(query, transaction)
        : null;
      let userComments = user_id
        ? await QuestionService().fetchQuestionCommentByQuery(
            query,
            transaction
          )
        : null;
      let userBookmarked = user_id
        ? await QuestionService().fetchBookmarkedQuestionByQuery(
            query,
            transaction
          )
        : null;
      // let tagged_skills = await QuestionService().fetchAllTaggedSkillByQuery({questionId:id},transaction);
      let metadata = null;
      try {
        metadata = (await (link && validUrl.isUri(link)))
          ? urlMetadata(link)
          : null;
      } catch {}

      let isCommented = userComments ? true : false;
      let isLiked = userLike && userLike.isLiked == "1" ? true : false;
      let isDisLiked = userLike && userLike.isLiked == "0" ? true : false;
      let isBookemarked = userBookmarked ? true : false;
      questionData.push({
        id,
        userId,
        adminId,
        first_name,
        last_name,
        image,
        date,
        title,
        description,
        isActive,
        link,
        metadata,
        total_comment,
        total_like,
        total_unlike,
        total_share,
        createdAt,
        isLiked,
        isDisLiked,
        isCommented,
        isBookemarked,
        time,
        tagged_skills,
        user_details,
        admin_details,
        comments_list,
      });
    }
    return questionData;
  };

  const getTimeDifference = (fromDate) => {
    var startDate = new Date(fromDate);
    // Do your operations
    var endDate = new Date();
    var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    return convertHMS(seconds);
  };
  const convertHMS = (value) => {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
    let seconds = sec - hours * 3600 - minutes * 60; //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return hours + ":" + minutes + ":" + seconds;
  };

  const getAllOrganizationList = async (req, res, next, transaction) => {
    console.log("UserController => getAllOrganizationList");
    let { userId } = req.body;
    let { page, limit } = req.query;
    let filters = { page, limit };
    let organization_list = await SettingService().getAllOrganizationList(
      filters,
      transaction
    );
    req.rData = { organization_list };
    next();
  };

  const getAllIndustryList = async (req, res, next, transaction) => {
    console.log("UserController => getAllIndustryList");
    let { userId } = req.body;
    let { page, limit } = req.query;
    let filters = { page, limit };
    let industry_list = await SettingService().getAllIndustryList(
      filters,
      transaction
    );
    req.rData = { industry_list };
    next();
  };

  const getAllRatingList = async (req, res, next, transaction) => {
    console.log("UserController => getAllRatingList");
    let { userId } = req.body;
    let { page, limit } = req.query;
    let filters = { page, limit, userId };
    let rating_list = await UserService().getAllRatingList(
      filters,
      transaction
    );
    req.rData = { rating_list };
    next();
  };

  const addWalletAmount = async (req, res, next, transaction) => {
    console.log("addWalletAmount", amount);
    let { amount, date, userId, transaction_id } = req.body;
    let update_user_wallet = await UserService().updateProfile(
      userId,
      { wallet_amount: Sequelize.literal("wallet_amount +" + amount) },
      transaction
    );
    let update_result = await UserService().addUserWalletPayment(
      { amount, date, userId, transaction_id },
      transaction
    );
    let user = await UserService().fetchByQuery({ id: userId }, transaction);
    req.rData = { user };
    next();
  };

  const requestToWithdrawWalletAmount = async (req, res, next, transaction) => {
    let { amount, userId } = req.body;
    let update_result = await UserService().addUserWalletPaymentRequest(
      { amount, userId },
      transaction
    );
    next();
  };

  const saveQuery = async (req, res, next, transaction) => {
    let { subject, query, userId } = req.body;
    let update_result = await UserService().addUserQuery(
      { subject, query, userId },
      transaction
    );
    next();
  };

  return {
    login,
    signup,
    completeSignup,
    resetPassword,
    changePassword,
    logout,
    checkEmailExist,
    getAboutUs,
    getPrivacyAndPolicy,
    getTermAndCondition,
    getHelplineNumber,
    userList,
    getUserDetails,
    updateUserStatus,
    removeUser,
    addStudentAmbassador,
    addTeamRequest,
    addCollegePartnership,
    addAdvertisement,
    addInvestorRelations,
    addEarlyJoin,
    getAllCountryList,
    getAllStateList,
    getAllCityList,
    getAllSpecialityList,
    getAllCareerList,
    getAllSkillList,
    addCounsellerDetails,
    addMentorDetails,
    addRecruiterDetails,
    getUserDetailsByName,
    getOtherUserDetails,
    addUserCareerInfo,
    getAllServiceList,
    getAllUserServiceList,
    updateUserServiceInfo,
    // updateServiceList,
    addUserServiceInfo,
    removeUserServiceInfo,
    addCounseller,
    addMentor,
    deleteUser,
    myActivity,
    answeredQuestion,
    savedQuestion,
    askedQuestion,
    getAllOrganizationList,
    getAllIndustryList,
    getAllRatingList,
    addWalletAmount,
    requestToWithdrawWalletAmount,
    saveQuery,
    addUserPersonaInfo,
    addUserCollaborationInfo,
    addUserProjectInfo,
    addUserSocialMedia,
    updateCounsellorBackCover,
    addSocialMediaLinks,
    getAllSocialMediaLinks,
    deleteUserSocialMedia,
  };
};
