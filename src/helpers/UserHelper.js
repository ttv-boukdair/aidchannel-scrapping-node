const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const maxAge = 3 * 24 * 60 * 60 * 1000;

exports.hashPwd = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(pwd, salt);
  return hashed;
};

exports.userHelper = {
  comparePasswords: async (password, passwordEnc) => {
    return await bcrypt.compare(password, passwordEnc);
  },
  createToken: (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,
    });
  },
  tokenOptions: { httpOnly: true, maxAge },
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },
  GenerateTokenAndSendResp: (res, user) => {
    const token = this.userHelper.createToken(user._id);
    console.log(token)
    if (!token) throw Error("Couldnt sign the token");
    res.cookie("jwt", token, this.userHelper.tokenOptions);
    res.status(200).json({
      token,
      user: {
        ...user,
        password: undefined,
      },
    });
    return res;
  },
};
