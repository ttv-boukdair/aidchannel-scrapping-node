// this contoller is used to populate the database with
//the DEVEX WEBSITE DATA and others data

//Organizationtypes model and DATA
var Organizationtypes = require("../models/organizationtypes");
var OrganizationtypesDATA = require("../data/devex_organizationtypes.json");

//yhematique model and DATA
var Thematique = require("../models/thematiques");
var ThematiquesDATA = require("../data/devex_thematiques.json");

//yhematique model and DATA
var Country = require("../models/country");
var CountryDATA = require("../data/country.json");

//Organizationtypes model and DATA
// var Organization = require("../models/organization");
// var OrganizationDATA = require("../bigdata/organization.json");
// const organization = require("../models/organization");
// const organizationtypes = require("../models/organizationtypes");

// function to populate organization type
async function populateORganizationTypes() {
  for (const [key, value] of Object.entries(OrganizationtypesDATA)) {
    let organizationtypes = new Organizationtypes({ name: value.name });
    organizationtypes.save();
  }
  return "populateORganizationTypes Done";
}

// function to populate Thematique
async function populateThematique() {
  for (const [key, value] of Object.entries(ThematiquesDATA)) {
    let thematique = new Thematique({ name: value.name });
    thematique.save();
  }
  return "populate Thematique Done";
}

// function to populate countries data
async function populateCountries() {
  for (const [key, value] of Object.entries(CountryDATA)) {
    let country = new Country({ name: value.name, code: value.code });
    country.save();
  }
  return "populateCountries Done";
}

// function to populate organization DATA
// async function populateOrganization() {
//   // load  model and DATA in controller
//   let types = await Organizationtypes.find({});
//   let countries = await Country.find({});

//   for (const [key, value] of Object.entries(OrganizationDATA)) {
//     let rows_organization_types = [];
//     let rows_countries_with_offices = [];

//     //fins orgnasations type

//     for (const [key1, ot] of Object.entries(value.organization_types)) {
//       // console.log("ot");
//       // console.log(ot);
//       var found = types.find(function (element) {
//         return element.name == ot;
//       });
//       // console.log("found type");
//       // console.log(found);
//       rows_organization_types.push(found._id);
//     }

//     //fins orgnasations  coounties

//     for (const [key2, cwf] of Object.entries(value.countries_with_offices)) {
//       // console.log("element");
//       // console.log(cwf);

//       // console.log("countris");
//       // console.log(countries);
//       var found = countries.find(function (element) {
//         return element.name == cwf.name;
//       });
//       // console.log("found country");
//       // console.log(found);
//       if (found) rows_countries_with_offices.push(found._id);
//     }

//     let organization = new Organization({
//       source: "devex",
//       source_id: value.id,
//       name: value.name,
//       logo: value.logo_url,
//       description: value.description,
//       organization_size: value.organization_size,
//       organization_types: rows_organization_types,
//       countries_with_offices: rows_countries_with_offices,
//     });
//     organization.save();
//   }

//   //for each organization construct the data element to push in DATABASE

//   return "populate organization Done";
// }
exports.populateDB = async (req, res, next) => {
  //  to be  enabled if we want populate organization type
  // await populateORganizationTypes();

  //  to be  enabled if we want populate organization type
  //  await populateThematique();

  //excute countries adds
  // await populateCountries();

  // add organistions
  // let result = await populateOrganization();
  // console.log(result);

  res.status(201).json("Done");
};
