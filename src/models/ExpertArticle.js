const mongoose = require("mongoose");
const ExpertArticleShema = mongoose.Schema({
  article: {
    type: String,
  },
  articleImage: {
    type: String,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("ExpertArticle", ExpertArticleShema);
