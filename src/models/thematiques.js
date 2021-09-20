const mongoose = require("mongoose");
const thematiquesSchema = mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Thematiques", thematiquesSchema);
