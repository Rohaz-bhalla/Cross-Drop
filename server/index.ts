import express from "express";
import http from "http";
import path from "path";
import socket from "socket.io";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server,{
  cors: { origin : "*" }
});

try {
  io.on("connection", (socket) => {
    socket.on("join-room", (roomID) => {
      socket.join(roomID);
      console.log(`User ${socket.id} joined room ${roomID}`);
    });

    socket.on("send-message", (data) => {
      io.to(data.roomID).emit("receive-message", data);
    });

    socket.on("Disconnect", () => {
      console.log("User Disconnected",)
    } )

  });
} catch (error: any) {
  console.error("There was an error in making connection", error);
}

const users = {};

const socketToRoom = {};

server.listen(8080, () => {
  console.log("Server is running at http://localhost8080");
});
