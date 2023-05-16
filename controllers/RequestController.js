const { Op } = require("sequelize");
const Sequelize = require('sequelize');
const RequestService = require("../services/RequestService");
const UserService = require("../services/UserService");
const helpers = require("../util/helpers");
const config = require("../../config/server");

// const bbb = require('s-bigbluebutton');
// const randomstring = require("randomstring");
// let api = bbb.api(
//   config.BBB_BACKEND_URL, 
//   config.BBB_SECRET_KEY
// )

var cron = require('node-cron');
var axios = require("axios").default;
const cashfree_url = "https://test.cashfree.com";
//const cashfree_url = "https://api.cashfree.com";

cron.schedule('* * 9,18 * *', async () => {
  console.log('running a task ');
  let query = { isActive: true, status: { [Op.in]: ["0", "1"] }, createdAt: { [Op.lt]: new Date(Date.now() - (48 * 60 * 60 * 1000)) } }

  let request = await RequestService().requestList(query);
  let request_id = await request ? request.map(a => a.id) : [];
  if (request_id.length > 0) {
    let update_query = { "id": { [Op.in]: request_id } };
    let update_result = await RequestService().updateRequest(update_query, { isActive: false });
  }
});
module.exports = () => {

  const addRequest = async (req, res, next, transaction) => {
    console.log("RequestController => addRequest");
    let { user_id, service_id, note, price, wallet_amount, userId, transaction_id } = req.body;

    let request_data = { userId: user_id, service_id, note, price, wallet_amount, studentId: userId };

    let add_result = await RequestService().addRequest(request_data, transaction);
    if (wallet_amount) {
      console.log('inside wallet_amount');
      let update_user_wallet = await UserService().updateProfile(userId, { wallet_amount: Sequelize.literal('wallet_amount -' + wallet_amount) }, transaction);
      let wallet_transaction = await UserService().addUserWalletPayment({ userId, date: new Date(), amount: "-" + wallet_amount, transaction_id }, transaction);
    }
    
    let userDetails = await UserService().fetchByQuery({ id: user_id }, transaction, "basic");


    if (userDetails) {

      if (userDetails.notification_permission == "allow") {

        let msg = req.authUser.first_name + " sent you a request for meeting";
        let title = "Service Request";
        let data = { title, body: msg, request_id: add_result.id }

        let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
      }
    }
    let request_details = await RequestService().fetchRequestByQuery({ id: add_result.id }, transaction, "withUserDetails");
    req.rData = { request_details };
    next();

  }

  const addRequestDetails = async (req, res, next, transaction) => {
    console.log("RequestController => addRequestDetails");
    let { request_id, meeting_link, time_slots, userId } = req.body;
    try {
      if (time_slots) time_slots = JSON.parse(time_slots.replace(/\\/g, ""));
    } catch (e) {

    }
    let valid_user = await RequestService().fetchRequestByQuery({ id: request_id, userId }, transaction);
    if (valid_user) {
      let request_data = { meeting_link, status: "1" };
      let time_slot_result = [];
      let add_result = await RequestService().updateRequest({ id: request_id }, request_data, transaction);
      if (time_slots.length > 0) time_slot_result = await saveRequestTimeSlots(time_slots, request_id, "teacher", transaction)
      if (time_slot_result.length > 0) delete_result = await RequestService().removeRequestTimeSlot({ request_id, id: { [Op.notIn]: time_slot_result } }, transaction);
      let request_details = await RequestService().fetchRequestByQuery({ id: request_id }, transaction, "withStudentDetails");
      let userDetails = await UserService().fetchByQuery({ id: request_details.studentId }, transaction, "basic");

      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " accepted your request and add time slots for meeting.";
          let title = "Service Request";
          let data = { title, body: msg, request_id }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }

      req.rData = { request_details };
    } else {
      req.msg = "unauthorized"
      req.rCode = 0;

    }
    next();

  }

  const addRequestTimeSlots = async (req, res, next, transaction) => {
    console.log("RequestController => addRequestDetails");
    let { request_id, time_slots, user_type, userId } = req.body;
    try {
      if (time_slots) time_slots = JSON.parse(time_slots.replace(/\\/g, ""));
    } catch (e) {

    }
    let query = user_type == "student" ? { id: request_id, studentId: userId } : { id: request_id, userId };
    let valid_user = await RequestService().fetchRequestByQuery(query, transaction);
    if (valid_user) {
      let time_slot_user_type = user_type == "student" ? "student" : "teacher";
      let time_slot_result = [];
      if (time_slots.length > 0) time_slot_result = await saveRequestTimeSlots(time_slots, request_id, time_slot_user_type, transaction)
      if (time_slot_result.length > 0) delete_result = await RequestService().removeRequestTimeSlot({ request_id, id: { [Op.notIn]: time_slot_result }, added_by: time_slot_user_type }, transaction);
      let scope = user_type == "student" ? "withUserDetails" : "withStudentDetails";
      let request_details = await RequestService().fetchRequestByQuery({ id: request_id }, transaction, scope);
      let notification_user_id = user_type == "student" ? request_details.userId : request_details.studentId;

      let userDetails = await UserService().fetchByQuery({ id: request_details.studentId }, transaction, "basic");

      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " added time slots for meeting.";
          let title = "Service Request";
          let data = { title, body: msg, request_id }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }

      req.rData = { request_details };
    } else {
      req.msg = "unauthorized"
      req.rCode = 0;

    }
    next();

  }

  const acceptTimeSlot = async (req, res, next, transaction) => {
    console.log("RequestController => acceptTimeSlots");
    let { request_id, time_slot_id, user_type, userId } = req.body;
    let query = user_type == "student" ? { id: request_id, studentId: userId } : { id: request_id, userId };
    let valid_user = await RequestService().fetchRequestByQuery(query, transaction);
    if (valid_user) {
      let request_data = { status: "2" }
      let update_result = await RequestService().updateRequest({ id: request_id }, request_data, transaction);

      // let update_meeting = await createMeetingByTeacher({ id: request_id }, request_data, transaction);
      let update_time_result = await RequestService().updateRequestTimeSlot({ id: time_slot_id }, { isSelected: "1" }, transaction);
      let scope = user_type == "student" ? "withUserDetails" : "withStudentDetails";
      let request_details = await RequestService().fetchRequestByQuery({ id: request_id }, transaction, scope);
      let notification_user_id = user_type == "student" ? request_details.userId : request_details.studentId;

      let userDetails = await UserService().fetchByQuery({ id: request_details.studentId }, transaction, "basic");

      if (userDetails) {

        if (userDetails.notification_permission == "allow") {

          let msg = req.authUser.first_name + " accepted the time slot for meeting.";
          let title = "Service Request";
          let data = { title, body: msg, request_id }

          let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
        }
      }

      req.rData = { request_details };
    } else {
      req.msg = "unauthorized"
      req.rCode = 0;

    }
    next();

  }

  // const createMeetingByTeacher = async(name, request_id, service_id) => {
  //   return new Promise(async function (resolve, reject) {
  //     var timestamp = Math.floor(new Date().getTime() / 1000);
  //     let id = `${timestamp}_${randomstring.generate(6)}`;
  //     let attendeePW = `${timestamp}_${randomstring.generate(6)}`;
  //     let moderatorPW = `${timestamp}_${randomstring.generate(6)}`;
  //     console.log("meeting id ", id);
  //     console.log("meeting attenpw ", attendeePW);
  //     console.log("meeting modpw ", moderatorPW);
  //     let meeting_link = api.meetings.createMeeting(name, id, {
  //         attendeePW: attendeePW,
  //         moderatorPW: moderatorPW,
  //         allowStartStopRecording: true,
  //         autoStartRecording: false,
  //         record : true,
  //     })

  //     console.log("createNewMeeting",meeting_link);
  //     let data = {userId, meetingId:id, service_id, request_id, meetingName:name, meeting_link, studentPW:attendeePW, moderatorPW};
  //     let meeting_details = await RequestService().createMeeting(data, transaction);
  //     if (meeting_details) resolve(true);
  //   })
    
  // }


  const saveRequestTimeSlots = async (data, request_id, added_by, transaction) => {
    let ids = [];
    for (const item of data) {
      let { date, time } = item;
      let slot_info = { request_id, date, time, added_by };
      let result = await RequestService().addRequestTimeSlot(slot_info, transaction);
      ids.push(result.id)
    }
    return ids;
  }

  const requestList = async (req, res, next, transaction) => {
    console.log("RequestController=>requestList");
    let { userId } = req.body;
    let { search, page, limit, status } = req.query;

    let scope = req.authUser.user_type == "student" ? "withUserDetails" : "withStudentDetails";
    let filters = req.authUser.user_type == "student" ? { search, page, limit, status, studentId: userId } : { search, page, limit, status, userId };
    let request = await RequestService().requestList(filters, transaction, scope);
    // let requestss;
    if ( req.authUser.user_type == "student"){
      request = await fecthMoreCounsellorDetails(request, transaction)
      
    }else{
      request = await fecthMoreUserDetails(request, transaction)
    }
    // console.log("resss", request);
    req.rData = {  request };
    next();

  }

  const fecthMoreUserDetails = async (data, transaction) => {
    console.log("fecthMoreUserDetails=> requestList");
    let requestData = [];
    
    for(const item of data){
      let { id, userId, wallet_amount, isActive,studentDetails, meeting_link, meetingDetails, userDetails, note, price, recorded_video_link, selectedTimeSlot,serviceDetails, service_id, status,studentId,studentTimeSlots,teacherTimeSlots } = item;
      // console.log("item", item.studentId);
      let student_work_exp = await UserService().fetchAllStudentWorkExperience({student_id:item.studentId}, transaction)
      // console.log("student_work_exp", student_work_exp.length);

      requestData.push({ id, userId, wallet_amount, isActive, meeting_link, studentDetails, meetingDetails, userDetails, note, price, recorded_video_link, selectedTimeSlot,serviceDetails, service_id, status,studentId,studentTimeSlots,teacherTimeSlots, student_work_exp:[...student_work_exp] })
    }
    return requestData
    // let student_work_exp = await UserService.fetchStudentWorkExperience({student_id:userId})
  }

  const fecthMoreCounsellorDetails = async (data, transaction) => {
    console.log("fecthMoreUserDetails=> requestList");
    let requestData = [];
    
    for(const item of data){
      let { id, userId, wallet_amount, isActive, studentDetails, meeting_link, meetingDetails, userDetails, note, price, recorded_video_link, selectedTimeSlot,serviceDetails, service_id, status,studentId,studentTimeSlots,teacherTimeSlots } = item;

      let cousellor_more_details = await UserService().fetchCounsellerDetails({user_id:item.userId}, transaction)
      // console.log("student_work_exp", student_work_exp.length);

      requestData.push({ id, userId, wallet_amount, isActive, meeting_link, studentDetails, meetingDetails, userDetails, note, price, recorded_video_link, selectedTimeSlot,serviceDetails, service_id, status,studentId,studentTimeSlots,teacherTimeSlots, cousellor_more_details })
    }
    return requestData
    // let student_work_exp = await UserService.fetchStudentWorkExperience({student_id:userId})
  }

  const requestDetails = async (req, res, next, transaction) => {
    console.log("RequestController=>requestDetails");
    let { userId } = req.body;
    let { request_id } = req.query;
    let scope = req.authUser.user_type == "student" ? "withUserDetails" : "withStudentDetails";
    let request_details = await RequestService().fetchRequestByQuery({ id: request_id }, transaction, scope);

    req.rData = { request_details };
    next();

  }

  const rejectRequest = async (req, res, next, transaction) => {
    console.log("AdminController => rejectRequest");
    let { userId, request_id } = req.body;
    let data = { status: "3" };
    let update_result = await RequestService().updateRequest({ id: request_id }, data, transaction);
    let request_details = await RequestService().fetchRequestByQuery({ id: request_id }, transaction);
    let wallet_amount = request_details.price;
    let update_user_wallet = await UserService().updateProfile(request_details.studentId, { wallet_amount: Sequelize.literal('wallet_amount +' + wallet_amount) }, transaction);
    let wallet_transaction = await UserService().addUserWalletPayment({ userId:request_details.studentId, date: new Date(), amount: "+" + wallet_amount }, transaction);
    
    let userDetails = await UserService().fetchByQuery({ id: request_details.studentId }, transaction, "basic");
    if (userDetails) {

      if (userDetails.notification_permission == "allow") {

        let msg = req.authUser.first_name + " rejected your request for meeting";
        let title = "Service Request";
        let data = { title, body: msg, request_id }

        let notification_result = helpers().sendNotification(userDetails.device_token, userDetails.device_type, title, msg, data, userDetails.id)
      }
    }
    next();
  }

  const completeRequest = async (req, res, next, transaction) => {
    console.log("AdminController => completeRequest");
    let { userId, recorded_video_link, request_id } = req.body;
    console.log("userId", userId);
    let data = { recorded_video_link, status: "4" };
    let update_result = await RequestService().updateRequest({ id: request_id, userId }, data, transaction);
    let request_details = await RequestService().fetchRequestByQuery({ id: request_id , userId}, transaction);
    console.log('price',request_details);
    let price = request_details.price;
    let admin_percentage = 0.20;
    let counseller_amount = (price*0.80).toFixed(2)
    let admin_amount = (price*admin_percentage).toFixed(2)
    console.log('admin_amount', admin_amount, " and c_a ", counseller_amount);
    // update counseller wallet 
    let user = await UserService().fetchByQuery({id: userId}, transaction, "basic");
    console.log("user", user.wallet_amount);
    console.log("before update", Sequelize.literal('wallet_amount +' + counseller_amount));
    console.log(user.wallet_amount !="0 ", " one", user.wallet_amount != "null"," two ", user.wallet_amount != "undefind");
    let update_user_wallet = await UserService().updateProfile(userId, { wallet_amount: Sequelize.literal('wallet_amount +' + counseller_amount) }, transaction);
    // if(user.wallet_amount !="0 "|| user.wallet_amount != "null" || user.wallet_amount != "undefind"){
    //   console.log("not null and zero",user.wallet_amount);
    //   let update_user_wallet = await UserService().updateProfile(userId, { wallet_amount: Sequelize.literal('wallet_amount +' + counseller_amount) }, transaction);
    // }
    // else{
    //   console.log("else null and zero",user.wallet_amount);
    //   let update_user_wallet = await UserService().updateProfile(userId, { wallet_amount: counseller_amount}, transaction);
    // }
    
    // console.log("wallet amount", update_user_wallet);
    let wallet_transaction = await UserService().addUserWalletPayment({ userId: request_details.userId, date: new Date(), amount: counseller_amount }, transaction);
    let admin_earning = await UserService().addAdminEarning({ requestId:request_id, amount:admin_amount }, transaction);

    next();
  }

  const requestListForAdmin = async (req, res, next, transaction) => {
    console.log("RequestController=>requestListForAdmin");
    let { adminId } = req.body;
    let { search, page, limit, status } = req.query;

    let scope = "withAllDetails";
    let filters = { search, page, limit, status };
    let request = await RequestService().requestList(filters, transaction, scope);
    let total_request = await RequestService().countRequest({}, transaction);
    let total_active_request = await RequestService().countRequest({ isActive: 1 }, transaction);
    let total_inactive_request = await RequestService().countRequest({ isActive: 0 }, transaction);
    req.rData = { total_request, total_active_request, total_inactive_request, request };
    next();

  }

  const addAdminResponse = async (req, res, next, transaction) => {
    console.log("AdminController => completeRequest");
    let { status, request_id } = req.body;
    let data = { isActive: status };
    let update_result = await RequestService().updateRequest({ id: request_id }, data, transaction);

    next();
  }

  const removeRequest = async (req, res, next, transaction) => {
    console.log("AdminController => removeRequest");
    let { request_id } = req.body;
    let update_result = await RequestService().removeRequest({ id: request_id }, transaction);

    next();
  }
  const updatePaymentDetails = async (req, res, next, transaction) => {
    console.log("AdminController => removeRequest");
    let { userId, wallet_amount } = req.body;
    let update_user_wallet = await UserService().updateProfile(userId, { wallet_amount: Sequelize.literal('wallet_amount +' + wallet_amount) });
    next();
  }

  const generateCashFreeToken = async (req, res, next, transaction) => {
    let { orderAmount, orderCurrency, orderNote, userId } = req.body;
    console.log("client_url",config.CLIENT_URL);
    console.log("token_order",req.query.order_token);
    console.log("server_url",config.SERVER_URL);
    let mobileNumber;
    let { countryCode, mobile, email, first_name, last_name } = req.authUser;
    let exist = await UserService().getStudentContactDetails({ studentId: userId }, transaction);
    console.log('exiat',exist);
    if(exist){
      mobileNumber = exist.mobile
      console.log(req.authUser);
      let customerName = `${first_name} ${last_name}`;
      var rendom_bookingOrderid = ""
      var date = new Date();
      var components = [
        date.getYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      ];
      var rendom_bookingOrderid = components.join("");
      /*var data = {
        orderId: "order_" + rendom_bookingOrderid,
        orderAmount: orderAmount,
        orderCurrency: orderCurrency
      }*/

      var data = {
        "customer_details": { "customer_id": String(userId), "customer_name": customerName, "customer_email": email, "customer_phone": String(mobileNumber|| 1111111111) },
        "order_meta": { return_url: config.SERVER_URL, notify_url: null, payment_methods: null },
        "order_id": "order_" + rendom_bookingOrderid, "order_amount": orderAmount, "order_currency": orderCurrency, "order_note": orderNote
      }
      console.log("config", config)
      console.log("data", data)

      var Object_data = {
        method: 'POST',
        url: config.CASHFREE_URL_PROD,
        headers: {
          "Accept": " application/json",
          "Content-Type": " application/json",
          "x-api-version": " 2022-01-01",
          'x-client-id': config.CASHFREE_APPID_PROD,
          //"env": 'PRODUCTION',
          'x-client-secret': config.CASHFREE_SECRETKEY_PROD
        },
        data: JSON.stringify(data)
      };
      let order_Details = await callAxios(Object_data);
      console.log("order_Details", order_Details.data)
      // if(order_Details){
      //   let wallet_amount = order_Details.data.order_amount;
      //   let update_user_wallet = await UserService().updateProfile(userId, { wallet_amount: Sequelize.literal('wallet_amount +' + wallet_amount) }, transaction);
      // }
      //order_Details.data.tokenData = order_Details.data.cftoken;
      //delete order_Details.data.cftoken, delete data.returnUrl, delete data.notifyUrl,delete data.status,delete data.message;
      order_Details.data = {
        tokenData: order_Details.data.cftoken,
        payment_link: order_Details.data.payment_link,
        orderId: "order_" + rendom_bookingOrderid,
        orderAmount: orderAmount,
        orderCurrency: orderCurrency,
        orderNote: orderNote,
        customerEmail: email,
        customerName: customerName,
        customerPhone: mobileNumber,
      };
      req.rData = { data: order_Details.data };
      next();

    }else{
      req.rData={};
      req.rCode=0;
      req.customMsg="Please add mobile number"
      // req.message = "Please add mobile number"
      next()
    }
  }


  //payment Handle Response
  const paymentHandleResponse = async (req, res) => {
    try {
      console.log("payment return url");
      var { order_id, order_token } = req.query;
      console.log("order_token pay",order_token);
      console.log('payment client_url',config.CLIENT_URL);
      //url = url+"?data="+data+"&message="+msg;
      //let data = { userId:"15", orderId, amount, transactionId, request_id };
      //let update_result = await RequestService().savePaymentDetails(data, transaction);
      var Object_data = {
        method: 'GET',
        url: config.CASHFREE_URL_PROD+"/" + order_id,
        headers: {
          "Accept": " application/json",
          "Content-Type": " application/json",
          "x-api-version": " 2022-01-01",
          'x-client-id': config.CASHFREE_APPID_PROD,
          'x-client-secret': config.CASHFREE_SECRETKEY_PROD
        }
      };
      let order_Details = await callAxios(Object_data);
      console.log("order_Details pay", order_Details.data);
      let customerEmail = order_Details.data.customer_details.customer_email;
      let userId = order_Details.data.customer_details.customer_id;
      let token;
      if(customerEmail){
        let user = await UserService().getOTPAndToken({ email: customerEmail });
        token = user.token;
        console.log("validToken",token);

      }
      if(order_Details.data.order_status == 'PAID'){
        let wallet_amount = order_Details.data.order_amount;
        // let user = await UserService().fetchByQuery({email: customerEmail}, transaction);
        // let userId = user.id;
        let update_user_wallet = await UserService().updateProfile(userId, { wallet_amount: Sequelize.literal('wallet_amount +' + wallet_amount) });
        let customer_name = order_Details.data.customer_details.customer_name;
        let customerNumber = order_Details.data.customer_details.customer_phone;
        let paid_amount = order_Details.data.order_amount;
        let payment_status = order_Details.data.order_status;
        let orderNote = order_Details.data.order_note;
        let order_currency = order_Details.data.order_currency;
        let saphalMail = 'help@xaphal.com';
        let saphalMeMail = 'premsing2006@gmail.com';
        let html = "Dear " + customer_name + ",<br><br><h3>Your Payment Is Successfull</h3>.<br> <ul><li> Customer Name: "
                    +customer_name+
                    "</li><li>Customer Email: "+ customerEmail+ "</li><li>Customer Number: "+customerNumber +
                    "</li><li>Customer Note: "+ orderNote+ "</li><li>Order Currency: "+order_currency +
                     "</li><li>Order Amount: "+paid_amount + "</li><li>Payment Status : "+payment_status +
                    "</li></ul> <br>If you have any queries feel free to contact us on "+ saphalMail +". Our team will get back to you shortly.<br><br>Regards,<br>Xaphal"

        let result = await helpers().sendEmail(customerEmail, "Xaphal Receipts", html);   
        let result_ = await helpers().sendEmail(saphalMail, "Xaphal Receipts", html);   
        let result__ = await helpers().sendEmail(saphalMeMail, "Xaphal Receipts", html);   
      }
      // res.redirect(config.CLIENT_URL + "?order_id=" + order_id + "&order_token=" + order_token);
      res.redirect(config.CLIENT_URL + "?order_id=" + order_id + "&token=" + token);
      console.log("payCash");
    } catch (error) {
      var code = 500;
      if (typeof error.code !== "undefined")
        code = error.code;
      return res.status(code).json({ error_code: 1, message: error.message });

    }
  }

  //getOrderDetails
  const getOrderDetails = async (req, res, next, transaction) => {
    var { order_id } = req.params;
    console.log('get order_details',order_id);
    var Object_data = {
      method: 'GET',
      url: config.CASHFREE_URL_PROD+"/" + order_id,
      headers: {
        "Accept": " application/json",
        "Content-Type": " application/json",
        "x-api-version": " 2022-01-01",
        'x-client-id': config.CASHFREE_APPID_PROD,
        'x-client-secret': config.CASHFREE_SECRETKEY_PROD
      }
    };
    let order_Details = await callAxios(Object_data);
    console.log("order_Details**", order_Details.data.customer_details.customer_email);
    
    req.rData = { data: order_Details.data };
    next();

  }

  const callAxios = async (options) => {
    return new Promise(async (resolve, reject) => {
      await axios.request(options).then(resolve).catch(reject);
    });
  }
  const savePaymentDetails = async (req, res, next, transaction) => {
    console.log("AdminController => savePaymentDetails");
    let { userId, orderId, amount, transactionId, request_id } = req.body;
    let data = { userId, orderId, amount, transactionId, request_id };
    let update_result = await RequestService().savePaymentDetails(data, transaction);
    next();
  }

  const paymentList = async (req, res, next, transaction) => {
    console.log("RequestController=>paymentList");
    let { userId } = req.body;
    let { search, page, limit, status } = req.query;

    let scope = "withUserDetails";
    let filters = { search, page, limit, status, userId };
    let request = await RequestService().paymentList(filters, transaction);
    req.rData = { request };
    next();

  }

  return {

    addRequest,
    addRequestDetails,
    addRequestTimeSlots,
    acceptTimeSlot,
    requestList,
    requestDetails,
    rejectRequest,
    completeRequest,
    requestListForAdmin,
    addAdminResponse,
    removeRequest,
    generateCashFreeToken,
    savePaymentDetails,
    paymentHandleResponse,
    getOrderDetails,
    paymentList,
    updatePaymentDetails
  }
}
