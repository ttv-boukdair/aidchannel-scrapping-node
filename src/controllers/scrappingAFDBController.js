const axios = require("axios");
const https = require('https');
const jsdom = require("jsdom");
var Organization = require("../models/organization");
var User = require("../models/user2");
var Status = require("../models/status");
var Countries = require("../models/country");
var Thematiques = require("../models/thematiques");
const { JSDOM } = jsdom;
var ProjectAI = require("../models/projectai");
var SectorsDATA = require("../data/sectors.json");
var africa_regionsDATA = require("../data/africa_regions.json");
const { json } = require("body-parser");
const user = require("../models/user2");
var Regions = require("../models/regions");
const Projectpreprod = require("../models/projectpreprod");
const { errors } = require("puppeteer");
const agent = new https.Agent({  
  rejectUnauthorized: false
});
const Params = require("../models/params");
const projectpreprod = require("../models/projectpreprod");

async function getParams() {

  let response = await Params.find({source_id:"AFDB"});
  if(response[0].interrupted == true)
  return [response[0].offset, response[0].interrupted, response[0].row]
  return [0, response[0].interrupted, 0]
  
}

exports.interrupted = async (req, res, next) => {
  const interr = await Params.find({source_id:"AFDB"})
  return interr[0].interrupted


}
async function docs_number() {
  const link = "https://projectsportal.afdb.org/dataportal/VProject/list?format=html&countryId=&source=&status=&sector=&sovereign=&year=&specialBond=&covidBox=&offset=0&max=1&sort=startDate&order=desc"
  let response = await axios(link);
      var dom =  new JSDOM(response.data);
      console.log(dom)
  return dom.window.document.querySelector("#divContent > div:nth-child(3) > ul > li:nth-child(13) > a").textContent
}


/*  Updating AFDB */
exports.putAFDBProjects = async (req, res, next) => {
  let param = await getParams()
  let skip_off = param[0]
  let interrupted = param[1]
  //url collecte n projets
  const max = 100;
  var offset = 0;
  const docs = await docs_number();
  var to_stop = false;
  const date_stop = new Date('2000-01-01T00:00:00Z')
  var json_data = null;
  const url_proj_base = 'https://projectsportal.afdb.org/dataportal/VProject/show/';
  var url_proj = null;
  const url_base = 
    "https://projectsportal.afdb.org/dataportal/VProject/list?countryId=&source=&status=&sector=&sovereign=&year=&specialBond=&covidBox=&offset=";
  var links = []
  for(let i=0; i<docs; i++){
    offset = (i*max);
    
    if(to_stop){
      break
    }
    // SKIP SCRAPPED
    if(interrupted && offset<skip_off) {
      console.log(offset +" || "+skip_off)
      continue}

    var url_item = url_base+offset+"&max="+max+"&sort=startDate&order=desc&lang=en"

    let response = await axios.get(url_item, {
      headers: { 'User-Agent':'Axios 0.21.1' }
    });
    json_data = response.data
    
    for(let j=0; j<json_data.length; j++){
      try{
      let proj_org_id = json_data[j].projectCodeSap
      url_proj = url_proj_base+json_data[j].projectCodeSap+'?format=html&lang=en'

      let raw_data = json_data[j]
      let source = json_data[j].class
      let source_id = json_data[j].iatiIdentifier
      let status = await iati_status_norm(json_data[j].statusCode)
      let country = null
      let region = null
      if(["Z1","Z2"].includes(json_data[j].countryCode)){ region = await iati_region_norm("298")
                                                           country= region.countries}
      else{country = await iati_country_norm(json_data[j].countryCode)}
      let name = json_data[j].titleEn
      let namefr = json_data[j].titleFr
      let total_cost = "U.A "+json_data[j].comAmount
      let sector = await iati_sector_norm(json_data[j].dacSectorCode)
      let approval_date = json_data[j].startDate ? new Date(json_data[j].startDate) : null
      let actual_start = json_data[j].actualStartDate ? new Date(json_data[j].actualStartDate) : null
      let actual_end = json_data[j].actualEndDate ? new Date(json_data[j].actualEndDate) : null
      let planned_end = json_data[j].endDate ? new Date(json_data[j].endDate) : null
      let task_manager = await get_user(json_data[j].taskManagerName, json_data[j].taskManagerEmail)
      let maj_date = json_data[j].majDate

      if(approval_date.getFullYear()<date_stop.getFullYear()){
        console.log("WTH "+approval_date.toString()+' '+date_stop.toString()+" : "+(approval_date<date_stop))
        to_stop = true
        break
      }
      let response2 = await axios(url_proj);
      var dom =  new JSDOM(response2.data);
      var img = dom.window.document.querySelector("#myCarousel > div > div > img")
      let image_url = get_image_src(img)
      let all_descriptions = await get_all_descriptions(dom)
      let description  = null
      let objectives = null
      let beneficiaries = null
      try{
      description = get_specific_desc('Project General Description',all_descriptions)
      objectives = get_specific_desc('Project Objectives',all_descriptions)
      beneficiaries = get_specific_desc('Beneficiaries',all_descriptions)}
      catch{
        console.log('!!!!!!!!!!!!!!!!!!!!!! '+all_descriptions+' !!!!!!!!!!!!!!!!!!!!!!')
      }
      let orgs = get_all_orgs(all_descriptions.length, dom)
      let all_orgs = get_all_orgs(all_descriptions.length, dom)
      console.log(all_orgs)
      raw_data['orgs']=all_orgs
      let funder = await getFunder(orgs)
      let implementer = await getImplementer(orgs)
      let sub_funder = await getSubFunder(orgs, funder)
      let sub_implementer = await getSubImplementer(orgs, implementer)
      
      let translate_name= name ? false : true
      
      raw_data.descriptions = all_descriptions
      if(await containsProject(source_id)){
        if(country.length>0){
          for(let c = 0; c < country.length; c++){
         let project_to_update = await ProjectAI.find({source_id: source_id, country:country[c]})
         
         project_to_update = project_to_update[0]
         project_to_update.source=source
         project_to_update.proj_org_id= proj_org_id
          project_to_update.source_id= source_id
          project_to_update.name= name
          project_to_update.namefr=namefr
          project_to_update.description= description
          project_to_update.beneficiaries=beneficiaries
          project_to_update.objectives=objectives
          project_to_update.image_url=image_url
          project_to_update.funder= funder
          project_to_update.implementer= implementer
          project_to_update.sub_funder=sub_funder
          project_to_update.sub_implementer=sub_implementer
          project_to_update.status=status
          project_to_update.country=country[c]._id
          project_to_update.region=region._id
          project_to_update.thematique=sector
          project_to_update.total_cost=total_cost
          project_to_update.approval_date=approval_date
          project_to_update.actual_start=actual_start
          project_to_update.actual_end=actual_end
          project_to_update.planned_end=planned_end
          project_to_update.task_manager=task_manager
          project_to_update.translate_name=translate_name
          project_to_update.maj_date=maj_date
          project_to_update.raw_data_org=raw_data
          
        project_to_update.save()
        console.log(project_to_update+"\nUPDATE")}
      }
        else{
          let project_to_update = await ProjectAI.find({source_id: source_id})
          
          project_to_update = project_to_update[0]
          project_to_update.source=source
          project_to_update.source_id= source_id
          project_to_update.proj_org_id= proj_org_id
          project_to_update.name= name
          project_to_update.namefr=namefr
          project_to_update.description= description
          project_to_update.beneficiaries=beneficiaries
          project_to_update.objectives=objectives
          project_to_update.image_url=image_url
          project_to_update.funder= funder
          project_to_update.implementer= implementer
          project_to_update.sub_funder=sub_funder
          project_to_update.sub_implementer=sub_implementer
          project_to_update.status=status
          project_to_update.country=country._id
          project_to_update.thematique=sector
          project_to_update.total_cost=total_cost
          project_to_update.approval_date=approval_date
          project_to_update.actual_start=actual_start
          project_to_update.actual_end=actual_end
          project_to_update.planned_end=planned_end
          project_to_update.task_manager=task_manager
          project_to_update.translate_name=translate_name
          project_to_update.maj_date=maj_date
          project_to_update.raw_data_org=raw_data
         project_to_update.save()
        console.log(project_to_update+"\nUPDATE")
        }
      }
      else{
      if(country.length>0){
      for(let c = 0; c < country.length; c++){
       
      const project_to_save = new ProjectAI({
        source:source,
        source_id: source_id,
        proj_org_id: proj_org_id,
        name: name,
        namefr:namefr,
        description: description,
        beneficiaries:beneficiaries,
        objectives:objectives,
        image_url:image_url,
        funder: funder,
        implementer: implementer,
        sub_funder:sub_funder,
        sub_implementer:sub_implementer,
        status:status,
        country:country[c]._id,
        region:region._id,
        thematique:sector,
        total_cost:total_cost,
        approval_date:approval_date,
        actual_start:actual_start,
        actual_end:actual_end,
        planned_end:planned_end,
        task_manager:task_manager,
        translate_name:translate_name,
        maj_date:maj_date,
        raw_data_org:raw_data
      });
      console.log(project_to_save+"\nNEW")
     project_to_save.save()
    }}
    else{
      const project_to_save = new ProjectAI({
        source:source,
        source_id: source_id,
        proj_org_id: proj_org_id,
        name: name,
        namefr:namefr,
        description: description,
        beneficiaries:beneficiaries,
        objectives:objectives,
        image_url:image_url,
        funder: funder,
        implementer: implementer,
        sub_funder:sub_funder,
        sub_implementer:sub_implementer,
        status:status,
        country:country._id,
        thematique:sector,
        total_cost:total_cost,
        approval_date:approval_date,
        actual_start:actual_start,
        actual_end:actual_end,
        planned_end:planned_end,
        task_manager:task_manager,
        translate_name:translate_name,
        maj_date:maj_date,
        raw_data_org:raw_data
      });
      console.log(project_to_save+"\nNEW")
    project_to_save.save()
    }
    }
    await Params.updateOne({source_id:"AFDB"}, {$set:{ interrupted:true, row:j,offset:offset}})
  }catch(error){
    console.log(error)
  }
  await Params.updateOne({source_id:"AFDB"}, {$set:{ interrupted:true, row:j,offset:offset}})
  }
  
  await Params.updateOne({source_id:"AFDB"}, {$set:{ interrupted:false, row:0,offset:0}})

  }
  

 res.status(200).json("working in bg");
    console.log("update AFDB projects operation")
};


/* NEW AFDB Prjects */
exports.newAFDBProjects = async (req, res, next) => {

  //url collecte n projets
  const max = 100;
  var offset = 0;
  const docs = await docs_number();
  var to_stop = false;
  const date_stop = new Date('2000-01-01T00:00:00Z')
  var json_data = null;
  const url_proj_base = 'https://projectsportal.afdb.org/dataportal/VProject/show/';
  var url_proj = null;
  const url_base = 
    "https://projectsportal.afdb.org/dataportal/VProject/list?countryId=&source=&status=&sector=&sovereign=&year=&specialBond=&covidBox=&offset=";
  var links = []
  for(let i=0; i<docs; i++){
    offset = offset+ (i*max);
    if(to_stop){
      break
    }

    var url_item = url_base+offset+"&max="+max+"&sort=startDate&order=desc&lang=en"

    let response = await axios.get(url_item, {
      headers: { 'User-Agent':'Axios 0.21.1' }
    });
    json_data = response.data
    
    for(let j=0; j<json_data.length; j++){
      let proj_org_id = json_data[j].projectCodeSap
      url_proj = url_proj_base+json_data[j].projectCodeSap+'?format=html&lang=en'

      let raw_data = json_data[j]
      let source = json_data[j].class
      let source_id = json_data[j].iatiIdentifier
      let status = await iati_status_norm(json_data[j].statusCode)
      let country = null
      let region = null
      if(["Z1","Z2"].includes(json_data[j].countryCode)){ region = await iati_region_norm("298")
                                                           country= region.countries}
      else{country = await iati_country_norm(json_data[j].countryCode)}
      let name = json_data[j].titleEn
      let namefr = json_data[j].titleFr
      let total_cost = "U.A "+json_data[j].comAmount
      let sector = await iati_sector_norm(json_data[j].dacSectorCode)
      let approval_date = json_data[j].startDate ? new Date(json_data[j].startDate) : null
      let actual_start = json_data[j].actualStartDate ? new Date(json_data[j].actualStartDate) : null
      let actual_end = json_data[j].actualEndDate ? new Date(json_data[j].actualEndDate) : null
      let planned_end = json_data[j].endDate ? new Date(json_data[j].endDate) : null
      let task_manager = await get_user(json_data[j].taskManagerName, json_data[j].taskManagerEmail)
      let maj_date = json_data[j].majDate

      if(approval_date.getFullYear()<date_stop.getFullYear()){
        console.log("WTH "+approval_date.toString()+' '+date_stop.toString()+" : "+(approval_date<date_stop))
        to_stop = true
        break
      }
      let response2 = await axios(url_proj);
      var dom =  new JSDOM(response2.data);
      var img = dom.window.document.querySelector("#myCarousel > div > div > img")
      let image_url = get_image_src(img)
      let all_descriptions = await get_all_descriptions(dom)
      let description  = null
      let objectives = null
      let beneficiaries = null
      try{
      description = get_specific_desc('Project General Description',all_descriptions)
      objectives = get_specific_desc('Project Objectives',all_descriptions)
      beneficiaries = get_specific_desc('Beneficiaries',all_descriptions)}
      catch{
        console.log('!!!!!!!!!!!!!!!!!!!!!! '+all_descriptions+' !!!!!!!!!!!!!!!!!!!!!!')
      }
      let orgs = get_all_orgs(all_descriptions.length, dom)
      let all_orgs = get_all_orgs(all_descriptions.length, dom)
      console.log(all_orgs)
      raw_data['orgs']=all_orgs
      let funder = await getFunder(orgs)
      let implementer = await getImplementer(orgs)
      let sub_funder = await getSubFunder(orgs, funder)
      let sub_implementer = await getSubImplementer(orgs, implementer)
      
      let translate_name= name ? false : true
      
      raw_data.descriptions = all_descriptions
      let proj_exist =await containsProject(source_id)
      console.log(proj_exist)
      if(proj_exist){
          console.log("DONE !!!!!!!!!!!!!!!!!!")
          to_stop =true
          break
      }
      else{
      if(country.length>0){
      for(let c = 0; c < country.length; c++){
       
      const project_to_save = new ProjectAI({
        source:source,
        source_id: source_id,
        proj_org_id: proj_org_id,
        name: name,
        namefr:namefr,
        description: description,
        beneficiaries:beneficiaries,
        objectives:objectives,
        image_url:image_url,
        funder: funder,
        implementer: implementer,
        sub_funder:sub_funder,
        sub_implementer:sub_implementer,
        status:status,
        country:country[c]._id,
        region:region._id,
        thematique:sector,
        total_cost:total_cost,
        approval_date:approval_date,
        actual_start:actual_start,
        actual_end:actual_end,
        planned_end:planned_end,
        task_manager:task_manager,
        translate_name:translate_name,
        maj_date:maj_date,
        raw_data_org:raw_data
      });
      console.log(project_to_save+"\nNEW")
     project_to_save.save()
    }}
    else{
      const project_to_save = new ProjectAI({
        source:source,
        source_id: source_id,
        proj_org_id: proj_org_id,
        name: name,
        namefr:namefr,
        description: description,
        beneficiaries:beneficiaries,
        objectives:objectives,
        image_url:image_url,
        funder: funder,
        implementer: implementer,
        sub_funder:sub_funder,
        sub_implementer:sub_implementer,
        status:status,
        country:country._id,
        thematique:sector,
        total_cost:total_cost,
        approval_date:approval_date,
        actual_start:actual_start,
        actual_end:actual_end,
        planned_end:planned_end,
        task_manager:task_manager,
        translate_name:translate_name,
        maj_date:maj_date,
        raw_data_org:raw_data
      });
      console.log(project_to_save+"\nNEW")
    project_to_save.save()
    }
    }}
    
    //console.log(response.data)
    //console.log(response2.data)
    
  }
  

};

async function containsProject(source_id){
  let proj = await ProjectAI.find({source_id:source_id})
  return proj.length? true : null
}
/*  SCRAPPING AFDB */
exports.getAFDBProjects = async (req, res, next) => {
  //url collecte n projets
  const max = 100;
  var offset = 2896;
  const docs = 49;
  var to_stop = false;
  const date_stop = new Date('2000-01-01T00:00:00Z')
  var json_data = null;
  const url_proj_base = 'https://projectsportal.afdb.org/dataportal/VProject/show/';
  var url_proj = null;
  const url_base = 
    "https://projectsportal.afdb.org/dataportal/VProject/list?countryId=&source=&status=&sector=&sovereign=&year=&specialBond=&covidBox=&offset=";
  var links = []
  for(let i=0; i<docs; i++){
    offset = offset+ (i*max);
    if(to_stop){
      break
    }

    var url_item = url_base+offset+"&max="+max+"&sort=startDate&order=desc&lang=en"

    let response = await axios.get(url_item, {
      headers: { 'User-Agent':'Axios 0.21.1' }
    });
    json_data = response.data
    
    for(let j=0; j<json_data.length; j++){
      
      url_proj = url_proj_base+json_data[j].projectCodeSap+'?format=html&lang=en'


      let source = json_data[j].class
      let source_id = json_data[j].iatiIdentifier
      let status = await iati_status_norm(json_data[j].statusCode)
      let country = await iati_country_norm(json_data[j].countryCode, source_id)
      let name = json_data[j].titleEn
      let namefr = json_data[j].titleFr
      let total_cost = "U.A "+json_data[j].comAmount
      let sector = await iati_sector_norm(json_data[j].dacSectorCode)
      let approval_date = json_data[j].startDate ? new Date(json_data[j].startDate) : null
      let actual_start = json_data[j].actualStartDate ? new Date(json_data[j].actualStartDate) : null
      let actual_end = json_data[j].actualEndDate ? new Date(json_data[j].actualEndDate) : null
      let planned_end = json_data[j].endDate ? new Date(json_data[j].endDate) : null
      let task_manager = await get_user(json_data[j].taskManagerName, json_data[j].taskManagerEmail)

      if(approval_date<date_stop){
        to_stop = true
        break
      }
      let response2 = await axios(url_proj);
      var dom =  new JSDOM(response2.data);
      var img = dom.window.document.querySelector("#myCarousel > div > div > img")
      let image_url = get_image_src(img)
      let all_descriptions = await get_all_descriptions(dom)
      let description  = null
      let objectives = null
      let beneficiaries = null
      try{
      description = get_specific_desc('Project General Description',all_descriptions)
      objectives = get_specific_desc('Project Objectives',all_descriptions)
      beneficiaries = get_specific_desc('Beneficiaries',all_descriptions)}
      catch{
        console.log('!!!!!!!!!!!!!!!!!!!!!! '+all_descriptions+' !!!!!!!!!!!!!!!!!!!!!!')
      }
      let orgs = get_all_orgs(all_descriptions.length, dom)
      let funder = await getFunder(orgs)
      let implementer = await getImplementer(orgs)
      let sub_funder = await getSubFunder(orgs, funder)
      let sub_implementer = await getSubImplementer(orgs, implementer)
      let translate_name= name ? false : true
      if(country.length>0){
      for(let c = 0; c < country.length; c++){
      const project_to_save = new ProjectAI({
        source:source,
        source_id: source_id,
        name: name,
        namefr:namefr,
        description: description,
        beneficiaries:beneficiaries,
        objectives:objectives,
        image_url:image_url,
        funder: funder,
        implementer: implementer,
        sub_funder:sub_funder,
        sub_implementer:sub_implementer,
        status:status,
        country:country[c],
        thematique:sector,
        total_cost:total_cost,
        approval_date:approval_date,
        actual_start:actual_start,
        actual_end:actual_end,
        planned_end:planned_end,
        task_manager:task_manager,
        translate_name:translate_name
      });
      console.log(project_to_save)
     // project_to_save.save()
    }}
    else{
      const project_to_save = new ProjectAI({
        source:source,
        source_id: source_id,
        name: name,
        namefr:namefr,
        description: description,
        beneficiaries:beneficiaries,
        objectives:objectives,
        image_url:image_url,
        funder: funder,
        implementer: implementer,
        sub_funder:sub_funder,
        sub_implementer:sub_implementer,
        status:status,
        country:null,
        thematique:sector,
        total_cost:total_cost,
        approval_date:approval_date,
        actual_start:actual_start,
        actual_end:actual_end,
        planned_end:planned_end,
        task_manager:task_manager,
        translate_name:translate_name
      });
      console.log(project_to_save)
     // project_to_save.save()
    }
    }
    
    //console.log(response.data)
    //console.log(response2.data)
    
  }
  

  res.status(200).json("working in bg");
};


function get_all_descriptions(dom){
  const headers = ['Project General Description', 'Project Objectives', 'Beneficiaries']
  var descriptions = []
  var head_tmp = null
  var desc_tmp = null
  for(let i = 3; i <= 6; i++){
    head_tmp = dom.window.document.querySelector("#home > div > div > div > div.col-md-8 > div:nth-child("+i+") > h3" );
    if(head_tmp == null){
      break
    }
    else{
      if(headers.includes(head_tmp.textContent)){
        desc_tmp = dom.window.document.querySelector("#home > div > div > div > div.col-md-8 > div:nth-child("+i+") > p" ).textContent;
        descriptions.push([head_tmp.textContent, desc_tmp])
      }
    }

  }
  return descriptions
}

function get_all_orgs(offset, dom){
  offset+=3
  const max_orgs = 20;
  var all_orgs = []
  var header_tmp = dom.window.document.querySelector("#home > div > div > div > div.col-md-8 > div:nth-child("+offset+") > h3" );
  if(header_tmp == null){
    return all_orgs
  }
  if(header_tmp.textContent == 'Participating Organization'){
    for(let i = 1; i <= max_orgs; i++){
    let role = dom.window.document.querySelector("#home > div > div > div > div.col-md-8 > div:nth-child("+offset+") > table > tbody > tr:nth-child("+i+") > td > div > div.col-md-4 > div > strong");
    let org = dom.window.document.querySelector("#home > div > div > div > div.col-md-8 > div:nth-child("+offset+") > table > tbody > tr:nth-child("+i+") > td > div > div.col-md-8 > span");
    if(role == null || org == null){
      break
    }
    all_orgs.push([role.textContent.replace(/^\s+|\s+$/g, '').replace('\t','').replace('\n',''), org.textContent.replace(/^\s+|\s+$/g, '').replace('\t','').replace('\n','')])
    }    
  }
  return all_orgs
}
function get_specific_desc(specific, all_desc){
  if(all_desc.length == 0){
    return null
  }
  for(let i=0; i<all_desc.length; i++){
    if(all_desc[i][0] == specific){
      return all_desc[i][1]
    }
  } 
  return null
}
function get_image_src(img){
  if(img != null){
    return img.src
  }
  return null
}


async function iati_country_norm(country_code) {
  let code = country_code
  if(code == 'ZR') code = 'CD'
  let country_id = await Countries.find({code:code})
  if(country_id){
    if(country_id.length>0) return country_id[0]
  }
  
  
  return null;
}

async function iati_region_norm(country_code) {
  let code = country_code
  let country_id = await Regions.find({region_code:code})

  console.log(country_id)
  if(country_id){
    if(country_id.length>0) return country_id[0]
  }
  
  return country_id;
}

async function iati_sector_norm(sector_code) {
  let sector_id = null;
  if(sector_code == null){
    return null
  }
  
  for (let i=0; i< SectorsDATA.length; i++) {
    if(sector_code == SectorsDATA[i].IATI){
      sector_id = await Thematiques.find({name:SectorsDATA[i].AID})
      if(sector_id!=null){
    
      if(sector_id.length>0){sector_id = sector_id[0]._id}
      else{
        sector_id=null
      }}
      
      break
    }
  }
  return sector_id;
}

async function iati_status_norm(status_code) {
  statuses = [['completed','3'], ['closed','4'], ['identification','1'], ['approved',''], ['lending',''], ['ongoing','2'],['cancelled','5'],['suspended','6']]
  let status_id = null;
  var status_tmp = null;

  for(let i=0 ; i<statuses.length ; i++){
    if(status_code == statuses[i][1]){
      status_tmp = statuses[i][0]
      status_id = await Status.find({name:status_tmp})
      status_id = status_id[0]._id
      break
    }
  }
  return status_id;
}



async function getFunder(iati_org) {
  const funder_object_id = "60c23ffc2b006960f055e8ef";
  let funder = null;
  if (iati_org) {
    //console.log(iati_org)
    if (iati_org.length > 0) {
      for (let i = 0; i < iati_org.length; i++) {
        if(iati_org[i][0] == 'Funding'){
          let data = JSON.stringify({"text":iati_org[i][1]})
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
          iati_org.splice(i, 1)
        if (finded_organizations.length > 0)
          funder = finded_organizations[0][0];
        break
        // else funder = "not exist";
      }
    }
    }
  }
  return funder;
}
async function getSubFunder(iati_org, funder) {
  const funder_object_id = "60c23ffc2b006960f055e8ef";
  let sub_funder = [];
  if (iati_org) {
    if (iati_org.length > 0) {
      for (let i = 0; i < iati_org.length; i++) {
        if(iati_org[i][0] == 'Funding' || iati_org[i][0] == 'Extending'){
          let data = JSON.stringify({"text":iati_org[i][1]})
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
          iati_org.splice(i, 1)
        if (finded_organizations.length > 0)
          sub_funder.push(finded_organizations[0][0])
        
          
        // else funder = "not exist";
      }
    }
    }
  }
  return sub_funder;
}
async function getImplementer(iati_org) {
  const funder_object_id = "60c23ffc2b006960f055e8f2";
  let funder = null;
  if (iati_org) {
    if (iati_org.length > 0) {
      for (let i = 0; i < iati_org.length; i++) {
        if(iati_org[i][0] == 'Implementing'){
          let data = JSON.stringify({"text":iati_org[i][1]})
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
          iati_org.splice(i, 1)
        if (finded_organizations.length > 0)
          funder = finded_organizations[0][0];
        break
        // else funder = "not exist";
      }}
    }
  }
  return funder;
}
async function getSubImplementer(iati_org, implemeter) {
  const implemeter_object_id = "60c23ffc2b006960f055e8f2";
  let sub_funder = [];
  if (iati_org) {
    if (iati_org.length > 0) {
      for (let i = 0; i < iati_org.length; i++) {
        if(iati_org[i][0] == 'Implementing' || iati_org[i][0] == 'Accountable'){
          let data = JSON.stringify({"text":iati_org[i][1]})
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
          iati_org.splice(i, 1)
        if (finded_organizations.length > 0)
          sub_funder.push(finded_organizations[0][0])
        
          
        // else implemeter = "not exist";
      }
    }
    }
  }
  return sub_funder;
}
async function get_user(fullname, email) {
  let user_id = null;
  let found_user = await User.find({ fullname:fullname, email:email });
  if (found_user.length > 0){
  user_id = found_user[0]._id;}
  else{
  let tmp_user = new User({fullname:fullname, email:email})
  tmp_user.save()
  let found_user = await User.find({ fullname:fullname, email:email });
  if (found_user.length > 0) user_id = found_user[0]._id;
        }
  return user_id;
}




async function iati_status_norm(status_code) {
  statuses = [['completed','3'], ['closed','4'], ['identification','1'], ['approved',''], ['lending',''], ['ongoing','2'],['cancelled','5'],['suspended','6']]
  let status_id = null;
  var status_tmp = null;

  for(let i=0 ; i<statuses.length ; i++){
    if(status_code == statuses[i][1]){
      status_tmp = statuses[i][0]
      status_id = await Status.find({name:status_tmp})
      status_id = status_id[0]._id
      break
    }
  }
  return status_id;
}



