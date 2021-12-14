const axios = require("axios");
const https = require('https');
const jsdom = require("jsdom");
var Organization = require("../models/organization");
var User = require("../models/user2");
var Status = require("../models/status");
var Countries = require("../models/country");
const Params = require("../models/params");
var Thematiques = require("../models/thematiques");
const { JSDOM } = jsdom;
var ProjectPreProd = require("../models/projectpreprod");
var SectorsDATA = require("../data/sectors.json");
var undp_regionsDATA = require("../data/undp_region_countries.json");
const { json } = require("body-parser");
const user = require("../models/user2");
var Regions = require("../models/regions");
const { FuzzySearch } = require('mongoose-fuzzy-search-next');
const regions = require("../models/regions");
const agent = new https.Agent({
  rejectUnauthorized: false
});



async function ifad_project(project) {
 
  return 
}


exports.newIFADProjects = async (req, res) => {
  const country_codes = [{code:'MA',num:'39090859'}]
  const url_base = "https://www.ifad.org/en/web/operations/projects-and-programmes"
 const url = url_base+"?mode=search&catCountries="
 for(let c=0;c<country_codes.length;c++){
   console.log("here1")
   console.log(url+country_codes[c].num)
  let resp = await axios.get(url+country_codes[c].num)
  console.log("here2")
  var dom = new JSDOM(resp.data)
  var raw_links = dom.window.document.querySelectorAll("div > div > a")
  let links = Array.from(raw_links, a => {var link = a.getAttribute('href'); if(link.includes("https://www.ifad.org/en/web/operations/-/project/")) return link})
  for(let l=0; l<links.length;l++){
    if(links[l])
    console.log(links[l])
  }
  

 }
}

async function getImplementer(iati_org) {
  const funder_object_id = "60c23ffc2b006960f055e8f2";
  let funder = null;
  if (iati_org) {
    let data = JSON.stringify({ "text": iati_org })
    let finded_organizations = await axios({
      method: 'post',
      httpsAgent: agent,
      url: 'https://ai.jtsolution.org/sim-orgs',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    });
    finded_organizations = finded_organizations.data
    if (finded_organizations.length > 0)
      funder = finded_organizations[0][0];

  }
  return funder;
}
async function getSector(org) {
  let funder = null;
  let sectors = []

  if (org) {
    for (let i = 0; i < org.length; i++) {
      let data = JSON.stringify({ "text": org[i].name })
      let finded_organizations = await axios({
        method: 'post',
        httpsAgent: agent,
        url: 'https://ai.jtsolution.org/sim-sect',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      });
      finded_organizations = finded_organizations.data
      if (finded_organizations[0][1] > 0.3)
        sectors.push(finded_organizations[0][0])
    }
    if (sectors.length) {

      if (sectors.every((val, i, arr) => val === arr[0])) {
        funder = await Thematiques.find({ name: sectors[0] });
        if (funder) funder = funder[0]._id
      }
      else {
        funder = await Thematiques.find({ name: "Divers" });
        if (funder) funder = funder[0]._id
      }
    }
  }
  return funder;
}
async function country_norm(name) {

  if (name == 'Zaire') name = 'Congo, The Democratic Republic of the'
  let country_id = await Countries.find(FuzzySearch(['name'], name))
  if (country_id) {
    if (country_id.length > 0) return country_id[0]
  }

  return null;
}

async function getAllFunders(orgs) {
  let all_funders = []
  for (let i = 0; i < orgs.length; i++) {
    let data = JSON.stringify({ "text": orgs[i] })
    let finded_organizations = await axios({
      method: 'post',
      httpsAgent: agent,
      url: 'https://ai.jtsolution.org/sim-orgs',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    });
    finded_organizations = finded_organizations.data
    if (finded_organizations.length > 0)
      all_funders.push(finded_organizations[0][0])

  }
  return [...new Set(all_funders)]
}

async function region_undp_countries(code) {

  for (let i = 0; i < undp_regionsDATA.length; i++) {
    if (code == undp_regionsDATA[i].id) {
      let countries_ids = []
      for (let j = 0; j < undp_regionsDATA[i].countries; j++) {
        let tmp = await country_norm(undp_regionsDATA[i].countries[j])
        countries_ids.push(tmp._id)
      }
      return [undp_regionsDATA[i].name, countries_ids]
    }
  }
  return [null, []]
}
async function region_norm(country_code) {
  let code = country_code
  if (code == "Africa") code = "Africa, regional"
  if (code == "South Asia") code = "South Asia, regional"
  if (code == "Africa East") code = "Eastern Africa, regional"
  if (code == "Africa West") code = "Western Africa, regional"
  let country_id = await Regions.find({ region_name: code })

  console.log("region " + country_id)
  if (country_id) {
    if (country_id.length > 0) return country_id[0]
  }

  return country_id;
}

exports.interrupted = async (req, res, next) => {
  const interr = await Params.find({ source_id: "UNDP" })
  return interr[0].interrupted


}

async function containsProject(proj_org_id) {
  let proj = await ProjectPreProd.find({ proj_org_id: proj_org_id })
  return proj.length ? true : null
}

async function getParams() {

  let response = await Params.find({ source_id: "UNDP" });
  if (response[0].interrupted == true)
    return [response[0].offset, response[0].interrupted, response[0].row]
  return [0, response[0].interrupted, 0]

}