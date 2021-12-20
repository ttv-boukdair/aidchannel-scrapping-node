const axios = require("axios");
const https = require('https');
const jsdom = require("jsdom");
var Organization = require("../models/organization");
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
const { title } = require("process");
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
 const source = 'www.ifad.org'
 for(let c=0;c<country_codes.length;c++){

   console.log(url+country_codes[c].num)
  let resp = await axios.get(url+country_codes[c].num)
  var dom = new JSDOM(resp.data)
  var raw_links = dom.window.document.querySelectorAll("div > div > a")
  let links = Array.from(raw_links, a => {var link = a.getAttribute('href'); if(link.includes("https://www.ifad.org/en/web/operations/-/project/")) return link})
  for(let l=0; l<links.length;l++){
    if(links[l]){
      let data = await axios.get(links[l])
      var dom2 = new JSDOM(data.data)
      let title = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-6.col-md-12.pub-header > h1")?.textContent
      let description = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-6.col-md-12.pub-header > div > p")?.textContent
      description?'':description = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-6.col-md-12.pub-header > div > div > p:nth-child(1)")?.textContent 
      let status = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd.project-status.mt-3 > span")?.textContent.split(':')[1].replace(/\n/g,'').replace(/\s/g,'')
      if(status=='Closed') continue
      let approval_date = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(5)")?.textContent
      let duration = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(7)")?.textContent
      let thematique = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(9)")?.textContent
      let total_cost = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(11)")?.textContent.replace(/\n/g,'').replace(/\s\s+/g,'')
      let ifad_financing = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(13)")?.textContent
      let cofinancing_international = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(15)")?.textContent
      let cofinancing_national = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(17)")?.textContent
      let projet_id = parseInt(dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(22)")?.textContent)?dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(22)")?.textContent:dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(20)")?.textContent
      let proj_exist = await containsProject(projet_id, source)
      if(proj_exist) break
      let contact_name = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(24) > a")?.textContent
      let contact_email = dom2.window.document.querySelector("#portlet_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_m0cwVj77Siqd > div > div.portlet-content-container > div > div > div.asset-content.mb-3 > div > div > div > div > div > div.col-lg-5.col-md-12.offset-lg-1 > div > div > dd:nth-child(24) > a")?.getAttribute('href').split(':')[1]
      let raw_data = {
        source:source,
        source_id:projet_id,
        title:title,
        description:description,
        status:status,
        approval_date:approval_date,
        duration:duration,
        thematique:thematique,
        total_cost:total_cost,
        ifad_financing:ifad_financing,
        cofinancing_international:cofinancing_international,
        cofinancing_national:cofinancing_national,
        contact_name:contact_name,
        contact_email:contact_email,
        country:country_codes[c].code,
        project_url:links[l],
      }

      let p = await projNorm(raw_data)
      
      await p.save()
    }

  }

 }
 console.log("Done!!!")
}


async function projNorm(p){
  let data = {}
  data.raw_data_org = p
  data.name = p.title
  data.source = p.source
  data.proj_org_id = p.source_id
  data.description = p.description
  data.status = await getStatus(p.status)
  data.approval_date = new Date(p.approval_date)
  data.actual_start = new Date(p.approval_date)
  data.actual_end = new Date(p.duration.split('-')[1].replace(' ',''))
  data.planned_end = new Date(p.duration.split('-')[1].replace(' ',''))
  data.thematique = await getSector(p.thematique)
  data.total_cost = p.total_cost
  data.budget = p.total_cost
  data.funder = await getFunder("International Fund for Agricultural Development")
  data.country = (await Countries.findOne({code:p.country}))._id
  if(p.contact_email!=null) data.task_manager = await getUser(p.contact_email,p.contact_name)
  data.project_url = p.project_url
  let proj = new ProjectPreProd(data)
  return proj
}



async function getUser(email,fullname) {
  
let u = await user.findOne({email:email})
console.log(email,fullname)
if(u) return u._id
u = new user({email:email, fullname:fullname})
await u.save()
u = await user.findOne({email:email})
return u._id
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

  if (org) {

      let data = JSON.stringify({ "text": org })
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
          funder = await Thematiques.find({ name: finded_organizations[0][0] });
      if (funder) funder = funder[0]._id



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

async function getFunder(org) {
  let funder = null;

  if (org) {

      let data = JSON.stringify({ "text": org })
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

async function getStatus(s) {
  try {
      let stat = await Status.findOne({ name: s.toLowerCase() })
      return stat._id
  }
  catch (e) {
      return null
  }
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

async function containsProject(proj_org_id, source) {
  let proj = await ProjectPreProd.find({ proj_org_id: proj_org_id, source: source })
  return proj.length ? true : false
}

async function getParams() {

  let response = await Params.find({ source_id: "UNDP" });
  if (response[0].interrupted == true)
    return [response[0].offset, response[0].interrupted, response[0].row]
  return [0, response[0].interrupted, 0]

}