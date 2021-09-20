const app = require("./app");
require("dotenv-flow").config();
const mongoose = require("mongoose");
const http = require("http");
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || "80");
app.set("port", port);

const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// connection to DB

mongoose.set("useCreateIndex", true);
const DATABASE = process.env.DB;
var db = mongoose
  .connect(DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true,
  })
  .then((rep) => {
    console.log("connected");
  })
  .catch((e) => {
    console.log("error");
    console.log(e);
  })
  .finally(() => console.log("DB Ready"));

const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  //const address = "0.0.0.0";
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

server.listen(port);
module.exports = server;
