const colors = require("colors");
const messages = require("../util/messages");

module.exports = (req, res, next, customMsg = "") => {
    console.log("ResponseMiddleware => exports22", );

    const data = req.rData ? req.rData : {};
    const code = req.rCode != undefined ? req.rCode : 1;
    console.log("sss", req.customMsg == "Invalid number");
    var message;
    let checkOtpMsg = req.customMsg ? req.customMsg : ""
    if(checkOtpMsg== "Invalid number") {
        message = "Invalid Number";
    }
    else if(checkOtpMsg== "Please add mobile number") {
        message = "Please add mobile number and verify";
    }
    else{
        message = customMsg ? customMsg : req.msg ? messages()[req.msg] : "success";
    }
    

    //logging response
    console.log(colors.bgBlue(`${req.method} '${req.originalUrl}' => '${message}', Code: ${code}`));

    res.send({ code, message, data })
}
