const express = require("express");
const router = express.Router();
const viewctrl = require("../../controllers/linkedin/viewController");
const requireLogin = require("../../middlewares/requireLogin");
router.get(
  "/:idProfil",

  viewctrl.getNumberProfiles
);
router.post("/",viewctrl.InsertSeen)
router.get("/profiles/:idUser", viewctrl.getAllProfiles);
module.exports = router;
