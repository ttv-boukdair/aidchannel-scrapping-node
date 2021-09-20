const express = require("express");
const router = express.Router();

const Ctrl = require("../controllers/scrappingAFDBController");

//test get iati project
router.get("/getAFDBProjects", Ctrl.getAFDBProjects);
router.get("/putAFDBProjects", Ctrl.putAFDBProjects);
module.exports = router;
