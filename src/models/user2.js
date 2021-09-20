const mongoose = require("mongoose");
const { v1: uuid } = require("uuid");
const crypto = require("crypto");
const userSchema = mongoose.Schema({
  fullname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  adress: {
    type: String,
  },
  phone: {
    type: String,
  },
  job_title: {
    type: String,
  },
  image_url: {
    type: String,
  },
  expert_of_month: {
    type: Boolean,
    default: false,
  },
  cop: {
    type: Boolean,
    default: false,
  },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "View" }],
  linkedin: { type: Boolean, default: false },
  type: {
    //donor or implementer
    type: Boolean,
    default: false,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
  },
  salt: {
    type: String,
  },
  // 0  super admin , 1 webmaster , 2 user, 3 expert
  role: {
    type: Number,
    default: 2,
  },
  // if added by webmaster 1 , if not 0
  added_webmaster: {
    type: Number,
    default: 0,
  },
});

// userSchema
//   .virtual("password")
//   .set(function (password) {
//     this._password = password;
//     this.salt = uuid();
//     this.hashed_Password = this.cryptPassword(password);
//   })
//   .get(function () {
//     return this._password;
//   });
// userSchema.methods = {
//   authenticate: function (plainText) {
//     return this.cryptPassword(plainText) === this.hashed_Password;
//   },
//   cryptPassword: function (password) {
//     if (!password) return "";
//     try {
//       return crypto
//         .createHmac("sha1", this.salt)
//         .update(password)
//         .digest("hex");
//     } catch (error) {
//       return "";
//     }
//   },
// };
module.exports = mongoose.model("User", userSchema);
