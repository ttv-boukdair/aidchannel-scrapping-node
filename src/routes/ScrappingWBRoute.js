const express = require("express");
const router = express.Router();


const  CtrlWB= require("../controllers/scrappingWBController");


router.get("/wbpro",CtrlWB.getWBProjects );
router.get("/test",CtrlWB.test );

module.exports = router;