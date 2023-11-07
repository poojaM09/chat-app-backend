const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require("./Routes/userRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const { Server } = require("socket.io");
const { createServer } = require("http");
const multer = require("multer");
const userModel = require("./Models/userModel");

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 5000;
const dbURL = process.env.DB_URL;

app.use(express.json());
app.use(cors({
  origin: '*'
}));
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/public", express.static("public"));
const DB = require('./database/database')

let onlineUser = [];
io.on("connection", (socket) => {

  socket.on('login', async (data) => {
    if (data) {
      await userModel.findOneAndUpdate({ _id: data.toString() }, { socketid: socket.id });
    }
  })
  socket.on('client-login', async (data) => {
    if (data) {
      await userModel.findOneAndUpdate({ _id: data.toString() }, { socketid: socket.id });
    }
  })
    socket.on('getItems', async () => {
      try {
        const items = await userModel.find({});
        socket.emit('items', items);
      } catch (err) {
        console.error(err);
      }
    });
  socket.on("add-user", async (newuserID) => {
    if (newuserID) {
      await userModel.findOneAndUpdate({ _id: newuserID.toString() }, { socketid: socket.id });
      if (!onlineUser.some((user) => user.userID == newuserID)) {
        onlineUser.push({
          userID: newuserID,
          socketId: socket.id,
        });
      } else {
        let index = onlineUser.findIndex(item => item.userID == newuserID)
        onlineUser[index].socketId = socket.id;
      }
      io.emit("online-user", onlineUser);
    }
  });
  socket.on("add-client", async (newuserID) => {
    if (newuserID) {
      await userModel.findOneAndUpdate({ _id: newuserID.toString() }, { socketid: socket.id });
      if (!onlineUser.some((user) => user.userID == newuserID)) {
        onlineUser.push({
          userID: newuserID,
          socketId: socket.id,
        });
      } else {
        let index = onlineUser.findIndex(item => item.userID == newuserID)
        onlineUser[index].socketId = socket.id;
      }
      io.emit("online-user", onlineUser);
    }
  });

  //send message
  socket.on("send-msg", (data) => {
    const receiver = data.to;
    const receiverSocket = onlineUser?.find((user) => user.userID == receiver);
    if (receiverSocket) {
      if (data.message) {
        io.to(receiverSocket.socketId).emit("msg-recieve", {
          message: data.message,
          to: data.from,
          msg_type: data.msg_type,
        });
      } else {
        io.to(receiverSocket.socketId).emit("msg-recieve", {
          attechment: data.attechment,
          to: data.from,
          msg_type: data.msg_type,
        });
      }
            io.to(receiverSocket.socketId).emit("msg-notification");
    }
  });

  socket.on("end-connection", () => {
    onlineUser = onlineUser.filter((user) => user.socketId !== socket.id);
    io.emit("online-user", onlineUser);
  });

  socket.on('disconnecting', function () {
    console.log("disconnecting")
  });

});

app.get("/api/online-users", (req, res) => {
  res.json(onlineUser);
});

httpServer.listen(port, () => {
  console.log(`server running on ${port}`);
});
