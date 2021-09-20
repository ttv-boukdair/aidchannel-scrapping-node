require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Tweets = require("../models/twitter");
const Organization = require("../models/organization");
const { use } = require("../routes/tweetsRoute");
const Country = require("../models/country");

//!\ Allowed calls : 300 tweets / 15 min
const bearer_token = process.env.BEARER_TOKEN;

async function getUserID(username, api_key) {
  const response = await axios.get(
    `https://api.twitter.com/2/users/by/username/${username}`,
    {
      headers: { Authorization: `Bearer ${api_key}` },
    }
  );
  console.log(response.data);
  return response.data.data.id;
}

async function getUserTweets(username, api_key, num_result) {
  const account_id = await getUserID(username, api_key);
  const response = await axios.get(
    `https://api.twitter.com/2/users/${account_id}/tweets?max_results=${num_result}&tweet.fields=created_at`,
    {
      headers: { Authorization: `Bearer ${api_key}` },
    }
  );
  return response.data;
}

// async function getFeedTweets(query, api_key) {
//     const response = await axios.get(`https://api.twitter.com/2/tweets/search/tweets.json?q=Sam`, {
//         headers: { 'Authorization': `Bearer ${api_key}` }
//     })
//     return response
// }

exports.addUserTweets = async (req, res, next) => {
  const org_id = req.query.id;
  const org = await Organization.findOne({ _id: org_id });
  const username = org.twitter_username;
  const country = org.country;

  try {
    const tweets = await getUserTweets(username, bearer_token, 10);
    let twt;
    const tweets_size = tweets.data.length;
    for (let i = 0; i < tweets.data.length; i++) {
      twt = new Tweets({
        tweet_id: tweets.data[i].id,
        twitter_username: username,
        organization: org_id,
        country: country,
        posted_at: tweets.data[i].created_at,
      });
      twt.save();
    }
    res.status(200).json(twt);
  } catch (error) {
    console.error(error);
    res.status(404).json("error");
  }
};

//*************** Front functions *************
exports.getFrontLastTweets = async (req, res, next) => {
  const code_country = req.params.code;
  const country = await Country.findOne({ code: code_country });
  console.log(country);
  const tweets = await Tweets.find({ country: country._id })
    .limit(3)
    .sort({ posted_at: -1 });
  res.status(200).json(tweets);
};

exports.getAllTweetsByCountryPagination = async (req, res, next) => {
  const { limit = 9, page = 1 } = req.query;
  const code_country = req.params.code;

  try {
    const country = await Country.findOne({ code: code_country.toUpperCase() });
    console.log(country);
    const tweets = await Tweets.find({ country: country._id, validation: 0 })
      .populate("country")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ posted_at: -1 });

    res.status(200).json({
      data: tweets,
      page: page,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.getAllTweetsAccepted = async (req, res, next) => {
  const code_country = req.params.code;
  const { limit, page } = req.query;
  try {
    const country = await Country.findOne({ code: code_country.toUpperCase() });

    const TweetsAccepted = await Tweets.find({
      country: country._id,
      validation: 1,
    })
      .populate("country")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ posted_at: -1 });
    res.status(200).json({
      data: TweetsAccepted,
      page: page,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.acceptTweet = async (req, res, next) => {
  const { tweetId } = req.params;
  const filter = { _id: tweetId };
  const update = { validation: 1 };

  try {
    let tweet = await Tweets.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.status(200).json(tweet);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.refuseTweet = async (req, res, next) => {
  const { tweetId } = req.params;
  const filter = { _id: tweetId };
  const update = { validation: 2 };

  try {
    let tweet = await Tweets.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.status(200).json(tweet);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.getNumberTweetsByCountry = async (req, res, next) => {
  const { codeCountry } = req.params;
  try {
    let findCountry = await Country.findOne({
      code: codeCountry.toUpperCase(),
    });
    let numberTweets = await Tweets.countDocuments({
      country: findCountry._id,
    });
    res.status(200).json(numberTweets);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.acceptedTweetsByCodeCountry = async (req, res, next) => {
  const { codeCountry, limit } = req.params;

  try {
    let findCountry = await Country.findOne({
      code: codeCountry.toUpperCase(),
    });

    let tweets = await Tweets.find({
      country: findCountry._id,
      validation: 1,
    })
      .limit(limit * 1)
      .sort([["_id", -1]]);

    console.log(tweets);

    res.status(200).json(tweets);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};
// just pour les tests
exports.test = async (req, res, next) => {
  try {
    const tweets = await Tweets.find();
    tweets.forEach((item) => {
      mongoose.set("useFindAndModify", false);

      Tweets.findByIdAndUpdate(item?._id, { validation: 0 }, function (err) {});
    });
    res.status(200).json({
      data: "c'est bon",
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.SearchByName = async (req, res, next) => {
  const { limit = 9, page = 1 } = req.query;
  const { code } = req.body;

  let countrycode = await Country.find({ code: code.toUpperCase() });

  try {
    const tweets = await Tweets.find({
      name: { $nin: [null, ""] },
      country: countrycode[0]._id,
      name: { $regex: new RegExp(req.body.searchText, "i") },
      validation: 1,
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ posted_at: -1 });

    res.status(200).json({
      data: tweets,
      page: page,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.getTweetsScrolling = async (req, res, next) => {
  //url collecte n projets
  const { limit = 9, page = 1 } = req.query;
  const { code } = req.body;

  let countrycode = await Country.find({ code: code.toUpperCase() });
  const twiter = await Tweets.find({
    country: countrycode[0]._id,
    name: { $regex: new RegExp(req.body.searchText, "i") },
    validation: 1,
  })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  res.status(200).json({ data: twiter, page: page });
};
//*************** END Front functions *************
