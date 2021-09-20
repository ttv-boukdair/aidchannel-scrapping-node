const mongoose = require("mongoose");
const postSchema = mongoose.Schema(
  {
    content: {
      type: String,
    },
    image: { type: String },
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like", default: [] }],
    comments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
