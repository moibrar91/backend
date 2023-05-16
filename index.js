const express = require('express');
const path = require("path");
const server = require('./config/server');
var cors = require('cors')
const fs = require("fs");
const https = require('https');
let pKeyPath = '/etc/ssl/certs/ssl-cert-snakeoil.pem';
let cPath = '/etc/ssl/certs/ca-certificates.crt';
const PORT = server.port || 4000;
const app = express();
var bodyParser = require('body-parser')
process.env.TZ = "Asia/Calcutta";

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use(cors());
app.use("/api", require("./src/routes"));


/*if(fs.existsSync(pKeyPath) && fs.existsSync(cPath)) {
  var options = {
    key: fs.readFileSync(pKeyPath),
    cert: fs.readFileSync(cPath),
  };
  
  https.createServer(options, app).listen(PORT, function(){
    console.log("Xaphel HTTPS on " + PORT);
  //require('./src/models')(app);
  });
} else {
  app.listen(PORT, function(err, success) {
     console.log("Xaphel HTTP ON " + PORT);
  //require('./src/models')(app);
  });
}*/

const http = require('http');
const socket = http.createServer(app);
// Socket http://13.234.189.253:4042
var io = require('socket.io')(8801,{
  cors: {
    origin: "*",
  },
});
global.io = io;
app.set(io);

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  // console.log("socket connection started");
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to :", receiverId)
    console.log("Data: ", data)
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });

  socket.on('notification', (data) => {
    io.emit('notification', data);
  });
});


socket.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
  //require('./src/models')(app);
});
