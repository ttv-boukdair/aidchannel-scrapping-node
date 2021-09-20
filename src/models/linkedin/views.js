const mongoose = require("mongoose");
const viewsSchema = mongoose.Schema(
  {
    profil_Visited: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profil: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("View", viewsSchema);
