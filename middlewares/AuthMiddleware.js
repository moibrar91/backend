const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const ResponseMiddleware = require('./ResponseMiddleware');
const serverConfig = require("../../config/server.json");
const UserService = require('../services/UserService');
const AdminService = require('../services/AdminService');
const helpers = require("../util/helpers");

module.exports = () => {
  const verifyToken = async (req, res, next) => {
    console.log("AuthMiddleware => verifyToken");
    let { token } = req.headers;
    // const authorization = req.headers.authorization;
    // const token = authorization.split(' ')[1];
    console.log("headers ", token);
    let  email= req.body.useremail;
    console.log(req.body.useremail);
    if(email){
      let user = await UserService().getOTPAndToken({ email });
      token = user.token;
      console.log("validToken",token);
    }
    if(req.params.token){
      console.log('req params token');
      token=req.params.token
    }

    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);
        console.log("payload");
        console.log(payload);
        if(payload.verified==true){
          if(payload.user_type=="student"){
            let user = await UserService().fetch(payload.userId, false,'basic');

            if(user && !user.isActive){
              throw new Error("ac_deactivated");
            }

            //checking user must exist in our DB else throwing error
            if(user) {
              req.body.userId = user.id;
              req.authUser = user;
              req.body.user_type = payload.user_type;
              console.log(`USER with ID ${user.id} entered.`);

              next()
            }else throw new Error("invalid_token");
          }
          else if(payload.user_type=="counseller" || payload.user_type=="mentor"){
            let user = await UserService().fetch(payload.userId, false,'basic');

            if(user && !user.isActive){
              throw new Error("ac_deactivated");
            }

            //checking user must exist in our DB else throwing error
            if(user) {
              req.body.userId = user.id;
              req.authUser = user;
              req.body.user_type = payload.user_type;
              console.log(`USER with ID ${user.id} entered.`);

              next()
            }else throw new Error("invalid_token");
          }
          else if(payload.user_type=="admin"){
            let admin = await AdminService().fetch(payload.adminId, false);
            console.log(admin);
            if(!admin){
              throw new Error("ac_deactivated");
            }

            //checking user must exist in our DB else throwing error
            if(admin) {
              console.log(`ADMIN with ID ${admin.id} entered.`);
              req.body.adminId = admin.id;
              req.authUser = admin;
              next()
            }else throw new Error("invalid_token");
          }
          else throw new Error("invalid_token");
        }else throw new Error("invalid_token");

      }
    }catch(ex){
      req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;
      console.log(ex.message);
      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }
  const verifyCounsellerToken = async (req, res, next) => {
    console.log("AuthMiddleware => verifyCounsellerToken");
    let { token } = req.headers;
    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);
        console.log("payload");
        console.log(payload);
        if(payload.verified==true){
          if(payload.user_type=="counseller" || payload.user_type=="mentor"){
            let user = await UserService().fetch(payload.userId, false,'basic');

            if(user && !user.isActive){
              throw new Error("ac_deactivated");
            }

            //checking user must exist in our DB else throwing error
            if(user) {
              req.body.userId = user.id;
              req.authUser = user;
              req.body.user_type = payload.user_type;
              console.log(`USER with ID ${user.id} entered.`);

              next()
            }else throw new Error("invalid_token");
          }
          else if(payload.user_type=="admin"){
            let admin = await AdminService().fetch(payload.adminId, false);
            console.log(admin);
            if(!admin){
              throw new Error("ac_deactivated");
            }

            //checking user must exist in our DB else throwing error
            if(admin) {
              console.log(`ADMIN with ID ${admin.id} entered.`);
              req.body.adminId = admin.id;
              req.authUser = admin;
              next()
            }else throw new Error("invalid_token");
          }
          else throw new Error("invalid_token");
        }else throw new Error("invalid_token");

      }
    }catch(ex){
      req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;
      console.log(ex.message);
      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }

  
  const verifyRecruiterToken = async (req, res, next) => {
    console.log("AuthMiddleware => verifyRecruiterToken");
    let { token } = req.headers;
    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);
        console.log("payload");
        console.log(payload);
        if(payload.verified==true){
          if(payload.user_type=="recruiter"){
            let user = await UserService().fetch(payload.userId, false,'basic');

            if(user && !user.isActive){
              throw new Error("ac_deactivated");
            }

            //checking user must exist in our DB else throwing error
            if(user) {
              req.body.userId = user.id;
              req.authUser = user;
              req.body.user_type = payload.user_type;
              console.log(`USER with ID ${user.id} entered.`);

              next()
            }else throw new Error("invalid_token");
          }
          else if(payload.user_type=="admin"){
            let admin = await AdminService().fetch(payload.adminId, false);
            console.log(admin);
            if(!admin){
              throw new Error("ac_deactivated");
            }

            //checking user must exist in our DB else throwing error
            if(admin) {
              console.log(`ADMIN with ID ${admin.id} entered.`);
              req.body.adminId = admin.id;
              req.authUser = admin;
              next()
            }else throw new Error("invalid_token");
          }
          else throw new Error("invalid_token");
        }else throw new Error("invalid_token");

      }
    }catch(ex){
      req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;
      console.log(ex.message);
      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }

  const checkLoginMobile = async (req, res, next) => {
    console.log("AuthMiddleware => checkLoginMobile");
    try{
        let { mobile, countryCode } = req.query;

        let user = await UserService().fetchByQuery({countryCode,mobile}, false);

        if(!user){
          req.rCode=0;
          req.msg = "incorrect_mobile";
          ResponseMiddleware(req, res, next);
        }else {
          req.body.userId = user.id;
          req.authUser = user;
          console.log(`USER with ID ${user.id} entered.`);
          next()
        }
      }catch(ex){
      console.log(ex);
    }
  }

  const checkEmailToEditUser = async (req, res, next) => {
    console.log("AuthMiddleware => checkEmailToEditUser");
    try{
        console.log("req.body");
        console.log(req.body);
        let { email,userId } = req.body;
        //if(userId){
          let email_query = userId?{
              email,
              id: {
                    [Op.not]: userId
              }
          }:{ email}
          
          let emailExist = await UserService().fetchByQuery(email_query);
          if(emailExist){
            req.rCode=0;
            req.msg = "email_exist";
            ResponseMiddleware(req, res, next);
          }else {
            next();
          }
        /*}else{
          next();

        }*/

    }catch(ex){
      console.log(ex);
    }
  }

  

  const checkMobileToEditUser = async (req, res, next) => {
    console.log("AuthMiddleware => checkMobileToEditUser");
    try{
        console.log("req.body");
        console.log(req.body);
        let { mobile,countryCode,userId,user_type } = req.body;
        let mobile_query ={};
        if(userId){
          mobile_query = user_type=="recruiter"?{
              mobile,
              countryCode,
              recruiter_id: {
                    [Op.not]: userId
              }
          }:{
            mobile,
            countryCode,
            user_id: {
                  [Op.not]: userId
            }
          };
        }else{
          mobile_query = user_type=="recruiter"?{
            mobile,
            countryCode
        }:{
          mobile,
          countryCode
        };
        }
          
          let mobileExist =user_type=="recruiter"? await UserService().fetchRecruiterDetails(mobile_query): await UserService().fetchCounsellerDetails(mobile_query);
          if(mobileExist){
            req.rCode=0;
            req.msg = "mobile_exist";
            ResponseMiddleware(req, res, next);
          }else {
            next();
          }
        

    }catch(ex){
      console.log(ex);
    }
  }


  const verifyAdminToken = async (req, res, next) => {
    console.log("AuthMiddleware => verifyAdminToken");
    let { token } = req.headers;
    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);
        console.log(payload);

        if(payload.verified==true){
          let admin = await AdminService().fetch(payload.adminId, false);
          console.log(admin);
          if(admin && !admin.isActive){
            throw new Error("ac_deactivated");
          }

          //checking user must exist in our DB else throwing error
          if(admin) {
            console.log(`ADMIN with ID ${admin.id} entered.`);
            req.body.adminId = admin.id;
            req.authUser = admin;
            next()
          }else throw new Error("invalid_token");
        }else throw new Error("invalid_token");
      }
    }catch(ex){
      req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;

      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }


  const verifyTokenForAll = async (req, res, next) => {
    console.log("AuthMiddleware => verifyTokenForAll");
    let { token } = req.headers;
    console.log("token",token)

    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);

        let user =null;
            console.log("payload")
            console.log(payload)
        if(payload.verified==true){
          if(payload.adminId) user = await AdminService().fetch(payload.adminId, false);
          else user = await UserService().fetch(payload.userId, false,"basic");
          // console.log(user);
          if(user && !user.isActive){
            throw new Error("ac_deactivated");
          }

          //checking user must exist in our DB else throwing error
          if(user) {
            if(payload.userId) {
              req.body.userId = user.id;
              req.authUser = user;
            }
            if(payload.adminId) {
              req.body.adminId = user.id;
              req.authAdmin = user;
            }
            req.body.user_type = payload.user_type;
            console.log(`USER with ID ${user.id} entered.`);

            next()
          }else throw new Error("invalid_token");
        }else throw new Error("invalid_token");
      }
    }catch(ex){
    console.log("ex",ex)
    req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;

      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }

  const verifyTokenForAllForVerification = async (req, res, next) => {
    console.log("AuthMiddleware => verifyTokenForAll");
    let { token } = req.headers;
    try{
      if(!token){
        throw new Error("invalid_token");
      }else{
        let payload = jwt.verify(token, serverConfig.jwtSecret);

        let user =null;
        if(payload.adminId) user = await AdminService().fetch(payload.adminId, false);
        if(payload.user_type=="customer") user = await UserService().fetch(payload.userId, false);
        // console.log(user);
        if(user && !user.isActive){
          throw new Error("ac_deactivated");
        }

        //checking user must exist in our DB else throwing error
        if(user) {
          if(payload.userId) req.body.userId = user.id;
          if(payload.adminId) req.body.adminId = user.id;
          if(payload.vendorId) req.body.vendorId = user.id;
          req.authUser = user;

          console.log(`USER with ID ${user.id} entered.`);

          next()
        }else throw new Error("invalid_token");
      }
    }catch(ex){
      req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;

      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }

  const checkEmailToEditSubAdmin = async (req, res, next) => {
    console.log("AuthMiddleware => checkEmailToEditUser");
    try{
        console.log("req.body");
        console.log(req.body);
        let { email,subAdminId } = req.body;
          let email_query = subAdminId?{
              email,
              id: {
                    [Op.not]: subAdminId
              }
          }:{ email}
          
          let emailExist = await AdminService().fetchAdmin(email_query);
          if(emailExist){
            req.rCode=0;
            req.msg = "email_exist";
            ResponseMiddleware(req, res, next);
          }else {
            next();
          }

    }catch(ex){
      console.log(ex);
    }
  }

  const checkUsernameToEditUser = async (req, res, next) => {
    console.log("AuthMiddleware => checkUsernameToEditUser");
    try{
        console.log("req.body");
        console.log(req.body);
        let { username,userId } = req.body;
        //if(userId){
          let username_query = {
            username,
              id: {
                    [Op.not]: userId
              }
          }
          
          let usernameExist = await UserService().fetchByQuery(username_query);
          if(usernameExist){
            req.rCode=0;
            req.msg = "username_exist";
            ResponseMiddleware(req, res, next);
          }else {
            next();
          }
        /*}else{
          next();

        }*/

    }catch(ex){
      console.log(ex);
    }
  }


  const verifyOtionalTokenForAll = async (req, res, next) => {
    console.log("AuthMiddleware => verifyOtionalTokenForAll");
    let { token } = req.headers;
    console.log("token",token)

    try{
      if(token){
    console.log("token**",token)
    let payload = jwt.verify(token, serverConfig.jwtSecret);

        let user =null;
            console.log("payload")
            console.log(payload)
        if(payload.verified==true){
          if(payload.adminId) user = await AdminService().fetch(payload.adminId, false);
          else user = await UserService().fetch(payload.userId, false,"basic");
          // console.log(user);
          if(user && !user.isActive){
            throw new Error("ac_deactivated");
          }

          //checking user must exist in our DB else throwing error
          if(user) {
            if(payload.userId) {
              req.body.userId = user.id;
              req.authUser = user;
            }
            if(payload.adminId) {
              req.body.adminId = user.id;
              req.authAdmin = user;
            }
            req.body.user_type = payload.user_type;
            console.log(`USER with ID ${user.id} entered.`);

          }else throw new Error("invalid_token");
        }else throw new Error("invalid_token");
      }
      next()
    }catch(ex){
    console.log("ex",ex)
    req.msg = "invalid_token";
      if(ex.message == "ac_deactivated") req.msg = ex.message;

      req.rCode = 0;
      ResponseMiddleware(req, res, next);
    }
  }

  const checkAbusiveWord = async (req, res, next) => {
    console.log("AuthMiddleware => checkAbusiveWord");
    var profanity = require("profanity-hindi");
    try{
        console.log("req.body");
        console.log(req.body);
        let { title, description,message } = req.body;
        //if(userId){

          //var cleaned = profanity.maskBadWords(message);
          //console.log(cleaned);

          var isDirty = false;

          if(message && isDirty  == false) isDirty = profanity.isMessageDirty(message);
          if(title && isDirty  == false) isDirty = profanity.isMessageDirty(title);
          if(description && isDirty  == false) isDirty = profanity.isMessageDirty(description);

          if(isDirty==true){
            req.rCode=0;
            req.msg = "abusive_word_exist";
            ResponseMiddleware(req, res, next);
          }else {
            next();
          }
        /*}else{
          next();

        }*/

    }catch(ex){
      console.log(ex);
    }
  }

  return {
    verifyToken,
    verifyCounsellerToken,
    verifyRecruiterToken,
    checkLoginMobile,
    checkEmailToEditUser,
    checkMobileToEditUser,
    verifyAdminToken,
    verifyTokenForAll,
    verifyTokenForAllForVerification,
    checkEmailToEditSubAdmin,
    checkUsernameToEditUser,
    verifyOtionalTokenForAll,
    checkAbusiveWord
  }
}
