const mongoose = require("mongoose");
const regionSchema = mongoose.Schema({
  
  region_name: {
   type: String,
  },
  region_code: {
    type: String,
   },
   countries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
   },
  ],
});


module.exports = mongoose.model("Regions", regionSchema);
