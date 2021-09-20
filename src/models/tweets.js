const mongoose = require("mongoose");
const twitterSchema = mongoose.Schema({
  tweet_id: {
    type: String,
  },
  twitter_username: {
    type: String,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organization",
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
  },
  posted_at: {
    type: String,
  },
  body: {
    type: String,
  },
  photos: [
    {
      type: String,
    },
  ],
  name: {
    type: String,
  },
  avatar_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Avatar",
  },
  validation: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Twitter", twitterSchema);
