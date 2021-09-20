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
const {FuzzySearch}=require('mongoose-fuzzy-search-next');
const regions = require("../models/regions");
const agent = new https.Agent({  
  rejectUnauthorized: false
});



async function undp_project(project){
const source = project.source
const proj_org_id = project.project_id
const name = project.title
const description = project.description
const total_cost = project.expenditure
const budget = project.budget
//country
const country = await country_norm(project.country)
//region

let tmp = await region_undp_countries(project.region_id)
let countis = tmp[1]
let region = tmp[0]


let region_id=await region_norm(region)
region_id=region_id?region_id._id:null
//thematique
const thematique = await getSector(project.sector)
//allfunder
var allfunder = await getAllFunders(project.donor)
const funder =allfunder.length?allfunder[0]:null

if(funder) allfunder.splice(0,1)
const sub_funder = allfunder
//implementer
const implementer = await getImplementer(project.inst_descr)
const actual_end = new Date(project.end)
const actual_start = new Date(project.start)


return [countis,{


    source:source,
    proj_org_id:proj_org_id,
    name:name,
    description:description,
    total_cost:total_cost,
    budget:budget,
    country:country?country._id:null,
    region:region_id,
    thematique:thematique,
    funder:funder, 
    sub_funder:sub_funder,
    implementer:implementer,
    actual_start:actual_start,
    actual_end:actual_end,
    raw_data_org:project
}]
}

exports.getUNDPProjects = async(req, res) => {
    const year = "2021";
    const limit = 100;
    let param = await getParams()
    let interrupted = param[1]
    let skip_off = param[0]
    const url = "https://api.open.undp.org/api/project_list/?year=" + year;
    const resp = await axios.get(url);
    const count = resp.data.data.count;


    try {
        let raw_data = [];
        var offset = -limit;
        for (let i = 0; i < count / 100; i++) {
            // if (i == 2) break;
    
            offset += limit;
            if( interrupted && offset<skip_off) {
              console.log(offset +"  ||  "+ skip_off)
              continue
            }
            const url = "https://api.open.undp.org/api/project_list/?limit=" + limit + "&offset=" + offset + "&year=" + year;
            const res = await axios.get(url);
            const data = res.data.data.data;
            console.log("scrapped offset: " + offset);
    
            for (let i = 0; i < data.length; i++) {
                // if (i == 1) break;
    
                const { project_id, title, description, country, sector, sdg, signature_solution, donor, marker } = data[i];
                const projectUrl = "https://api.open.undp.org/api/projects/" + project_id + ".json";
                const project = await axios.get(projectUrl);
                const projectDetails = project.data;
                const {
                    fiscal_year,
                    end,
                    region_id,
                    operating_unit_id,
                    operating_unit_email,
                    budget,
                    expenditure,
                    start,
                    document_name,
                    project_title,
                    outputs,
                    operating_unit_website,
                    inst_id,
                    inst_descr,
                    inst_type_id,
                    iati_op_i,
                    operating_unit,
                    subnational
                } = projectDetails;
    
                data_model = {
                    "source": "open.undp.org/projects",
                    "project_id": project_id,
                    "title": title,
                    "description": description,
                    "expenditure": expenditure,
                    "budget": budget,
                    "country": country,
                    "sector": sector,
                    "sdg": sdg,
                    "signature_solution": signature_solution,
                    "donor": donor,
                    "marker": marker,
                    // project Details
                    "fiscal_year": fiscal_year,
                    "end": end,
                    "region_id": region_id,
                    "operating_unit_id": operating_unit_id,
                    "operating_unit_email": operating_unit_email,
                    "budget": budget,
                    "expenditure": expenditure,
                    "start": start,
                    "document_name": document_name,
                    "project_title": project_title,
                    "outputs": outputs,
                    "operating_unit_website": operating_unit_website,
                    "inst_id": inst_id,
                    "inst_descr": inst_descr,
                    "inst_type_id": inst_type_id,
                    "iati_op_i": iati_op_i,
                    "operating_unit": operating_unit,
                    "subnational": subnational
                }
                let counts = []
                var project_to_save =null
                 let tmp_proj = await undp_project(data_model)
                 counts = tmp_proj[0]
                 project_to_save = tmp_proj[1]
                 let proj_exist = await containsProject(project_to_save.proj_org_id)
                 if(proj_exist){
                  if(project_to_save.country){
                    await ProjectPreProd.updateOne( {proj_org_id:project_to_save.proj_org_id}, {$set:project_to_save})
                    console.log(project_to_save)
                  }
                  else{
                    if(counts.length==0){
                      await ProjectPreProd.updateOne( {proj_org_id:project_to_save.proj_org_id}, {$set:project_to_save})
                      console.log(project_to_save)
                    }
                    else{
                      for(let c=0;c<counts.length;c++){
                        project_to_save.country = counts[c]
                        await ProjectPreProd.updateOne( {proj_org_id:project_to_save.proj_org_id, coutry:counts[c]}, {$set:project_to_save})
                        
                        console.log(project_to_save)
                      }
                    }}
                    
                 }
                 else{
                if(project_to_save.country){
                  console.log(project_to_save)
                  await new ProjectPreProd(project_to_save).save()
                }
                else{
                  if(counts.length==0){
                    console.log(project_to_save)
                    await new ProjectPreProd(project_to_save).save()
                  }
                  else{
                    for(let c=0;c<counts.length;c++){
                      project_to_save.country = counts[c]
                      console.log(project_to_save)
                      await new ProjectPreProd(project_to_save).save()
                    }
                  }
                }
              }
              await Params.updateOne({source_id:"UNDP"}, {$set:{ interrupted:true, row:i,offset:offset}})
                
            }
            await Params.updateOne({source_id:"UNDP"}, {$set:{ interrupted:true, row:i,offset:offset}})
        }
    } catch (error) {
        console.error(error);
        await Params.updateOne({source_id:"UNDP"}, {$set:{ interrupted:true, row:i,offset:offset,error:error}})
    }
    await Params.updateOne({source_id:"UNDP"}, {$set:{ interrupted:false, row:0,offset:0}})
}

async function getImplementer(iati_org) {
    const funder_object_id = "60c23ffc2b006960f055e8f2";
    let funder = null;
    if (iati_org) {
            let data = JSON.stringify({"text":iati_org})
            let finded_organizations = await axios({
              method: 'post',
              httpsAgent: agent,
              url: 'https://ai.jtsolution.org/sim-orgs',
              headers: { 
                'Content-Type': 'application/json'
              },
              data : data
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
    for(let i = 0; i<org.length;i++){
        let data = JSON.stringify({"text":org[i].name})
        let finded_organizations = await axios({
          method: 'post',
          httpsAgent: agent,
          url: 'https://ai.jtsolution.org/sim-sect',
          headers: { 
          'Content-Type': 'application/json'
          },
          data : data
        }); 
        finded_organizations = finded_organizations.data
         if (finded_organizations[0][1]>0.3)
        sectors.push(finded_organizations[0][0])      
    }
    if(sectors.length){

        if(sectors.every( (val, i, arr) => val === arr[0] )){
            funder = await Thematiques.find({name:sectors[0]});
        if(funder) funder = funder[0]._id
        }
        else{
            funder = await Thematiques.find({name:"Divers"});
        if(funder) funder = funder[0]._id
        }
    }
}
    return funder;
    }
async function country_norm(name) {
	
	if(name == 'Zaire') name = 'Congo, The Democratic Republic of the'
	let country_id = await Countries.find(FuzzySearch(['name'],name))
	if(country_id){
	  if(country_id.length>0) return country_id[0]
	}
	
	return null;
  }

async function getAllFunders(orgs){
    let all_funders = []
    for(let i = 0; i<orgs.length;i++){
        let data = JSON.stringify({"text":orgs[i]})
        let finded_organizations = await axios({
          method: 'post',
          httpsAgent: agent,
          url: 'https://ai.jtsolution.org/sim-orgs',
          headers: { 
            'Content-Type': 'application/json'
          },
          data : data
        }); 
        finded_organizations = finded_organizations.data
        if (finded_organizations.length > 0)
        all_funders.push(finded_organizations[0][0])

    }
    return [ ...new Set(all_funders)] 
}

async function region_undp_countries(code){

  for(let i=0; i< undp_regionsDATA.length;i++){
    if(code == undp_regionsDATA[i].id){
      let countries_ids =[]
      for(let j=0;j< undp_regionsDATA[i].countries;j++){
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
	if(code == "Africa") code="Africa, regional"
	if(code == "South Asia") code="South Asia, regional"
	if(code == "Africa East") code = "Eastern Africa, regional"
	if(code == "Africa West") code = "Western Africa, regional"
	let country_id = await Regions.find({region_name:code})
  
	console.log("region "+country_id)
	if(country_id){
	  if(country_id.length>0) return country_id[0]
	}
	
	return country_id;
  }

  exports.interrupted = async (req, res, next) => {
    const interr = await Params.find({source_id:"UNDP"})
    return interr[0].interrupted
  
  
  }

  async function containsProject(proj_org_id){
    let proj = await ProjectPreProd.find({proj_org_id:proj_org_id})
    return proj.length? true : null
  }

  async function getParams() {

    let response = await Params.find({source_id:"UNDP"});
    if(response[0].interrupted == true)
    return [response[0].offset, response[0].interrupted, response[0].row]
    return [0, response[0].interrupted, 0]
    
    }