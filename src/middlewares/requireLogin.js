const jwt = require("jsonwebtoken");
const User = require("../models/user2");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({
      error: "you dont have headers authorization",
    });
  } else {
    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        res.status(401).json({ err: "we cant see your token" });
      } else {
        const { id } = payload;
        User.findById(id).then((userData) => {
          req.user = userData;
          next();
        });
      }
    });
  }
};
