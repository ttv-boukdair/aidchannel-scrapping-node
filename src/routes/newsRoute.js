const express = require("express");
const router = express.Router();

const newsCtrl = require("../controllers/scrappingNewsController");

router.get("/addNews", newsCtrl.addOrgArticles);

module.exports = router;