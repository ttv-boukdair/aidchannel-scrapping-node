const express = require("express");
const router = express.Router();

const Ctrl = require("../controllers/multimediaAPIController");

router.get("/addvideos", Ctrl.addYTVideos);
router.get("/getvideos", Ctrl.getYTVideos);
// router.get("/putvideos", Ctrl.putYTVideos);

module.exports = router;
