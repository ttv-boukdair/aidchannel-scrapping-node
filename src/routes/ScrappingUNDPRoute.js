const express = require("express");
const router = express.Router();

const Ctrl = require("../controllers/scrappingUNDPController");

router.get("/getUNDPProjects", Ctrl.getUNDPProjects);
module.exports = router;