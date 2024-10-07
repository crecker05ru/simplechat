require("dotenv").config();
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const websocketController = require("./websocket/websocketController");
const expressWsModule = require("./websocket/expressWsModule");
const wsRouter = "./routes/wsRouter";
var express = require("express");
const { send } = require("process");
const app = express();

var expressWs = require("express-ws")(app);

app.use(express.static("public"));

const PORT = process.env.WEBSOCKET_PORT;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(fileUpload({}));
app.use(express.static(path.resolve(__dirname, "static")));

let history = [];
let clients = [];
let currentClient;
let aWss = expressWs.getWss("/echo");
console.log("in main", { aWss });
app.ws("/echo", (ws, req) => {
  console.log("Socket Connected");
  ws.send(JSON.stringify(history));
  console.log("history", history);
  ws.on("message", (msg) => {
    msg = JSON.parse(msg);
    currentClient = msg.username.slice();

    if (msg.event === "message") {
      history.push(msg);
      history.slice(-100);
    }
    if (msg.event === "connection") {
      clients.push(currentClient);
    }
    console.log("clients", clients);

    aWss.clients.forEach((client) => {
      client.send(JSON.stringify(msg));
      console.log("msg", msg);
    });
  });

  ws.on("close", () => {
    console.log("WebSocket was closed");
    console.log("currentClient", currentClient);
    console.log("clients after filter", clients);
    clients.splice(clients.indexOf(currentClient), 1);
    currentClient = undefined;
  });
});

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
