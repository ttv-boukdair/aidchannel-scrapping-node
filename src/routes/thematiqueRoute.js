const express = require("express");
const router = express.Router();

const thematiquesCtrl = require("../controllers/thematiqueController");

//return the list of test items
router.get("/", thematiquesCtrl.index);
//insert new test item
// router.post("/", thematiquesCtrl.add);

module.exports = router;
