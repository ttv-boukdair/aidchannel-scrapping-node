const mongoose = require("mongoose");
const twitterSchema = mongoose.Schema({
    avatar: {
        type: String,
    },

    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organization",
    },
    username: {
        type: String,
    },
    
});

module.exports = mongoose.model("Avatar", avatarSchema);
