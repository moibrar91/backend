const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const BbbService = require("../services/BbbService");
const serverConfig = require("../../config/server.json");
const RequestService = require("../services/RequestService");
const UserService = require("../services/UserService");
const bbb = require("s-bigbluebutton");
var cron = require("node-cron");
const moment = require("moment");
const randomstring = require("randomstring");
let api = bbb.api(serverConfig.BBB_BACKEND_URL, serverConfig.BBB_SECRET_KEY);

// 1:15 meeting should be close  get all pending meeting today and check time with current

cron.schedule("10 * * * *", async (transaction) => {
  console.log("running a task cancel meeting started after 75");
  let scope = "withMeetingDetails";
  let query = { isActive: true, status: "2" };
  let request = await RequestService().requestList(query, transaction, scope);
  if (request.length > 0) {
    for (const item of request) {
      let current = moment(new Date());
      let momentDate = moment(item.selectedTimeSlot.date);
      var hourToCheck = moment(item.selectedTimeSlot.time, "hh:mm:ss").hours();
      var MinuteToCheck = moment(
        item.selectedTimeSlot.time,
        "hh:mm:ss"
      ).minutes();
      var startTime = momentDate.hour(hourToCheck).minute(MinuteToCheck);
      var durationInMinutes = current.diff(startTime, "minutes");
      if (durationInMinutes > 75) {
        let update_data = {
          isMeetingActive: 0,
          isMeetingRunning: "3",
          cancelledMeetingTime: moment().format("HH:mm:ss"),
        };
        let query = { meetingId: item.meetingDetails.meetingId };
        let update_meeting_details = await BbbService().updateMeeting(
          query,
          update_data,
          transaction
        );
        let data = { status: "3" };
        let update_result = await RequestService().updateRequest(
          { id: item.id, userId: item.userId },
          data,
          transaction
        );

        console.log("studentId ", item.studentId);
        console.log("requested amount ", item.wallet_amount);

        let user = await UserService().fetchByQuery(
          { id: item.studentId },
          transaction,
          "basic"
        );
        console.log("user", user.wallet_amount);
        console.log(
          "before update",
          Sequelize.literal("wallet_amount +" + item.wallet_amount)
        );

        let update_user_wallet = await UserService().updateProfile(
          user.id,
          {
            wallet_amount: Sequelize.literal(
              "wallet_amount +" + item.wallet_amount
            ),
          },
          transaction
        );
      }
    }
  }
});

// */2 * * * * every two minutes

// cron.schedule("30 * * * *", async () => {
//   console.log("it runs task on every half an hour 30 * * * *");
//   let query = { meetingType: "Festival", isMeetingRunning: "4" };
//   let get_meeting_info = await BbbService().getMeetingAllDetails(query);

//   console.log(" lll ", get_meeting_info.length);

//   if (get_meeting_info.length > 0) {
//     console.log("ggggggg");
//     for (let i = 0; i<get_meeting_info.length; i++) {
//       console.log(get_meeting_info[i].isMeetingRunning == "4" && !get_meeting_info[i].isRecordedMeetingActive, "hanumanji");
//       if (get_meeting_info[i].isMeetingRunning == "4" && !get_meeting_info[i].isRecordedMeetingActive) {
//         console.log("raaa", get_meeting_info[i].meetingId);
//         let recorded_link = await api.recording.getRecordings({
//           meetingID: get_meeting_info[i].meetingId,
//         });
//         console.log(recorded_link);
//         let meetingLinks = await api
//           .httpClientCall(recorded_link)
//           .then((result) => {
//             // console.log("http response", result);
//             return result;
//           });

//         let meetingUrl = meetingLinks.recordings[0];
//         meetingUrl = meetingUrl ? meetingUrl.playback : null;
//         meetingUrl = meetingUrl ? meetingUrl.format : null;
//         let recordedId = meetingLinks.recordings[0];

//         let update_data = {
//           recorded_meeting_link: meetingUrl ? meetingUrl.url : null,
//           recordID: recordedId ? recordedId.recordID : null,
//           isRecordedMeetingActive: meetingUrl ? "1" : "0",
//         };
//         console.log("uuuuuuu", update_data);
//         let query = {id:get_meeting_info[i].id, meetingId: get_meeting_info[i].meetingId };
//         console.log("query", query);
//         let update_meeting_details = await BbbService().updateMeeting(
//           query,
//           update_data
//         );

//         console.log(update_meeting_details);
//       }else{
//         console.log("noooooooo");
//       }
//     }
//   }
// });

module.exports = () => {
  const createNewMeeting = async (req, res, next, transaction) => {
    let { name, userId, counsellorId, request_id } = req.body;
    var timestamp = Math.floor(new Date().getTime() / 1000);
    let id = `${timestamp}_${randomstring.generate(6)}`;
    let attendeePW = `${timestamp}_${randomstring.generate(6)}`;
    let moderatorPW = `${timestamp}_${randomstring.generate(6)}`;
    console.log("meeting id ", id, " user ", userId);
    console.log("meeting attenpw ", attendeePW);
    console.log("meeting modpw ", moderatorPW);
    let meeting_link = await api.meetings.createMeeting(name, id, {
      attendeePW: attendeePW,
      moderatorPW: moderatorPW,
      allowStartStopRecording: true,
      autoStartRecording: false,
      record: true,
      meta_endCallbackUrl: `${serverConfig.BBB_END_MEETING_URL}?meetingId=${id}&userId=${counsellorId}&request_id=${request_id}&type=normal&isMeetingRunning=4`,
      "meta_bbb-recording-ready-url": `${serverConfig.BBB_RECORDED_MEETING_URL}?meetingId=${id}&status=1`,
      // welcome : "hello everyone this is test meeting"
    });

    console.log("createNewMeeting", meeting_link);
    // userId = 70;
    // service_id=4;
    // request_id = 417;
    let data = {
      userId: counsellorId,
      meetingId: id,
      request_id,
      meetingName: name,
      meeting_link,
      studentPW: attendeePW,
      moderatorPW,
    };
    let meeting_details = await BbbService().createMeeting(data, transaction);
    req.rData = { meeting_link, meeting_details };
    next();
  };

  const startMeetingByTeacher = async (req, res, next, transaction) => {
    let moderatorUrl;
    let { moderatorName, meeting_link, meetingId, moderatorPW } = req.body;
    console.log("req", req.body);
    // let meetingCreateUrl = `https://session.xaphal.com/bigbluebutton/api/create${meeting_link}`
    // let meetingLink = ss.meetings.joinMeeting(userName, meetingId, password, url)
    let meetingLinks = await api.httpClientCall(meeting_link).then((result) => {
      console.log("http response", result);

      moderatorUrl = api.meetings.joinMeeting(moderatorName, meetingId, {
        password: moderatorPW,
        role: "MODERATOR",
      });
      console.log("inside joinNewMeeting", moderatorUrl);
      return moderatorUrl;
    });
    let update_data = {
      isMeetingActive: 1,
      isMeetingRunning: "1",
      startMeetingTime: moment().format("HH:mm:ss"),
    };
    let query = { meetingId };
    let update_meeting_details = await BbbService().updateMeeting(
      query,
      update_data,
      transaction
    );
    console.log("meetingLinks", meetingLinks);
    req.rData = { meeting_link: meetingLinks, moderatorName, meetingId };
    next();
  };
  const joinNewMeeting = async (req, res, next, transaction) => {
    let { attendeeName, meetingId, attendeePW } = req.body;
    console.log("req", req.body);

    let meeting_link = await api.meetings.joinMeeting(attendeeName, meetingId, {
      password: attendeePW,
      role: "VIEWER",
    });
    console.log("joinNewMeeting", meeting_link);

    req.rData = { meeting_link, attendeeName, meetingId };
    next();
  };

  const endMeetingUpdateStatus = async (req, res, next, transaction) => {
    console.log("bbb Controller => ramji");
    var { userId, request_id, isMeetingRunning, type, meetingId } = req.query;
    console.log("meetingid ", meetingId);
    let data = { status: "4" };
    let update_data = {
      isMeetingActive: 0,
      isMeetingRunning: "4",
      endMeetingTime: moment().format("HH:mm:ss"),
    };
    let query = { meetingId };
    let update_meeting_details = await BbbService().updateMeeting(
      query,
      update_data,
      transaction
    );
    if (type == "normal") {
      let update_result = await RequestService().updateRequest(
        { id: request_id, userId },
        data,
        transaction
      );
      let request_details = await RequestService().fetchRequestByQuery(
        { id: request_id, userId },
        transaction
      );
      console.log("price", request_details);
      let price = request_details.price;
      let admin_percentage = 0.2;
      let counseller_amount = (price * 0.8).toFixed(2);
      let admin_amount = (price * admin_percentage).toFixed(2);
      console.log("admin_amount", admin_amount, " and c_a ", counseller_amount);
      // update counseller wallet
      let user = await UserService().fetchByQuery(
        { id: userId },
        transaction,
        "basic"
      );
      console.log("user", user.wallet_amount);
      console.log(
        "before update",
        Sequelize.literal("wallet_amount +" + counseller_amount)
      );
      console.log(
        user.wallet_amount != "0 ",
        " one",
        user.wallet_amount != "null",
        " two ",
        user.wallet_amount != "undefind"
      );
      let update_user_wallet = await UserService().updateProfile(
        userId,
        {
          wallet_amount: Sequelize.literal(
            "wallet_amount +" + counseller_amount
          ),
        },
        transaction
      );
      req.rData = { user };
    } else {
      req.rData = {};
    }
    next();
  };

  const deleteUserDetailsMeeting = async (req, res, next, transaction) => {
    console.log("UserService => deleteUserCareerInfo");
    let { id } = req.body;
    let delete_festival = await BbbService().deleteUserDetailsMeeting(
      { id },
      transaction
    );
    req.rData = {};
    next();
  };

  const getMeetingInfo = async (req, res, next) => {
    console.log("bbb Controller => recordingMeetingStatus");
    let { userId, meetingId } = req.body;
    let query = { userId, meetingId };
    let meetingID = meetingId;
    let meeting_url = await api.monitoring.getMeetingInfo(meetingID);
    console.log("meeting details");

    let get_meeting_info = await api
      .httpClientCall(meeting_url)
      .then((result) => {
        console.log("http response", result);
        return result;
      });
    // let data = { userId, meetingId, get_meeting_info };
    // let meeting = await BbbService().updateJoinMeeting(query, data);
    req.rData = { get_meeting_info };
    next();
  };

  const createNewFestival = async (req, res, next, transaction) => {
    console.log("bbb Controller => createNewFestival", req.body);
    let { festivalName, speakerName, userId, role, date, startTime, endTime } = req.body;
    var timestamp = Math.floor(new Date().getTime() / 1000);
    let id = `${timestamp}_${randomstring.generate(6)}`;
    let attendeePW = `${timestamp}_${randomstring.generate(6)}`;
    let moderatorPW = `${timestamp}_${randomstring.generate(6)}`;

    let meeting_link = await api.meetings.createMeeting(festivalName, id, {
      attendeePW: attendeePW,
      moderatorPW: moderatorPW,
      allowStartStopRecording: true,
      autoStartRecording: false,
      record: true,
      meta_endCallbackUrl: `${serverConfig.BBB_END_MEETING_URL}?meetingId=${id}&type=festival&isMeetingRunning=4`,
      "meta_bbb-recording-ready-url": `${serverConfig.BBB_RECORDED_MEETING_URL}?meetingId=${id}&status=1`,

      // "meta_bbb-recording-ready-url":`callbackurl?meetingId=122&status=1`
      // welcome : "hello everyone this is test meeting"
    });

    console.log("createNewMeeting", meeting_link);

    let data = {
      userId: null,
      meetingId: id,
      speaker: speakerName,
      meetingName: festivalName,
      meeting_link,
      studentPW: attendeePW,
      moderatorPW,
      meetingType: "Festival",
      date,
      startTime,
      endTime
    };
    let meeting_details = await BbbService().createMeeting(data, transaction);
    req.rData = { meeting_link, meeting_details };
    next();
  };

  const getMeetingDetailsInfo = async (req, res, next, transaction) => {
    console.log("bbb Controller => getMeetingDetailsInfo");
    let { limit, page } = req.query;
    console.log(limit , " limit ", page);
    console.log(typeof limit , " limit*** ", typeof page);
    // limit = 10;
    // page=1;
    // let scope = "defaultScope";
    // let query = { meetingType: "Festival" };
    // let get_meeting_info = await BbbService().getAllMeetingDetails(
    //   query,
    //   limit,
    //   page
    // );
    // let get_meeting = await BbbService().getMeetingAllDetails(query);
    let filters = { page, limit, meetingType : "Festival" };
    let festival = await BbbService().getAllFestivalList( filters);

    req.rData = { get_meeting_info: festival };
    next();
  };
  const getLatestRunningMeeting = async (req, res, next, transaction) => {
    console.log("bbb Controller => getLatestRunningMeeting");
    let currentDate = new Date()
    currentDate = moment(currentDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
    console.log(currentDate);
    // , date:currentDate
    let query = { meetingType: "Festival", isMeetingRunning:'1', isPublished:true, isMeetingActive:true };
    let get_meeting_info = await BbbService().getMeetingAllDetails(query);
    req.rData = { get_meeting_info };
    next();
  };

  const getMeetingDetailsById = async (req, res, next, transaction) => {
    console.log("bbb Controller => getMeetingDetailsById");
    let {
      meetingId,
      festivalName,
      userId,
      user_type,
      userName,
      session,
      role,
    } = req.body;
    console.log("nnnn ", festivalName, " space ", festivalName.replace('-', ' '));
    let query, moderatorName, attendeeName, studentPW, moderatorPW;
    if (role == "mentor") {
      console.log("heell", festivalName.replace('-', ' ')); // meetingName: festivalName, removed from query
      moderatorName = userName;
      moderatorPW = session;
      query = {
        meetingType: "Festival",
        meetingId,
        moderatorPW,
      };
    } else {
      console.log("kkk");
      attendeeName = userName;
      studentPW = session;
      query = {
        meetingType: "Festival",
        meetingId,
        studentPW,
      };
    }
    let get_meeting_info = await BbbService().getMeetingDetailsById(
      query,
      transaction
    );
    console.log("get_meeting_info", get_meeting_info);
    let meetingEnded = get_meeting_info ?  get_meeting_info?.isMeetingRunning == "4" : false;
    console.log(meetingEnded , "meetingEnded");
    if (! meetingEnded ) {
      let isPublishedStatus = get_meeting_info ? get_meeting_info.isPublished : 0
      if (isPublishedStatus) {
        if (role == "mentor") {
          let meetingLinks = await api
            .httpClientCall(get_meeting_info.meeting_link)
            .then((result) => {
              console.log("http response", result);

              moderatorUrl = api.meetings.joinMeeting(
                moderatorName,
                meetingId,
                {
                  password: moderatorPW,
                  role: "MODERATOR",
                }
              );
              console.log("inside joinNewMeeting", moderatorUrl);
              return moderatorUrl;
            });
          let update_data = { isMeetingActive: 1, isMeetingRunning: "1" };
          let query = { meetingId };
          let update_meeting_details = await BbbService().updateMeeting(
            query,
            update_data,
            transaction
          );
          let add_festival = {
            meetingId: get_meeting_info.id,
            meeting_id: meetingId,
            role,
          };
          let festival_details = await BbbService().createFestivalMeeting(
            add_festival,
            transaction
          );
          console.log("meetingLinks", meetingLinks);
          req.rData = {
            meeting_link: meetingLinks,
            moderatorName,
            meetingId,
            festival_details,
          };
        } else {
          let meeting_link = await api.meetings.joinMeeting(
            attendeeName,
            meetingId,
            { password: studentPW, role: "VIEWER" }
          );
          console.log("joinNewMeeting", meeting_link);

          let add_festival = {
            meetingId: get_meeting_info.id,
            meeting_id: meetingId,
            studentId: userId,
            role,
          };
          let festival_details = await BbbService().createFestivalMeeting(
            add_festival,
            transaction
          );

          req.rData = {
            meeting_link,
            attendeeName,
            meetingId,
            festival_details,
          };
        }
      } else {
        req.rCode = 0;
        req.rData = {};
        req.msg = "meeting_start_soon";
      }
    } else {
      console.log("elseee");
      req.rCode = 0;
      req.rData = {};
      req.msg = "meeting_not_exist";
    }
    next();
  };

  const deleteFestivalMeeting = async (req, res, next, transaction) => {
    console.log("UserService => deleteUserCareerInfo");
    let { id } = req.body;
    let delete_festival = await BbbService().deleteFestivalMeeting(
      { id },
      transaction
    );
    req.rData = {};
    next();
  };

  const getRequestMeetingDetails = async (req, res, next, transaction) => {
    console.log("bbb Controller => getRequestMeetingDetails");
    let scope = "withMeetingDetails";
    let query = { isActive: true, status: "2" };
    let request = await RequestService().requestList(query, transaction, scope);
    if (request.length > 0) {
      for (const item of request) {
        console.log(
          "loop",
          item.selectedTimeSlot.date,
          item.selectedTimeSlot.time
        );
        // console.log("moment ", moment().format('HH:mm:ss'));
        let current = moment(new Date());
        let momentDate = moment(item.selectedTimeSlot.date);
        // console.log("ggggg", momentDate, " ff ", typeof momentDate);
        var hourToCheck = moment(
          item.selectedTimeSlot.time,
          "hh:mm:ss"
        ).hours();
        var MinuteToCheck = moment(
          item.selectedTimeSlot.time,
          "hh:mm:ss"
        ).minutes();
        var startTime = momentDate.hour(hourToCheck).minute(MinuteToCheck);

        // var duration1 = current.diff(startTime, "hours");
        var durationInMinutes = current.diff(startTime, "minutes");
        // console.log("hour", duration1);
        // console.log("minutes", durationInMinutes);
        if (durationInMinutes > 75) {
          // console.log("durationInMinutes", durationInMinutes);
          // console.log("meetingId ", item.meetingDetails.meetingId);
          // console.log("userId ", item.userId);
          // console.log("requsetId ", item.id);

          let update_data = {
            isMeetingActive: 0,
            isMeetingRunning: "3",
            cancelledMeetingTime: moment().format("HH:mm:ss"),
          };
          let query = { meetingId: item.meetingDetails.meetingId };
          let update_meeting_details = await BbbService().updateMeeting(
            query,
            update_data,
            transaction
          );
          let data = { status: "3" };
          let update_result = await RequestService().updateRequest(
            { id: item.id, userId: item.userId },
            data,
            transaction
          );
          console.log("studentId ", item.studentId);
          console.log("requested amount ", item.wallet_amount);

          let user = await UserService().fetchByQuery(
            { id: item.studentId },
            transaction,
            "basic"
          );
          console.log("user", user.wallet_amount);
          console.log(
            "before update",
            Sequelize.literal("wallet_amount +" + item.wallet_amount)
          );

          let update_user_wallet = await UserService().updateProfile(
            user.id,
            {
              wallet_amount: Sequelize.literal(
                "wallet_amount +" + item.wallet_amount
              ),
            },
            transaction
          );
        }
      }
    }
    req.rData = { request };
    next();
  };

  const updateFestivalPublished = async (req, res, next, transaction) => {
    console.log("bbb Controller => updateFestivalPublished");
    let { meetingId } = req.body;
    // let query = { userId, meetingId };
    let update_result = await BbbService().updateMeeting(
      { id: meetingId },
      { isPublished: true, isMeetingRunning: "2", isMeetingActive: 1 },
      transaction
    );
    req.rData = { update_result };
    next();
  };

  const changeMeetingLink = async (req, res, next, transaction) => {
    console.log("bbb Controller => changedMeetingLink");
    let { meetingId, meeting_link } = req.body;
    let update_result = await BbbService().updateMeeting(
      { id: meetingId },
      { isChanged: true, meeting_link:meeting_link , isMeetingRunning: "1"},
      transaction
    );
    req.rData = { update_result };
    next();
  };

  const endMeetingBbbByAdmin = async (req, res, next, transaction) => {
    console.log("bbb Controller => endMeeting");
    let { meetingId, password } = req.body;
    let end_meeting_url = await api.meetings.endMeeting(meetingId, password);
    let end_meet_response = await api
      .httpClientCall(end_meeting_url)
      .then((result) => {
        console.log("http response", result);
        return result;
      });

    if (end_meet_response.returncode == "FAILED") {
      req.rCode = 0;
      req.rData = { end_meet_response };
    } else {
      let update_data = {
        isMeetingActive: 0,
        isMeetingRunning: "4",
        endMeetingTime: moment().format("HH:mm:ss"),
      };
      let query = { meetingId };
      let update_meeting_details = await BbbService().updateMeeting(
        query,
        update_data,
        transaction
      );
      req.rData = { end_meet_response };
    }

    next();
  };

  const recordingMeetingStatus = async (req, res, next, transaction) => {
    console.log("bbb Controller => lakshmanji");
    let { meetingId } = req.query;
    // let query = {userId, meetingId}
    let recorded_link = await api.recording.getRecordings({
      meetingID: meetingId,
    });
    console.log(recorded_link);
    let meetingLinks = await api
      .httpClientCall(recorded_link)
      .then((result) => {
        console.log("http response", result);
        return result;
      });

    let meetingUrl = meetingLinks.recordings[0];
    meetingUrl = meetingUrl ? meetingUrl.playback : null;
    meetingUrl = meetingUrl ? meetingUrl.format : null;
    let recordedId = meetingLinks.recordings[0];

    let update_data = {
      recorded_meeting_link: meetingUrl ? meetingUrl.url : null,
      recordID: recordedId ? recordedId.recordID : null,
      isRecordedMeetingActive: meetingUrl ? "1" : "0",
    };
    let query = { meetingId };
    let update_meeting_details = await BbbService().updateMeeting(
      query,
      update_data,
      transaction
    );
    let get_meeting_info = await BbbService().getMeetingDetailsById(
      query,
      transaction
    );
    req.rData = { recordedLinks: update_data , meetingLinks, get_meeting_info };
    next();
  };

  // const endMeetingStatus = async (req, res, next) => {
  //   console.log("bbb Controller => recordingMeetingStatus");
  //   let {userId, meetingId, isActive} = req.body;
  //   let query = {userId, meetingId}
  //   let data = {userId, meetingId,isActive}
  //   let meeting = await BbbService().updateJoinMeeting(query, data);
  //   req.rData = {meeting};
  //   next();
  // }

  // const createMeetingBbb = async (req, res, next, transaction) => {
  //   console.log("bbb controller => createmeeting");
  //   let {meetingId,meetingName, ModeratorPw, serviceId, requestId, userId} = req.body;
  //   let data = {userId, meetingId, serviceId, requestId, meetingName, ModeratorPw};
  //   let meeting = await BbbService().createMeeting(data, transaction);

  //   req.rData = {meeting};
  //   next();
  // }
  // const updateMeetingBbb = async (req, res, next, transaction) => {
  //   console.log("bbb controller => updatemeeting");
  //   let {meetingId,meetingName, ModeratorPw, serviceId, requestId, userId} = req.body;
  //   let data = {userId, meetingId, serviceId, requestId, meetingName, ModeratorPw};
  //   let meeting = await BbbService().updateMeeting(meetingId , data, transaction);

  //   req.rData = {meeting};
  //   next();
  // }

  // const joinMeetingBbb = async (req, res, next, transaction) => {
  //   console.log("bbb controller => joinMeetingBbb");
  //   var today = new Date();
  //   today.setHours(today.getHours() + 1);
  //   let datee = new Date(new Date().setHours(new Date().getHours() + 1))
  //   console.log("datee", datee);
  //   let getCurrH = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  //   console.log("getCurrH", getCurrH);
  //   let getTimeNow = today.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  //   console.log("getTime",getTimeNow);
  //   let {meetingId,meetingName, AttendeePW, ModeratorPw, serviceId, requestId, userId} = req.body;
  //   let data = {userId, meetingId, serviceId, requestId, meetingName, ModeratorPw, AttendeePW};
  //   let meetingLinks = api.httpClientCall(meetingCreateUrl).then((result) => {
  //     console.log(result)
  //     moderatorUrl = api.meetings.joinMeeting(moderatorName, meetingId, {password:moderatorPW, role:"MODERATOR"})
  //     attendeeUrl = api.meetings.joinMeeting(attendeeName, meetingId, {password:attendeePW, role:"VIEWER"})
  //     console.log(`Moderator link: ${moderatorUrl}\nAttendee link: ${attendeeUrl}`)
  //     let meetingEndUrl = api.meetings.endMeeting(meetingId, password)
  //     console.log(`End meeting link: ${meetingEndUrl}`)
  // })
  //   let result = await BbbService().joinMeeting(data, transaction);
  //   next();
  // }

  // const endMeetingBbb = async (req, res, next) => {
  //   console.log("bbb Controller => endMeeting");
  //   let {userId} = req.body;
  //   let query = {userId,isActive:'0'}
  //   let meeting = await BbbService().deleteMeeting(query);
  //   req.rData = {meeting};
  //   next();
  // }
  // const recordingMeetingBbb = async (req, res, next) => {
  //   console.log("bbb Controller => recordingMeetingBbb");
  //   let {userId, meetingId, isActive} = req.body;
  //   let query = {userId, meetingId}
  //   let data = {userId, meetingId,isActive}
  //   let meeting = await BbbService().updateJoinMeeting(query, data);
  //   req.rData = {meeting};
  //   next();
  // }

  return {
    createNewMeeting,
    startMeetingByTeacher,
    joinNewMeeting,
    endMeetingUpdateStatus,
    getMeetingInfo,
    createNewFestival,
    getMeetingDetailsInfo,
    getMeetingDetailsById,
    deleteFestivalMeeting,
    deleteUserDetailsMeeting,
    getRequestMeetingDetails,
    updateFestivalPublished,
    endMeetingBbbByAdmin,
    recordingMeetingStatus,
    changeMeetingLink,
    getLatestRunningMeeting
  };
};
