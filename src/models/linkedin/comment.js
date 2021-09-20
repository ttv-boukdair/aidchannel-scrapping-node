const mongoose = require("mongoose");
const commentSchema = mongoose.Schema(
  {
    content: { type: String, required: true },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like", default: [] }],
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    depth: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
