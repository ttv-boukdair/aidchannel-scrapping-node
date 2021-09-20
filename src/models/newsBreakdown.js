const mongoose = require("mongoose");
const newsparamsSchema = mongoose.Schema({
  organization:{
    type : Object,
  },
  interrupted: {
    type: Boolean,
    default:false
   },
   offset: {
    type: Number,
    default:0
   },
   error_description:{
    type : String,
   }

  
});


module.exports = mongoose.model("NewsBreakdown", newsparamsSchema);
