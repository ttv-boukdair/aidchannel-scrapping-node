const express = require("express");
const router = express.Router();

const Ctrl = require("../controllers/scrappingIATIController");

//test get iati project
router.get("/scrapping", Ctrl.scrapping);
module.exports = router;
