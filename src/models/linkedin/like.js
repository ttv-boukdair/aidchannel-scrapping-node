const mongoose = require("mongoose");
const likeSchema = mongoose.Schema(
  {
    type: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", likeSchema);
