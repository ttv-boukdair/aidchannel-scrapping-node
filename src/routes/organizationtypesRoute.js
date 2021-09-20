const express = require("express");
const router = express.Router();

const organizationtypesCtrl = require("../controllers/organizationtypesController");

//return the list of test items
router.get("/", organizationtypesCtrl.index);
//insert new test item
// router.post("/", organizationtypesCtrl.add);

module.exports = router;
