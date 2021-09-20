const mongoose = require("mongoose");
const expectedResultSchema = mongoose.Schema({
  result: {
    type: String,
  },
  order: {
    type: String,
    default: "1",
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectPreProd",
  },
});


module.exports = mongoose.model("ExpectedResult", expectedResultSchema);
