const fastify = require("fastify")();
const path = require("path");

fastify.register(require("fastify-websocket"));

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
});

fastify.get("/", (req, res) => {
  res.sendFile("index.html");
});

fastify.get("*", (req, res) => {
  res.sendFile(req.url);
});

fastify.get("/socket", { websocket: true }, (connection, req) => {
  connection.socket.on("message", (message) => {
    const msg = message.toString();

    // for broadcasting to each user
    fastify.websocketServer.clients.forEach(function each(client) {
      if (client.readyState === 1) {
        if (client !== connection.socket) {
          client.send(msg);
        }
      }
    });
  });
});

fastify.listen(3005, (err, message) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${message}`);
});
