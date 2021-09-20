const mongoose = require("mongoose");
const projectpreprodSchema = mongoose.Schema({
  source: {
    type: String,
  },
  source_id: {
    type: String,
  },
  proj_org_id: {
    type: String,
  },
  name: {
    /*********** */
    type: String,
    Required: true,
  },
  namefr: {
    /*********** */
    type: String,
    Required: true,
  },
  description: {
    /*********** */
    type: String,
    Required: true,
  },
  total_cost: {
    type: String,
  },
  funder: {
    /*********** */
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    Required: false,
  },
  implementer: {
    /*********** */
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    Required: false,
  },
  sub_funder: [
    {
      /*********** */
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  ],
  sub_implementer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  ],

  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    Required: false,
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    Required: false,
  },
  thematique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thematiques",
    Required: false,
  },

  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "status",
  },
  task_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  translate_name: {
    type: Boolean,
  },
  project_of_month: {
    type: Boolean,
    default: false,
  },
  /****************************************************** */

  approval_date: {
    /*********** */
    type: Date,
    default: null,
  },
  image_url: {
    type: String,
  },

  budget: {
    /*********** */
    type: String,
  },
  Currency: {
    type: String,
  },
  financial_sources: {
    type: String,
  },

  objectives: {
    type: String,
  },

  beneficiaries: {
    type: String,
  },

  project_number: {
    type: String,
  },
  project_type: {
    type: String,
  },
  operation_number: {
    type: String,
  },
  actual_start: {
    type: Date,
    default: null,
  },
  planned_end: {
    type: Date,
    default: null,
  },
  actual_end: {
    type: Date,
    default: null,
  },
  progress_by_time: {
    type: String,
  },

  maj_date: {
    type: Date,
    default: null,
  },
  multinational: {
    type: Boolean,
    default: false,
  },
  // 0 not treated yet
  // 1 accept
  // 2 refuse
  validation: {
    type: Number,
    default: 0,
  },
  raw_data_iati: {
    type: Object,
  },
  raw_data_org: {
    type: Object,
  },
  added_by_Expert: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("ProjectPreProd", projectpreprodSchema);
