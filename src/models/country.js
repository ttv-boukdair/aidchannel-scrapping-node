const mongoose = require("mongoose");
const countrySchema = mongoose.Schema({
  name: {
    type: String,
  },
  code: {
    type: String,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Country", countrySchema);
