const mongoose = require("mongoose");
const commonUserSchema = mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    Required: false,
  },
  image_url: {
    type: String,
  },
});

module.exports = mongoose.model("common_user", commonUserSchema);
