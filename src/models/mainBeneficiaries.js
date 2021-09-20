const mongoose = require("mongoose");
const mainBeneficiariesSchema = mongoose.Schema({
  beneficiary: {
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

module.exports = mongoose.model("MainBeneficiaries", mainBeneficiariesSchema);
