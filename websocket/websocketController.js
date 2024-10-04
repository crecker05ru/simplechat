const fs = require("fs");
exports.listen = (app) => {
  expressWs(app);
  fs.writeFile(
    "websocket/webSocket_messages.txt",
    "Здесь сообщения",
    function (error) {
      if (error) throw error; // если возникла ошибка
      console.log("Асинхронная запись файла завершена. Содержимое файла:");
      let data = fs.readFileSync("websocket/webSocket_messages.txt", "utf8");
      console.log(data); // выводим считанные данные
    }
  );

  console.log("ws module");
  let history = [];
  let clients = [];
  let currentClient;

  app.ws("/echo", (ws, req) => {
    var aWss = app.getWss("/echo");

    console.log("Socket Connected");
    // ws.send(history)
    ws.send(JSON.stringify(history));
    currentClient = aWss.clients;
    clients.push(currentClient);
    console.log("history", history);

    function broadcastMessage(message) {
      aWss.clients.forEach((client) => {
        client.send(JSON.stringify(message));
      });
    }
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
        // client.send(msg)
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
};

exports.socketWS = (app) => {
  expressWs(app);
  console.log("socket");
  app.ws("/echo", function (ws, req) {
    ws.on("message", function (msg) {
      ws.send(msg);
    });
  });
};

exports.socketExpressWS = (app, aWss) => {
  var expressWs = require("express-ws")(app);

  console.log({ expressWs });
  console.log({ app });

  console.log("in module", { aWss });
  console.log("socket");

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
};
