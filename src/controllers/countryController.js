const { populate } = require("../models/country");
var Country = require("../models/country");
const mongoose = require("mongoose");
// get countries
exports.index = async (req, res, next) => {
  let items = await Country.find();
  res.status(200).json(items);
};

// get enabled countries
exports.getEnabled = async (req, res, next) => {
  let items = await Country.find({ enabled: true });
  res.status(200).json(items);
}; // get enabled countries

exports.getDisabled = async (req, res, next) => {
  let items = await Country.find({ enabled: undefined });
  res.status(200).json(items);
};

exports.enable = async (req, res, next) => {
  const { idCountry } = req.params;
  mongoose.set("useFindAndModify", false);
  Country.findByIdAndUpdate(idCountry, { enabled: true }, function (err) {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.status(200).json({
        message: "Country updated successfully",
      });
    }
  });
};
exports.disable = async (req, res, next) => {
  const { idCountry } = req.params;
  mongoose.set("useFindAndModify", false);
  Country.findByIdAndUpdate(idCountry, { enabled: undefined }, function (err) {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.status(200).json({
        message: "Country updated successfully",
      });
    }
  });
};
// get country by code
exports.country_by_code = async (req, res, next) => {
  let item = await Country.findOne({ code: req.params.code.toUpperCase() });
  res.status(200).json(item);
};
