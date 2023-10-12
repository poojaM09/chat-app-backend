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

// const connectToDatabase = async () => {
//   try {
//     await mongoose.connect('mongodb://localhost:27017/chatapp', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Connected successfully");
//   } catch (error) {
//     console.log("Database not connected", error);
//   }
// };
// connectToDatabase();

let onlineUser = [];

io.on("connection", (socket) => {

  socket.on('login', async (data) => {
    console.log("socket ID", socket.id, data)
    if (data) { // Check if data is defined
      await userModel.findOneAndUpdate({ _id: data.toString() }, { socketid: socket.id });
    }
  });

  socket.on("add-user", async (newuserID) => {
    if (newuserID) { // Check if newuserID is defined
      await userModel.findOneAndUpdate({ _id: newuserID.toString() }, { socketid: socket.id });
      if (!onlineUser.some((user) => user.userID == newuserID)) {
        onlineUser.push({
          userID: newuserID,
          socketId: socket.id,
        });
      } else {
        let index = onlineUser.findIndex(item => item.userID == newuserID)
        onlineUser[index].socketId = socket.id;
        console.log("already added");
      }
      console.log("add-user", onlineUser, newuserID);
      io.emit("online-user", onlineUser);
    }
  });

  //send message
  socket.on("send-msg", (data) => {

    const receiver = data.to;
    const receiverSocket = onlineUser?.find((user) => user.userID == receiver);
    console.log('data', data, data.socketid, receiverSocket, 'socket.id', socket.id);

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

httpServer.listen(port, () => {
  console.log(`server running on ${port}`);
});
