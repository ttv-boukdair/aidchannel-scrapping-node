const mongoose = require("mongoose");
const paramsSchema = mongoose.Schema({
  
  source_id: {
   type: String,
  },
  interrupted: {
    type: Boolean,
    default:false
   },
   row: {
    type: Number,
    default:0
   },
   offset: {
    type: Number,
    default:0
   },
   error:{
    type: String,
   },
  
});


module.exports = mongoose.model("Params", paramsSchema);
