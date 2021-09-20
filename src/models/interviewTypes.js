const mongoose = require("mongoose");

const interviewTypesSchema = mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("InterviewTypes", interviewTypesSchema);
