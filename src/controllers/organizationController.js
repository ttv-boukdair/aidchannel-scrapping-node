const mongoose = require("mongoose");
const { populate } = require("../models/organization");
var Organization = require("../models/organization");
var country = require("../models/country");
const organizationtypes = require("../models/organizationtypes");
const organization = require("../models/organization");

exports.index = async (req, res, next) => {
  let items = await Organization.find()
    .sort({ name: 1 })
    // .limit(5)
    .populate("organization_types")
    .populate("countries_with_offices");
  res.status(200).json(items);
};

exports.getOrganizationByType = async (req, res, next) => {
  const { type } = req.params;
  try {
    const orgType = await organizationtypes.findOne({ name: type });

    const organizations = await Organization.find(
      {
        organization_types: orgType._id,
      },
      { _id: 1, name: 1 }
    );

    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json(error);
  }
};
exports.subsidiaryOrganization = async (req, res, next) => {
  let items = await Organization.find({ head_office_id: { $ne: null } })
    // .sort({ name: 1 })
    // .limit(5)
    .populate("organization_types")
    .populate("countries_with_offices")
    .populate("head_office_id");
  res.status(200).json(items);
};

exports.getFunderOfMonth = async (req, res, next) => {
  //url collecte n projets
  const { limit = 9, page = 1, searchText = "" } = req.query;
  const funder_of_month = await Organization.find({
    funder_of_month: true,
    name: { $regex: new RegExp(searchText, "i") },
  })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  res.status(200).json({ data: funder_of_month, page: page });
};

exports.getImplementerOfMonth = async (req, res, next) => {
  //url collecte n projets
  const { limit = 9, page = 1, searchText = "" } = req.query;
  const implementer_of_month = await Organization.find({
    implementer_of_month: true,
    name: { $regex: new RegExp(searchText, "i") },
  })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  res.status(200).json({ data: implementer_of_month, page: page });
};

exports.getOne = async (req, res, next) => {
  const id = req.params.id;
  try {
    const org = await Organization.findById(id)
      .populate("organization_types")
      .populate("countries_with_offices")
      .populate("head_office_id");
    res.status(200).json(org);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.getRandomFunderOfMonth = async (req, res, next) => {
  //url collecte n projets
  const funder_of_month = await Organization.aggregate([
    { $match: { organization_types: "60c23ffc2b006960f055e8ef" } },
    { $sample: { size: 1 } },
  ]);
  res.status(200).json(funder_of_month);
};
exports.getRandomImplementerOfMonth = async (req, res, next) => {
  //url collecte n projets
  const implementer_of_month = await Organization.aggregate([
    { $match: { organization_types: "60c23ffc2b006960f055e8f2" } },
    { $sample: { size: 1 } },
  ]);
  res.status(200).json(implementer_of_month);
};

// add organization

exports.addOrganization = async (req, res, next) => {
  if (req.file) req.body.logo = req.file.path;
  const orgTypes = JSON.parse(req.body.organization_types);
  const orgTypesIds = orgTypes.map((type) => type._id);
  req.body.organization_types = orgTypesIds;
  //console.log(orgTypes);
  let org = new Organization(req.body);
  //console.log(org);
  try {
    await org.save();
    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.deleteOrganization = async (req, res, next) => {
  const id = req.params.id;
  try {
    await Organization.deleteOne({ _id: id });
    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getNumberOrganizationsByCountry = async (req, res, next) => {
  const { codeCountry } = req.params;
  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });
    let numberOrganizations = await Organization.countDocuments({
      country: findCountry._id,
    });
    res.status(200).json(numberOrganizations);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getAllOrganizationsByCountry = async (req, res, next) => {
  const { codeCountry } = req.params;
  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });

    let OrganizationsByCountry = await Organization.find({
      country: findCountry._id,
    })
      .populate("organization_types")
      .populate("countries_with_offices")
      .populate("head_office_id");
    res.status(200).json(OrganizationsByCountry);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getAllOrganizationsByCountryPagination = async (req, res, next) => {
  const { codeCountry } = req.params;
  const { limit = 9, page = 1 } = req.query;

  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });

    let OrganizationsByCountry = await Organization.find(
      {
        country: findCountry._id,
        name: { $regex: new RegExp(req.body.searchText, "i") },
      },
      {
        _id: 1,
        name: 1,
        head_office_id: 1,
        youtube_url: 1,
        twitter_username: 1,
        logo: 1,
      }
    )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort([["_id", -1]])
      .populate("organization_types")
      .populate("countries_with_offices")
      .populate("head_office_id");

    let count = await Organization.countDocuments({
      country: findCountry._id,
      name: { $regex: new RegExp(req.body.searchText, "i") },
    });

    res
      .status(200)
      .json({ data: OrganizationsByCountry, page: page, totalCount: count });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// exports.getAllUsers = async (req, res, next) => {
//   let user = await user2.find().sort({ name: 1 });
//   res.status(200).json({ data: user });
//   res.status(200).json(user);
// };
exports.getAllOrganizationsByPagination = async (req, res, next) => {
  const { limit = 9, page = 1 } = req.query;
  try {
    let OrganizationsBypagination = await Organization.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort([["_id", -1]])
      .populate("organization_types")
      .populate("countries_with_offices")
      .populate("head_office_id")
      .populate("country");
      
    let count = await Organization.countDocuments({
      name: { $regex: new RegExp(req.body.searchText, "i") },
    });

    res
      .status(200)
      .json({ data: OrganizationsBypagination, page: page, totalCount: count });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// get all organization  with fields ID and Name just to improve performance
exports.getAllHeadOrganizationsIdAndName = async (req, res, next) => {
  try {
    let items = await Organization.find(
      { head_office_id: null },
      { _id: 1, name: 1 }
    ).sort({
      name: 1,
    });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.updateOrganization = async (req, res, next) => {
  const id = req.params.id;
  if (req.file) req.body.logo = req.file.path;

  const orgTypes = JSON.parse(req.body.organization_types);
  const orgTypesIds = orgTypes.map((type) => type._id);
  req.body.organization_types = orgTypesIds;

  try {
    mongoose.set("useFindAndModify", false);
    Organization.findByIdAndUpdate(id, req.body, function (err) {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "organization updated successfully",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
// exports.add = async (req, res, next) => {
//   let organizationtypes = new Organizationtypes({ name: "Advocacy NGO" });

//   let result = await organizationtypes.save();

//   res.status(201).json(result);
// };

exports.getDonors = async (req, res, next) => {
  const { codeCountry } = req.params;
  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });

    const orgType = await organizationtypes.findOne({
      name: "Funding Agencies",
    });
    console.log(orgType);
    const donors = await Organization.find({
      organization_types: orgType._id,
      country: findCountry._id,
    });
    res.status(200).json(donors);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.getImplementers = async (req, res, next) => {
  const { codeCountry } = req.params;
  try {
    let findCountry = await country.findOne({
      code: codeCountry.toUpperCase(),
    });
    const orgType = await organizationtypes.findOne({
      name: "Implementing NGO",
    });
    console.log(orgType);
    const Implementers = await Organization.find({
      organization_types: orgType._id,
      country: findCountry._id,
    });
    res.status(200).json(Implementers);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.enableDonorOfMonth = async (req, res, next) => {
  const { donorId } = req.params;
  try {
    const donorOfMonth = await organization.findOne({
      funder_of_month: true,
    });

    if (donorOfMonth._id !== null) {
      mongoose.set("useFindAndModify", false);
      organization.findByIdAndUpdate(
        donorOfMonth._id,
        { funder_of_month: false },
        function (err) {
          if (err) {
          }
        }
      );
    }
  } catch (error) {}
  mongoose.set("useFindAndModify", false);
  organization.findByIdAndUpdate(
    donorId,
    { funder_of_month: true },
    function (err) {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "funder updated successfully",
        });
      }
    }
  );
};

exports.disabledDonorOfMonth = async (req, res, next) => {
  const id = req.params.donorId;

  mongoose.set("useFindAndModify", false);
  organization.findByIdAndUpdate(
    id,
    { funder_of_month: false },
    function (err) {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "funder updated successfully",
        });
      }
    }
  );
};
exports.enableImplementerOfMonth = async (req, res, next) => {
  const { implementerId } = req.params;
  try {
    const implementerOfMonth = await organization.findOne({
      implementer_of_month: true,
    });

    if (implementerOfMonth._id !== null) {
      mongoose.set("useFindAndModify", false);
      organization.findByIdAndUpdate(
        implementerOfMonth._id,
        { implementer_of_month: false },
        function (err) {
          if (err) {
          }
        }
      );
    }
  } catch (error) {}
  mongoose.set("useFindAndModify", false);
  organization.findByIdAndUpdate(
    implementerId,
    { implementer_of_month: true },
    function (err) {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "implementer updated successfully",
        });
      }
    }
  );
};

exports.disabledImplementerOfMonth = async (req, res, next) => {
  const id = req.params.implementerId;

  mongoose.set("useFindAndModify", false);
  organization.findByIdAndUpdate(
    id,
    { implementer_of_month: false },
    function (err) {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "implementer updated successfully",
        });
      }
    }
  );
};
