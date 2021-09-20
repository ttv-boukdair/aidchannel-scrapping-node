var Thematique = require("../models/thematiques");

exports.index = async (req, res, next) => {
  let items = await Thematique.find().sort({ name: 1 })
  res.status(200).json(items);
};


// exports.add = async (req, res, next) => {
//   let thematique = new Thematique({ name: "Advocacy NGO" });

//   let result = await thematique.save();

//   res.status(201).json(result);
// };
