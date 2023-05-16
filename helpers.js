const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const fs = require("fs");
const serverConfig = require("../../config/server");
const messages = require("./messages");
const { Op } = require("sequelize");
var FCM = require('fcm-push');
const NotificationService = require("../services/NotificationService")
var request = require('request');


module.exports = function () {
    const resp = (response, lang, m = "success", data = {}, code = 1) => {
        return response.send({
            message: messages(lang)[m],
            data,
            code
        })
    }

    const getErrorMessage = (errors) => {
        console.log("Helpers => getErrorMessage");

        try {
            console.log(errors);
            for (var key in errors) {
                let rule = errors[key]['rule'];

                let exists = messages()[rule];
                if (exists) return messages()[rule](key)['en']

                return errors[key]['message'];
            }
        } catch (ex) {
            return "Something is wrong, Please try again later !!" + ex.message;
        }
    }


    const generateOTP = (length = 6) => {
        return Math.floor(100000 + Math.random() * 900000);
    }

    const createJWT = (payload) => {
        return jwt.sign(payload, serverConfig.jwtSecret, {
            expiresIn: '30d' // expires in 30 days
        });
    }
    const hashPassword = async password => {
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(password, salt)
        return hash;
    }

    const checkPassword = async (password, hash) => {
        console.log("Helpers => checkPassword");

        let result = await bcrypt.compare(password, hash);
        return result;
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    const sendNotification = async (device_token, device_type, title, body, data = {}, userId) => {
        console.log("Helpers => sendNotification");
        var fcmServerkey = serverConfig.fcmServerkey; //put your server key here

        var fcm = new FCM(fcmServerkey);
        let notification_data = { device_token, device_type, title, body, data: JSON.stringify(data), userId, isRead: 0 };
        let result = await NotificationService().addNotification(notification_data);
        data.message_id = result.id;
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: device_token,
            //collapse_key: 'your_collapse_key',

            notification: {
                title: title,
                body: body
            },

            data: data
        }
        console.log(message);
        fcm.send(message, async function (err, response) {
            if (err) {
                console.log("Something has gone wrong!", err)
            } else {
                console.log("Successfully sent with response: ", response)
            }
        })
    }


    const getDistanceFromLatLonInKm = async (lat1, lon1, lat2, lon2) => {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    function sortArray(array, key) {
        console.log("Helpers => sortArray");

        array.sort(function (a, b) {

            return a.distance - b.distance; // for ascending order
        });

        return array;
    }



    const sendEmail = function (to, subject, html) {
        return new Promise((resolve, reject) => {
            const sgMail = require('@sendgrid/mail')
            sgMail.setApiKey(serverConfig.SENDGRID_API_KEY);


            const msg = {
                to,
                from: serverConfig.SENDGRID_SENDER,
                subject,
                html,
            };
             console.log(msg);
            sgMail.send(msg).then(resolve).catch(reject);
        })
    }



    const sendSMS = async (msg, numbers) => {
        var https = require("https");
        var axios = require("axios");
        var urlencode = require("urlencode");
        console.log("helpers => sendSMS");
        console.log("numbers", numbers);
        var apikey = serverConfig.apikey;
        msg= msg.replace(/\s+/g,'')
        var sender = serverConfig.sender;
        var number = urlencode(numbers);
        // var apikey = urlencode("MzM1Mjc1MzY1NTQzNGE1ODZmNjk2NzZmNmU0MzQ4NTc=");
        // var sender = urlencode("XAPHAL ");
        var data =
            "apikey=" +
            apikey +
            "&numbers=" +
            number +
            "&sender=" +
            sender +
            "&message=" +
            msg;

        console.log(data);
        // var options = {
        //     host: "api.textlocal.in",
        //     path: "/send?" + data,
        // };

        let result = await axios.get(`https://api.textlocal.in/send/?${data}`).then((res)=>{
            console.log("ddddd", res.data);
            return res.data;
        });
        // console.log("ddddd", result);
         return result
        // var options =
        //   "https://api.textlocal.in/send/?apikey=MzM1Mjc1MzY1NTQzNGE1ODZmNjk2NzZmNmU0MzQ4NTc=&numbers=919958385500&sender=XAPHAL&message=Hi%20x,%20your%20login%20OTP%20for%20Xaphal%20is%20x%20Team%20Xaphal";
        // var str = "";
        // callback = function (response) {
            
        //     //another chunk of data has been recieved, so append it to `str`
        //     response.on("data", function (chunk) {
        //         str += chunk;
        //     });
        //     //the whole response has been recieved, so we just print it out here
        //     response.on("end", function () {
        //         console.log("ootttp",str);
        //         ddd = str;
        //     });
        // };
        
        // console.log('hello js',)
        //  https.request(options, callback).end();
        
    }

    return {
        generateOTP,
        resp,
        getErrorMessage,
        createJWT,
        hashPassword,
        checkPassword,
        onlyUnique,
        sendNotification,
        getDistanceFromLatLonInKm,
        sortArray,
        sendEmail,
        sendSMS
    }
}
