const express = require("express");
const router = express.Router();

const statusCtrl = require("../controllers/statusController");

//return the list of test items
router.get("/", statusCtrl.index);
//insert new test item
router.post("/", statusCtrl.add);

module.exports = router;
