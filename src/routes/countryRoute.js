const express = require("express");
const router = express.Router();

const countryCtrl = require("../controllers/countryController");

//return the list of test items
router.get("/", countryCtrl.index);
// get country by code
router.get("/country_by_code/:code", countryCtrl.country_by_code);
//return the list of enabled countries
router.get("/enabled", countryCtrl.getEnabled);
router.get("/disabled", countryCtrl.getDisabled);
router.put("/enable/:idCountry", countryCtrl.enable);
router.put("/disable/:idCountry", countryCtrl.disable);

module.exports = router;
