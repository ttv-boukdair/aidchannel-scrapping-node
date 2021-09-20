const mongoose = require("mongoose");
const impactSchema = mongoose.Schema({
  label: {
    type: String,
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectPreProd",
  },
  type: {
    type: String,
    default: "impact",
  },
  outcomes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutCome",
    },
  ],
});

module.exports = mongoose.model("Impact", impactSchema);
