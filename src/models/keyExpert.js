const mongoose = require("mongoose");
const keyExpertSchema = mongoose.Schema({
  key_expert: {
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

module.exports = mongoose.model("KeyExpert", keyExpertSchema);
