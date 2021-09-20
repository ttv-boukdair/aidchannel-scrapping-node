const mongoose = require("mongoose");
const organizationtypesSchema = mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Organizationtypes", organizationtypesSchema);
