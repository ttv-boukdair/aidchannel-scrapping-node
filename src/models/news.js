const mongoose = require("mongoose");
const newsSchema = mongoose.Schema({
  article_url: {
    type: String,
  },
  article_title: {
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
  validation: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("News", newsSchema);
