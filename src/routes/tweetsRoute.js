const express = require("express");
const router = express.Router();

const tweetCtrl = require("../controllers/twtUserAPIController");

const requireLogin = require("../middlewares/requireLogin");

router.post("/SearchByName", tweetCtrl.SearchByName);
// get global projects by keyword
router.get("/TweetsAccepted/:code", tweetCtrl.getAllTweetsAccepted);
// changer la'etat de validation juste pour les tests
//router.get("/test", tweetCtrl.test);
router.get("/test", tweetCtrl.test);
router.post("/tweetsOfCountry", tweetCtrl.getTweetsScrolling);

router.get("/addTweets", tweetCtrl.addUserTweets);
// front route
router.get("/LastTweets/:code", tweetCtrl.getFrontLastTweets);
router.get(
  "/allTweetsPagination/:code",
  tweetCtrl.getAllTweetsByCountryPagination
);

// accept tweet web master
router.put("/acceptTweet/:tweetId", tweetCtrl.acceptTweet);

//refuse tweet web master
router.put("/refuseTweet/:tweetId", tweetCtrl.refuseTweet);

router.get(
  "/numberByCodeCountry/:codeCountry",
  tweetCtrl.getNumberTweetsByCountry
);

router.get(
  "/acceptedTweetsByCodeCountry/:codeCountry/:limit",
  tweetCtrl.acceptedTweetsByCodeCountry
);

module.exports = router;
