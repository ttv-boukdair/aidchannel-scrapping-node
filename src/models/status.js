//approuved, closed, ongoing

const mongoose = require("mongoose");
const statusSchema = mongoose.Schema({
  name: {
    /*********** */ type: String,
  },
});

module.exports = mongoose.model("Status", statusSchema);
