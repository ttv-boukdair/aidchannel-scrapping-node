const mongoose = require("mongoose");
const activitySchema = mongoose.Schema({
  label: {
    type: String,
  },
  type: {
    type: String,
    default: "activity",
  },
  outPuts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutPut",
    },
  ],
});

module.exports = mongoose.model("Activity", activitySchema);
