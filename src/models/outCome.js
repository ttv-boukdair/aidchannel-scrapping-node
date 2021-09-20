const mongoose = require("mongoose");
const outComeSchema = mongoose.Schema({
  label: {
    type: String,
  },
  type: {
    type: String,
    default: "outcome",
  },
  impacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Impact",
    },
  ],
});

module.exports = mongoose.model("OutCome", outComeSchema);
