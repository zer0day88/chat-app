import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import {
  userJoin,
  formatMessage,
  botName,
  getRoomUsers,
  userLeave,
  getCurrentUser
} from "./chat.js";
import dotenv from 'dotenv'
dotenv.config()

const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (payload) => {
    const user = userJoin({ ...payload, id: socket.id });
    socket.join(user.room);
    console.log(`user ${user.username} join room ${user.room}`);
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on('chatMessage', (msg) => {

    const user = getCurrentUser(socket.id)
    if(user){
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    }

  })
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`);
});
