const express = require("express");
const router = express.Router();

const Ctrl = require("../controllers/scrappingADBController");

router.get("/getADBProjects", Ctrl.getADBProjects);
//router.get("/putAFDBProjects", Ctrl.putADBProjects);
module.exports = router;