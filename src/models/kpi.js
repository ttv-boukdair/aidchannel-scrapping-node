const mongoose = require("mongoose");
const kpiSchema = mongoose.Schema({
  kpi: {
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

module.exports = mongoose.model("kpi", kpiSchema);
