const mongoose = require("mongoose");
const interviewSchema = mongoose.Schema({
  interview: {
    type: String,
  },
  interviewImage: {
    type: String,
  },
  type_interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewTypes",
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectPreProd",
  },
});

module.exports = mongoose.model("Interview", interviewSchema);
