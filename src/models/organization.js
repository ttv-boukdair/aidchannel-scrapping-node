const mongoose = require("mongoose");
const organizationSchema = mongoose.Schema({
  source: {
    type: String,
  },
  source_id: {
    type: String,
  },
  name: {
    type: String,
  },
  logo: {
    type: String,
  },
  description: {
    type: String,
  },

  organization_size: {
    type: String,
  },
  organization_types: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizationtypes",
    },
  ],
  countries_with_offices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
  ],
  head_office_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  youtube_url: {
    type: String,
  },
  twitter_username: {
    type: String,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
  },
  funder_of_month: {
    type: Boolean,
    default: false,
  },
  implementer_of_month: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Organization", organizationSchema);
