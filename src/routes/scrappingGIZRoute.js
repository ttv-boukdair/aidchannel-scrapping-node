const express = require("express");
const router = express.Router();

const Ctrl = require("../controllers/scrappingGIZController");

router.get("/getGIZProjects", Ctrl.getProjects);
module.exports = router;