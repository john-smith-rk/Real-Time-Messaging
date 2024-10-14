require('dotenv').config()
const express = require("express");
const socket = require("socket.io");
const logEvents = require('./middleware/logEvents');
const PORT = process.env.PORT || 3800;

const app = express();

app.use(logEvents.logger);

app.use(express.static('public'))

const server = app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

const io = socket(server);

const activeUsers = new Set();

io.on("connection", (socket)=>{
    console.log("Made socket connection");


    socket.on("new user", (data)=>{

        logEvents.dataLogger(data);

        socket.userId = data;
        activeUsers.add(data);
        io.emit("new user", [...activeUsers]);
    });

    socket.on("disconnect", ()=>{
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
    });

    socket.on("chat message", function(data){
        logEvents.dataLogger(socket.nick+'\t'+data.message);
        io.emit("chat message", data);
    });

    socket.on("typing", (data)=>{
        logEvents.dataLogger(socket.nick+'\t'+data.message);
        socket.broadcast.emit("typing", data);
    });
});

io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
    logEvents.dataLogger(err);
  });