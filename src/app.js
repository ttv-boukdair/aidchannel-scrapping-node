const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const expressValidator = require("express-validator");
var cron = require("node-cron");
const cookieParser = require("cookie-parser");
const app = express();

// the routes
const initRoutes = require("./routes/InitDBRoute");
const scrappingAFDBRoutes = require("./routes/ScrappingAFDBRoute");
const scrappingAIRoutes = require("./routes/ScrappingAIRoute");
const scrappingGIZRoutes = require("./routes/scrappingGIZRoute");
const scrappingUNDPRoutes = require("./routes/ScrappingUNDPRoute");
// const scrappingAFDRoutes = require("./routes/ScrappingAFDRoute");
const scrappingADBRoutes = require("./routes/ScrappingADBRoute");
const scrappingWBRoutes = require("./routes/ScrappingWBRoute");

const userRoutes = require("./routes/userRoute");
const organizationtypesRoutes = require("./routes/organizationtypesRoute");
const thematiqueRoutes = require("./routes/thematiqueRoute");
const organizationRoutes = require("./routes/organizationRoute");
const countryRoutes = require("./routes/countryRoute");
const wbroutes = require("./routes/ScrappingWBRoute");

const statusRoutes = require("./routes/statusRoute");
const projectRoutes = require("./routes/projectRoute");


const newsRoute = require("./routes/newsRoute");
const multimediaAPIRoutes = require("./routes/multimediaAPIRoute");
const tweetRoute = require("./routes/tweetsRoute");
const youtubeRoute = require("./routes/youtubeRoute");

/////////////// LINKEDIN ROUTES /////////////
// add Access-Control-Allow-Origin
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//parse json
// for parsing application/json
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(expressValidator());
app.use(cookieParser());

app.get("/", function (req, res) {
  res.send("WELCOME AIDCHANNEL Node 14");
});

app.use("/init", initRoutes);
app.use("/organizationtypes", organizationtypesRoutes);
app.use("/thematiques", thematiqueRoutes);
app.use("/organization", organizationRoutes);
app.use("/country", countryRoutes);
app.use("/status", statusRoutes);
app.use("/project", projectRoutes);

//  scrapping
app.use("/scrappingAFDB", scrappingAFDBRoutes);
app.use("/scrappingAI", scrappingAIRoutes);
app.use("/scrappingGIZ", scrappingGIZRoutes);
app.use("/scrappingUNDP", scrappingUNDPRoutes);
// app.use("/scrappingAFD", scrappingAFDRoutes);
app.use("/scrappingADB", scrappingADBRoutes);

app.use("/scrappingWB", scrappingWBRoutes);
app.use("/user", userRoutes);

app.use("/user", userRoutes);
app.use("/projects", wbroutes);
app.use("/news", newsRoute);
app.use("/multimedia", multimediaAPIRoutes);
// app.use("/IATI", scrappingIATIRoutes);

app.use("/twitter", tweetRoute);
app.use("/youtube", youtubeRoute);


const Ctrl = require("./controllers/scrappingAFDBController");
const CtrlMulti = require("./controllers/multimediaAPIController");
const CtrlIATI = require("./controllers/scrappingIATIController");
const CtrlNews = require("./controllers/scrappingNewsController");
const CtrlGIZ = require("./controllers/scrappingGIZController");
const CtrlAFDB = require("./controllers/scrappingAFDBController");
const CtrlWB = require("./controllers/scrappingWBController");
const CtrlUNDP = require("./controllers/scrappingUNDPController");
app.use("/uploads", express.static("uploads"));

//Scrapping Interruptions

// cron.schedule("* * */14 * *", function () {
//   console.log("update")
//   CtrlIATI.scrapping();
// });


  // CtrlIATI.scrappingIATI();


// if (await CtrlIATI.interrupted()) {
// CtrlIATI.scrappingIATI();}



cron.schedule("19 00 * * 1", function () {
CtrlAFDB.putAFDBProjects();}

// CtrlUNDP.getUNDPProjects();
// CtrlWB.getWBProjects();
// CtrlGIZ.getProjects();

// cron.schedule("00 00 * * *", function () {
//   console.log("update");
//   CtrlMulti.putTweets();
// });

// cron.schedule("00 00 * * *", function () {
//   console.log("update");
//   CtrlMulti.putYTVideos();
// });


// CtrlNews.addOrgArticles()


module.exports = app;
