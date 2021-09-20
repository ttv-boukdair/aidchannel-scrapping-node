var Organizationtypes = require("../models/organizationtypes");

exports.index = async (req, res, next) => {
  let items = await Organizationtypes.find().sort({ name: 1 });
  res.status(200).json(items);
};

// exports.add = async (req, res, next) => {
//   let organizationtypes = new Organizationtypes({ name: "Advocacy NGO" });

//   let result = await organizationtypes.save();

//   res.status(201).json(result);
// };
