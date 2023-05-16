const UserService = require("../services/UserService");
const AdminService = require("../services/AdminService");
const helpers = require("../util/helpers");
const User = require("../models/User");
const colors = require("colors");

module.exports = () => {
  const sendOtp = async (req, res, next, transaction) => {
    let { email, user_type } = req.body;
    if (!email) email = req.query.email;
    let user = await UserService().fetchByQuery({ email }, transaction);
    let userId = user ? user.id : null;
    if (!user_type) user_type = user ? user.user_type : null;
    if (userId) {
      let otp = helpers().generateOTP();
      let token = await helpers().createJWT({
        userId,
        user_type,
        verified: false,
      });
      req.msg = "otp_sent_email";

      let otp_query = { email };
      let otp_data = { email, otp, token };
      let save_otp_result = await saveOtpAndToken(
        otp_query,
        otp_data,
        transaction
      );
      let html =
        "Verification Code for your Xaphal is :" +
        otp +
        ".This code is only for Your identity verification purpose.";
      let result = await helpers().sendEmail(email, "Verification code", html);
      // req.rData = { token, user_type, otp };
      req.rData = { token, user_type };
    }
    next();
  };
  const resendOtp = async (req, res, next, transaction) => {
    console.log("OtpController => resendOtp");
    let { email, countryCode, mobile, user_type, userId } = req.body;

    let otp = helpers().generateOTP();
    if (email) {
      let user = await UserService().fetchByQuery({ email }, transaction);
      let userId = user.id;
      if (user) {
        let otp_query = { email };
        let otp_data = { email, otp };
        let save_otp_result = await saveOtpAndToken(
          otp_query,
          otp_data,
          transaction
        );

        let html =
          "Verification Code for your Xaphal is :" +
          otp +
          ".This code is only for Your identity verification purpose.";
        let result = await helpers().sendEmail(
          email,
          "Verification code",
          html
        );
        // req.rData = { otp, userId }
        req.rData = { userId, email, mobile };
        req.msg = "otp_resent_email";
      } else {
        req.msg = "wrong_email";
      }
    } else if (countryCode && mobile) {
      console.log("usertype* mobile else", user_type == "counseller");
      let user =
        user_type == "student"
          ? await UserService().getStudentContactDetails(
              { studentId: userId },
              transaction
            )
          : user_type == "mentor" || user_type == "counseller"
          ? await UserService().fetchCounsellerDetails(
              { user_id: userId },
              transaction
            )
          : user_type == "recruiter"
          ? await UserService().fetchRecruiterDetails(
              { recruiter_id: userId },
              transaction
            )
          : null;
      console.log("user", user);
      if (!user) {
        console.log("not mobile exist");
        let user_find =
          user_type == "student"
            ? await UserService().getStudentContactDetails(
                { countryCode, mobile },
                transaction
              )
            : user_type == "mentor" || user_type == "counseller"
            ? await UserService().fetchCounsellerDetails(
                { countryCode, mobile },
                transaction
              )
            : null;
        if (!user_find) {
          let user_data = { countryCode, mobile };
          if (user_type == "student") {
            console.log("not mobile exist1222", user_type);
            user_data.studentId = userId;
            console.log("ddooo1", user_data);
            let update = await UserService().addStudentContactDetails(
              user_data,
              transaction
            );
          } else if (user_type == "mentor" || user_type == "counseller") {
            let counseller_info = {
              user_id: userId,
              mobile,
              countryCode,
            };
            let add_result = await UserService().addCounsellerDetails(
              counseller_info,
              transaction
            );
          }
          // req.msg = "mobile_not_found";
          let otp_query = { countryCode, mobile };
          let otp_data = { countryCode, mobile, otp };

          let save_otp_result = await saveOtpAndToken(
            otp_query,
            otp_data,
            transaction
          );
          // let user_Id = user_type == "student" ? user.studentId : (user_type == "mentor" || user_type == "counseller") ? user.user_id : (user_type == "recruiter") ? user.recruiter_id : null;
          let full_mobile = countryCode + "" + mobile;
          //let msg = "Hi%20uttam,%20your%20login%20OTP%20for%20Xaphal%20is%112233%20Team%20Xaphal"
          let msg = `Hi%20User,%20your%20login%20OTP%20for%20Xaphal%20is%20${otp}%20Team%20Xaphal`;
          let result = await helpers().sendSMS(msg, full_mobile);
          // req.rData = { otp, userId }
          console.log("result", result);
          if (result.status == "success") {
            req.rData = { userId, mobile, email };
            req.msg = "otp_resent";
          } else {
            // console.log("warnings", typeof result.warnings[0].message);
            // let customMsg= `${result.warnings[0].message}`
            let delete_otp = await UserService().deleteOTPAndToken(
              otp_query,
              transaction
            );
            req.rCode = 0;
            req.customMsg = `${result.warnings[0].message}`;
            // req.msg = result.warnings[0].message;
          }
        } else {
          req.rCode = 0;
          req.msg = "mobile_exist";
        }
      } else {
        console.log("user not exist====", user_type == "counseller");
        if(user_type == "counseller" || user_type == "mentor" ){
          let counseller_info = {
            user_id: userId,
            mobile,
            countryCode,
          };
          let add_result = await UserService().addCounsellerDetails(
            counseller_info,
            transaction
          );
          console.log("ramjii", add_result);
        }
        console.log("hanumanji");
        let otp_query = { countryCode, mobile: user?.mobile };
        let otp_data = { countryCode, mobile: user?.mobile, otp };

        let save_otp_result = await saveOtpAndToken(
          otp_query,
          otp_data,
          transaction
        );
        // let user_Id = user_type == "student" ? user.studentId : (user_type == "mentor" || user_type == "counseller") ? user.user_id : (user_type == "recruiter") ? user.recruiter_id : null;
        let full_mobile = countryCode + "" + mobile;
        //let msg = "Hi%20uttam,%20your%20login%20OTP%20for%20Xaphal%20is%112233%20Team%20Xaphal"
        let msg = `Hi%20User,%20your%20login%20OTP%20for%20Xaphal%20is%20${otp}%20Team%20Xaphal`;
        let result = await helpers().sendSMS(msg, full_mobile);
        // req.rData = { otp, userId }
        console.log("result", result);
        if (result.status == "success") {
          req.rData = { userId, mobile, email };
          req.msg = "otp_resent";
        } else {
          // console.log("warnings", typeof result.warnings[0].message);
          // let customMsg= `${result.warnings[0].message}`
          let delete_otp = await UserService().deleteOTPAndToken(
            otp_query,
            transaction
          );
          req.rCode = 0;
          req.customMsg = `${result.warnings[0].message}`;
          // req.msg = result.warnings[0].message;
        }
        // req.rCode = 0;
        // req.msg = 'mobile_exist'
      }
    }

    next();
  };

  const saveOtpAndToken = async (query, data, transaction) => {
    let exist = await UserService().getOTPAndToken(query, transaction);
    console.log("eeee777", exist);
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

  const verifyOtp = async (req, res, next, transaction) => {
    console.log("OtpController => verifyOtp111");
    let { code, userId, otp_for, user_type } = req.body;
    let user = await UserService().fetchByQuery(
      { id: userId },
      transaction,
      "basic"
    );
    console.log(
      "user777",
      user_type,
      userId,
      user.id,
      " ",
      user_type == "student"
    );
    let additional_info;
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
    else if (user_type == "student")
      additional_info = await UserService().getStudentContactDetails(
        { studentId: userId },
        transaction
      );
    // additional_info = await UserService().getStudentContactDetails({ studentId: userId }, transaction);
    console.log("aaaaa222", additional_info);
    if (user) {
      console.log("pppp***");
      let query =
        otp_for == "mobile verification" && additional_info
          ? {
              countryCode: additional_info.countryCode,
              mobile: additional_info.mobile,
            }
          : { email: user.email };
      let exist = await UserService().getOTPAndToken(query, transaction);
      console.log("exist => 999uuu", exist);
      let otp = exist.otp;
      var verify = code == otp ? true : false;
      if (verify && exist) {
        let user_data =
          otp_for == "mobile verification"
            ? { isMobileVerified: true }
            : { isEmailVerified: true };
        if (
          otp_for == "mobile verification" ||
          otp_for == "email verification"
        ) {
          update_result = await UserService().updateProfile(
            userId,
            user_data,
            transaction
          );
          let html =
            otp_for == "email verification"
              ? "Dear " +
                user.first_name +
                ",<br><br><br> You have successfully verify your email.<br><br>Regards,<br>Xaphal"
              : "Dear " +
                user.first_name +
                ",<br><br><br> You have successfully verify your mobile.<br><br>Regards,<br>Xaphal";
          let result = await helpers().sendEmail(
            user.email,
            "Verification status",
            html
          );
        }
        let token = await helpers().createJWT({
          userId,
          user_type: user.user_type,
          verified: true,
        });
        let otp_query = { email: user.email };
        let otp_data = { email: user.email, otp, token };
        let save_otp_result = await saveOtpAndToken(
          otp_query,
          otp_data,
          transaction
        );

        req.msg = "otp_verified";
        req.rData = { token, user_type: user.user_type, user };
      } else {
        req.rCode = 0;
        req.msg = "incorrect_otp";
      }
    } else {
      req.rCode = 0;
      req.msg = "mobile_not_found";
    }
    next();
  };

  const sendEmail = async (req, res, next, transaction) => {
    let { email } = req.query;
    //let otp = helpers().generateOTP();
    req.msg = "otp_sent_email";
    let html =
      "Dear uttam,<br><br><br>Thank you for reaching out. You have successfully registered as student ambassador. Our team will get back to you shortly.<br><br>Regards,<br>Xaphal";
    //let html = "Verification Code for your Xaphal is :" + otp + ".This code is only for Your identity verification purpose."
    let result = await helpers().sendEmail(
      "uttamsingh9876@gmail.com",
      "Verification code",
      html
    );
    //token = await helpers().createJWT({ userId,user_type:"customer",verified:false });
    //req.rData = { otp };

    next();
  };

  const sendSMS = async (req, res, next, transaction) => {
    console.log("OtpController => sendSMS");
    let user_name = "uttam";
    let otp = "112233";
    let full_mobile = "+917692804588";
    //let msg = "Hi%20uttam,%20your%20login%20OTP%20for%20Xaphal%20is%112233%20Team%20Xaphal"
    let msg = `Hi%20Aniruddh ,%20your%20login%20OTP%20for%20Xaphal%20is%20450948%20Team%20Xaphal`;
    let result = await helpers().sendSMS(msg, full_mobile);

    next();
  };

  return {
    sendOtp,
    resendOtp,
    verifyOtp,
    sendEmail,
    sendSMS,
  };
};
