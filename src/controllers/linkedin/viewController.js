const view = require("../../models/linkedin/views");

exports.getNumberProfiles = async (req, res, next) => {
  const { idProfil } = req.params;

  try {
    let NumberProfiles = await view.countDocuments({
      profil: idProfil
    });
    res.status(200).json(NumberProfiles);
  } catch (err) {
    res.status(500).json({ error: err });

  }
};
exports.InsertSeen = async (req, res, next) => {
  
  const vu = new view(req.body);
  try {
    await vu.save();
    res.status(201).json(vu);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getAllProfiles = async (req, res, next) => {
  const { idProfil } = req.params;

  try {
    let Profiles = await view.find({
      profil: idProfil,
    });
    res.status(200).json(Profiles);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};