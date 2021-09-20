const express = require("express");
const router = express.Router();

const Ctrl = require("../controllers/scrappingAFDController");

router.get("/getAFDProjects", Ctrl.getAFDProjects);

module.exports = router;