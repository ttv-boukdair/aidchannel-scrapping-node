const mongoose = require("mongoose");
const outPutSchema = mongoose.Schema({
  label: {
    type: String,
  },
  type: {
    type: String,
    default: "output",
  },
  outComes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutCome",
    },
  ],
});

module.exports = mongoose.model("OutPut", outPutSchema);
