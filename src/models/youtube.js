const mongoose = require("mongoose");
const countrySchema = mongoose.Schema({
  channel_url: {
    type: String,
  },
  channel_name: {
    type: String,
  },
  video_url: {
    type: String,
  },
  title: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  published: {
    type: String,
  },
  video_length: {
    type: String,
  },
  view_count: {
    type: Number,
  },

  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organization",
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
  },
  // 0 not treated yet // 1 accept // 2 refuse

  validation: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Youtube", countrySchema);
