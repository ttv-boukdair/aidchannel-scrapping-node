const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const youtubeCtrl = require("../controllers/youtubeController");
router.get("/VideosAccepted/:codeCountry", youtubeCtrl.getAllVideosAccepted);

// changer l'etat de validation juste pour les tests
router.get("/test", youtubeCtrl.test);
// search sur les videos youtube
router.post("/searchByChannelName", youtubeCtrl.SearchByChannelName);
router.get(
  "/videosByCountry/:codeCountry",
  youtubeCtrl.getAllVideosByCountryPagination
);
router.get(
  "/videosAcceptedByCountryLimit/:codeCountry",
  youtubeCtrl.getAcceptedVideosByCountryLimit
);
router.post("/videosOfCountry", youtubeCtrl.getVideosScrolling);
// accept video web master
router.put("/acceptVideo/:videoId", youtubeCtrl.acceptVideo);

//refuse video web master
router.put("/refuseVideo/:videoId", youtubeCtrl.refuseVideo);

router.get(
  "/numberByCodeCountry/:codeCountry",
  youtubeCtrl.getNumberVideosByCountry
);

module.exports = router;
