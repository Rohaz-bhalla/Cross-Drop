import express from "express";
import socket from "socket.io";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from 'cors'

const app = express();
app.use(cors({ origin: "*" }));

const server = createServer(app);

const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"] // explicit methods help reduce CORS issues
  }
});

app.get("/", ( req, res ) => {
  res.send("Cross-Drop Backend is Running...!")
} )

try {

  //Runs every-time a user connects from frontend
  io.on("connection", (socket) => {

    //The frontend emits join-room with a roomID, This tells the server which group (room) this socket should join.
    socket.on("join-room", (roomID) => {
      socket.join(roomID);
      console.log(`User ${socket.id} joined room ${roomID}`);
    });

    //The frontend sends a message with { roomID, text }, Server receives it, then re-sends it to everyone in that room
    socket.on("send-message", (data) => {
      socket.to(data.roomID).emit("receive-message", data);
    });

    //Transfer file 
    //meta = { roomID, fileName, fileType }...buffer = file data (binary)
    //The backend simply forwards that to all users in the same room.
    socket.on("send-file", (meta, buffer) => {
      socket.to(meta.roomID).emit("receive-file", meta, buffer);
    });

    //Checks when a user has left
    socket.on("disconnect", () => {
      console.log("User Disconnected",)
    } )

  });

} catch (error: any) {
  console.error("There was an error in making connection", error);
}

const users = {};

const socketToRoom = {};

server.listen(8080, () => {
  console.log("Server is running at http://localhost:8080");
});
