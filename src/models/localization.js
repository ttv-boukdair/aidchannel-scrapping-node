const mongoose = require("mongoose");
const localizationSchema = mongoose.Schema({
  localization: {
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

module.exports = mongoose.model("localization", localizationSchema);
