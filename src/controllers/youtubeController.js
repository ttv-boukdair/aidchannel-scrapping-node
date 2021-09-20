const Youtube = require("../models/youtube");
const country = require("../models/country");
const mongoose = require("mongoose");
const countrycode = require("../models/country");
exports.getAllVideosByCountryPagination = async (req, res, next) => {
  const { limit = 9, page = 1 } = req.query;
  const { codeCountry } = req.params;
  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });

    let videosByCountry = await Youtube.find({
      country: findCountry._id,
      validation: 0,
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ published: -1 });
    res.status(200).json({
      data: videosByCountry,
      page: page,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.getAcceptedVideosByCountryLimit = async (req, res, next) => {
  const { limit = 9 } = req.query;
  const { codeCountry } = req.params;
  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });

    let videosByCountry = await Youtube.find({
      country: findCountry._id,
      validation: 1,
    })
      .limit(limit * 1)
      .sort({ published: -1 });
    res.status(200).json(videosByCountry);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.acceptVideo = async (req, res, next) => {
  const { videoId } = req.params;
  const filter = { _id: videoId };
  const update = { validation: 1 };

  try {
    let video = await Youtube.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.refuseVideo = async (req, res, next) => {
  const { videoId } = req.params;
  const filter = { _id: videoId };
  const update = { validation: 2 };

  try {
    let video = await Youtube.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.getAllVideosAccepted = async (req, res, next) => {
  const { limit = 9, page = 1 } = req.query;
  const { codeCountry } = req.params;
  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });

    let videosByCountry = await Youtube.find({
      country: findCountry._id,
      validation: 1,
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ published: -1 });
    res.status(200).json({
      data: videosByCountry,
      page: page,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getNumberVideosByCountry = async (req, res, next) => {
  const { codeCountry } = req.params;
  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });
    let numberVideos = await Youtube.countDocuments({
      country: findCountry._id,
    });
    res.status(200).json(numberVideos);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.test = async (req, res, next) => {
  try {
    const videos = await Youtube.find();

    videos.forEach((item) => {
      mongoose.set("useFindAndModify", false);

      Youtube.findByIdAndUpdate(
        item?._id,
        { validation: 0 },
        function (err) {}
      );
    });
    res.status(200).json({
      data: "c'est bon",
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.SearchByChannelName = async (req, res, next) => {
  const { limit = 9, page = 1 } = req.query;
  const { code } = req.body;

  let countrycode = await country.find({ code: code.toUpperCase() });

  try {
    const videos = await Youtube.find({
      channel_name: { $nin: [null, ""] },
      country: countrycode[0]._id,
      channel_name: { $regex: new RegExp(req.body.searchText, "i") },
      validation: 1,
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ published: -1 });

    res.status(200).json({
      data: videos,
      page: page,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.getVideosScrolling = async (req, res, next) => {
  //url collecte n projets
  const { limit = 9, page = 1 } = req.query;
    const { code } = req.body;

    let countrycode = await country.find({ code: code.toUpperCase() });
  const youtube = await Youtube.find({
    country: countrycode[0]._id,
    channel_name: { $regex: new RegExp(req.body.searchText, "i") },
    validation: 1,
  })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  res.status(200).json({ data: youtube, page: page });
};