const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(cors());
io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit("connection", "user connected");
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    io.emit("chat message", msg);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    //   io.emit('disconnection','user disconnected')
    socket.emit("dis", "disconn");
  });
});
server.listen(3003, () => {
  console.log("listening on *:3003");
});
