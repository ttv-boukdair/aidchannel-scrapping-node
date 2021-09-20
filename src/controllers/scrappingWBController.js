//const axios = require("axios");
var Organization = require("../models/organization")
const https = require('https');
const axios = require("axios");
const agent = new https.Agent({  
	rejectUnauthorized: false
  });
var Status = require("../models/status");
var Countries = require("../models/country");
var Regions = require("../models/regions");
var User = require("../models/user2");
const puppeteer = require("puppeteer");

var Thematiques = require("../models/thematiques");
var ProjectAI = require("../models/projectai");
var ProjectPreProd = require("../models/projectpreprod");
const {FuzzySearch}=require('mongoose-fuzzy-search-next');
const { link } = require("fs");
const country = require("../models/country");
const { off } = require("../models/country");

const Params = require("../models/params");
const thematiques = require("../models/thematiques");


async function getInfoProject(link){
	console.log("inside");

	var browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    var page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    await page.goto(link, { waitUntil: 'networkidle2' });

    let info = await page.evaluate(() => {


    	
    	var title = document.querySelector("h1#projects-title");
    	var objective = document.querySelector("div.more._loop_lead_paragraph_sm");
    	var country = document.querySelectorAll("p.document-info")[4];
    	var status = document.querySelectorAll("p.document-info")[1];
    	var task_manager = document.querySelectorAll("p.document-info")[2];
    	var region = document.querySelectorAll("p.document-info")[9];
    	var total_cost = document.querySelectorAll("p.document-info")[11];
    	var approval_date_str = document.querySelectorAll("p.document-info")[6];
    	var project_id = document.querySelectorAll("p.document-info")[0];
    	var closed_date = document.querySelectorAll("p.document-info")[14];
    	var last_update_date = document.querySelectorAll("p.document-info")[13];
    	var implementer = document.querySelectorAll("p.document-info")[8];
    	var thematique =document.querySelector("div#accordion-theme");
    	var source_financing = document.querySelector("div.c14v1-body.c14v1-body-text.responsive-table.table-arrow-hide.project-opt-table").querySelectorAll("td[data-th='Financier:']") ; 
    	if(thematique == null){
    		thematique = null;
    	}
    	else if (thematique.querySelectorAll("div.table-accordion-btn.collapsed")[0] != null){
    		thematique = thematique.querySelectorAll("div.table-accordion-btn.collapsed")[0].querySelector("span").innerText;
    	}
    	else {
    		thematique = Array.from(thematique.querySelectorAll("div.table-accordion-btn > span"),el => el.innerText);
    	}
		var proj_org_id = project_id.innerText 
		var source = "projects.worldbank.org"
		var name = title.innerText

		//country_id
		country = country.innerText== "N/A" ? null : country.innerText
		var objectives = objective == null ? null : objective.innerText
		status = status.innerText== "N/A" ? null : status.innerText
		region =  region.innerText== "N/A" ? null : region.innerText
		total_cost = total_cost.innerText== "N/A" ? null :total_cost.innerText
		var approval_date = approval_date_str.innerText== "N/A" ? null : approval_date_str.innerText
		var planned_end = closed_date.innerText == "N/A" ? null : closed_date.innerText
		var maj_date = last_update_date.innerText == "N/A" ? null : last_update_date.innerText
		task_manager = task_manager.innerText== "N/A" ? null :task_manager.innerText
		thematique = thematique
		implementer = implementer.innerText == "N/A" ? null : implementer.innerText
		var funder_orgs =  Array.from(source_financing, elt => elt.innerText)
		var funder = funder_orgs? funder_orgs[0]: null
		if(funder) funder_orgs.splice(0,1)
		var sub_funder = funder_orgs
		var raw_data = {
			source:source,
			source_id: "44000-"+proj_org_id,
			proj_org_id:proj_org_id,
            name: name,
            funder: funder,
            implemeter: implementer,
            sub_funder: sub_funder,
            objectives:objectives,
            status: status,
            country: country,
            region: region,
            thematique: thematique,
            total_cost: total_cost,
            approval_date: approval_date,
            planned_end: planned_end,
            maj_date: maj_date,
            task_manager: task_manager,
		}


		
		 let project_to_save ={ 
			source:source,
			source_id: "44000-"+proj_org_id,
			proj_org_id:proj_org_id,
            name: name,
            funder: funder,
            implemeter: implementer,
            sub_funder: sub_funder,
            objectives:objectives,
            status: status,
            country: country,
            region: region,
            thematique: thematique,
            total_cost:total_cost,
            approval_date: approval_date,
            planned_end: planned_end,
            maj_date: maj_date,
            task_manager: task_manager,
            raw_data_org: raw_data
           
        }
    	return project_to_save ;  
    });

    await browser.close();
    
	return info ;

}

async function getParams() {

	let response = await Params.find({source_id:"WB"});
	if(response[0].interrupted == true)
	return [response[0].offset, response[0].interrupted, response[0].row]
	return [0, response[0].interrupted, 0]
	
  }
async function getProLink(wburl){
	

	var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    var page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    await page.goto(wburl, { waitUntil: 'networkidle2' });

    let data = await page.evaluate(() => {

    	var project_ids = document.querySelectorAll("td[data-th='Project ID:']");
    	var project_liens = Array.from(project_ids, a => "https://projects.worldbank.org/en/projects-operations/project-detail/"+a.innerText);

    	
    	return project_liens ;  
        
    });
    await browser.close();
    
	return data ;
}

async function get_user(fullname) {
  let user_id = null;
  let found_user = await User.find({ fullname:fullname });
  if (found_user.length > 0){
  user_id = found_user[0]._id;}
  else{
  let tmp_user = new User({fullname:fullname})
  tmp_user.save()
  let found_user = await User.find({ fullname:fullname });
  if (found_user.length > 0) user_id = found_user[0]._id;
        }
  return user_id;
}

//async function saveProjectPreProd(projectUpdated,project){
 		
 		//var projAI = new ProjectPreProd({

 		//});
 		//projAI.save();
//
//}




exports.getWBProjects = async (req, res, next) =>{
	let param = await getParams()
	let skip_off = param[0]
	let interrupted = param[1]
	let n_docs = 21060
	let offset = 0
	for(let p = 0; p<n_docs;p++){
		offset=p*20
	if(interrupted && offset<skip_off)  {
		console.log(offset +" || "+skip_off)
		continue}
	let base_url="https://projects.worldbank.org/en/projects-operations/projects-list?os="+offset;
	var page = 0 ; 
	//var url = base_url  ;

	
		
	
	const links = await getProLink(base_url);

	console.log(links);
	let projects = []

	try{
	for (var i = 0; i < links.length; i++) {
		var proj_org_id = links[i].split('/').pop()
		var proj_exist = await containsProject(proj_org_id)
		
		console.log(proj_exist)
		
		if(proj_exist){
			

		var  project = await getInfoProject(links[i]);
		var maj_recent = await maj_date_recent(proj_org_id, project.maj_date)
		if(!maj_recent){
			console.log("Update")
		//country_id
		var country_id = await iati_country_norm(project.country)
		country_id = country_id?country_id._id:null
		console.log("country_id "+country_id)
		//region_id
		var region= await iati_region_norm(project.region)
		let region_id = region?region._id:null
		//multinational
		if(country_id==null){
			if(region){
				if(region.countries)
				country_id = region.countries
			}
		}
		
		let counts = 0
		if(country_id){
			if(country_id.length) counts = country_id.length
		}
		console.log("country_id "+country_id)
		//status_id
		var status_code = status_wb(project.status)
		var status = await iati_status_norm(status_code)
		//funder_id
		var funder = await getFunder(project.funder)
		//implementer_id
		var implementer = await getImplementer(project.implementer)
		//sub_funder_id
		let sub_funder = await getSubFunder(project.sub_funder)
		//task_manager
		let user = await get_user(project.task_manager)
		//thematique
		let thematique = await thematique_norm(project.thematique)
		if(counts){
		for(let c =0; c<country_id.length;c++){
		var project_to_save = await ProjectPreProd.updateOne({proj_org_id:proj_org_id, country:country_id[c]},{$set:{
			source : project.source,
		source_id: project.source_id,
	 proj_org_id:proj_org_id,
      name: project.name,
      funder: funder,
      implemeter: implementer,
     sub_funder: sub_funder,
     // sub_implementer: project.sub_implementer,
      objectives:project.objectives,
      status: status,
      country: country_id[c],
     region:region_id,
      thematique: thematique,
      total_cost:project.total_cost,
      approval_date: project.approval_date? new Date(project.approval_date):null,
      planned_end: project.planned_end? new Date(project.planned_end):null,
      maj_date: project.maj_date? new Date(project.maj_date):null,
      task_manager: user,
      raw_data_org: project.raw_data_org
		}})}

		}else{
			var project_to_save = await ProjectPreProd.updateOne({proj_org_id:proj_org_id, country:country_id},{$set:{
				source : project.source,
			source_id: project.source_id,
		 proj_org_id:proj_org_id,
		  name: project.name,
		  funder: funder,
		  implemeter: implementer,
		 sub_funder: sub_funder,
		 // sub_implementer: project.sub_implementer,
		  objectives:project.objectives,
		  status: status,
		  country: country_id,
		 region:region_id,
		 thematique: thematique,
		  total_cost:project.total_cost,
		  approval_date: project.approval_date? new Date(project.approval_date):null,
		  planned_end: project.planned_end? new Date(project.planned_end):null,
		  maj_date: project.maj_date? new Date(project.maj_date):null,
		  task_manager: user,
		  raw_data_org: project.raw_data_org
			}})}

		
		}
		}
		else{
			var  project = await getInfoProject(links[i]);
			console.log("NEW")
		//country_id
		var country_id = await iati_country_norm(project.country)
		country_id = country_id?country_id._id:null
		console.log("country_id  "+country_id)
		//region_id
		var region= await iati_region_norm(project.region)
		let region_id = region?region._id:null
		//multinational
		if(country_id==null){
			if(region){
				if(region.countries)
				country_id = region.countries
			}
		}
		let counts = 0
		if(country_id){
			if(country_id.length) counts = country_id.length
		}
		console.log("country_id "+country_id)
		//status_id
		var status_code = status_wb(project.status)
		var status = await iati_status_norm(status_code)
		//funder_id
		var funder = await getFunder(project.funder)
		//implementer_id
		var implementer = await getImplementer(project.implementer)
		//sub_funder_id
		let sub_funder = await getSubFunder(project.sub_funder)
		//task_manager
		let user = await get_user(project.task_manager)
		//thematique
		let thematique = await thematique_norm(project.thematique)
		if(counts){
			for(let c =0; c<country_id.length;c++){
		var project_to_save = new ProjectPreProd({
			source : project.source,
		source_id: project.source_id,
	 proj_org_id:proj_org_id,
      name: project.name,
      funder: funder,
      implemeter: implementer,
     sub_funder:sub_funder,
     // sub_implementer: project.sub_implementer,
      objectives:project.objectives,
      status: status,
      country: country_id[c],
      region:region_id,
     thematique: thematique,
      total_cost:project.total_cost,
      approval_date: project.approval_date? new Date(project.approval_date):null,
      planned_end: project.planned_end? new Date(project.planned_end):null,
      maj_date: project.maj_date? new Date(project.maj_date):null,
      task_manager: user,
      raw_data_org: project.raw_data_org
			})
		projects.push(project_to_save);
		project_to_save.save()
		}}
		else{
			var project_to_save = new ProjectPreProd({
				source : project.source,
			source_id: project.source_id,
		 proj_org_id:proj_org_id,
		  name: project.name,
		  funder: funder,
		  implemeter: implementer,
		 sub_funder:sub_funder,
		 // sub_implementer: project.sub_implementer,
		  objectives:project.objectives,
		  status: status,
		  country: country_id,
		  region:region_id,
		  thematique: thematique,
		  total_cost:project.total_cost,
		  approval_date: project.approval_date? new Date(project.approval_date):null,
		  planned_end: project.planned_end? new Date(project.planned_end):null,
		  maj_date: project.maj_date? new Date(project.maj_date):null,
		  task_manager: user,
		  raw_data_org: project.raw_data_org
				})
			projects.push(project_to_save);
			project_to_save.save()
			}
		}
		await Params.updateOne({source_id:"WB"}, {$set:{ interrupted:true, row:i,offset:offset}})
	}
	
}
	catch(error){
		console.log(error)
	}
	await Params.updateOne({source_id:"WB"}, {$set:{ interrupted:true, row:i,offset:offset}})
}
await Params.updateOne({source_id:"WB"}, {$set:{ interrupted:false, row:0,offset:0}})
};



exports.test = async (req, res, next) =>{
	let param = await getParams()
	let skip_off = param[0]
	let interrupted = param[1]
	let n_docs = 21060
	let offset = 0
	for(let p = 0; p<n_docs;p++){
		offset=p*20
	if(interrupted && offset<skip_off)  {
		console.log(offset +" || "+skip_off)
		continue}
	let base_url="https://projects.worldbank.org/en/projects-operations/projects-list?os="+offset;
	var page = 0 ; 
	//var url = base_url  ;

	
		
	
	const links = await getProLink(base_url);

	console.log(links);
	let projects = []

	try{
	for (var i = 0; i < links.length; i++) {
		var proj_org_id = links[i].split('/').pop()
		var proj_exist = await containsProject(proj_org_id)
		
		console.log(proj_exist)
		
		if(proj_exist){
			

		var  project = await getInfoProject(links[i]);
		var maj_recent = await maj_date_recent(proj_org_id, project.maj_date)
		if(!maj_recent){
			console.log("Update")
		//country_id
		var country_id = await iati_country_norm(project.country)
		country_id = country_id?country_id._id:null
		console.log("country_id "+country_id)
		//region_id
		var region= await iati_region_norm(project.region)
		let region_id = region?region._id:null
		//multinational
		if(country_id==null){
			if(region){
				if(region.countries)
				country_id = region.countries
			}
		}
		let counts = 0
		if(country_id){
			if(country_id.length) counts = country_id.length
		}
		console.log("country_id "+country_id)
		//status_id
		var status_code = status_wb(project.status)
		var status = await iati_status_norm(status_code)
		//funder_id
		var funder = await getFunder(project.funder)
		//implementer_id
		var implementer = await getImplementer(project.implementer)
		//sub_funder_id
		let sub_funder = await getSubFunder(project.sub_funder)
		//task_manager
		let user = await get_user(project.task_manager)
		//thematique
		let thematique = await thematique_norm(project.thematique)
		if(counts){
		for(let c =0; c<country_id.length;c++){
		var project_to_save = await ProjectPreProd.updateOne({proj_org_id:proj_org_id, country:country_id[c]},{$set:{
			source : project.source,
		source_id: project.source_id,
	 proj_org_id:proj_org_id,
      name: project.name,
      funder: funder,
      implemeter: implementer,
     sub_funder: sub_funder,
     // sub_implementer: project.sub_implementer,
      objectives:project.objectives,
      status: status,
      country: country_id[c],
     region:region_id,
      thematique: thematique,
      total_cost:project.total_cost,
      approval_date: project.approval_date? new Date(project.approval_date):null,
      planned_end: project.planned_end? new Date(project.planned_end):null,
      maj_date: project.maj_date? new Date(project.maj_date):null,
      task_manager: user,
      raw_data_org: project.raw_data_org
		}})}

		}else{
			var project_to_save = await ProjectPreProd.updateOne({proj_org_id:proj_org_id, country:country_id},{$set:{
				source : project.source,
			source_id: project.source_id,
		 proj_org_id:proj_org_id,
		  name: project.name,
		  funder: funder,
		  implemeter: implementer,
		 sub_funder: sub_funder,
		 // sub_implementer: project.sub_implementer,
		  objectives:project.objectives,
		  status: status,
		  country: country_id,
		 region:region_id,
		 thematique: thematique,
		  total_cost:project.total_cost,
		  approval_date: project.approval_date? new Date(project.approval_date):null,
		  planned_end: project.planned_end? new Date(project.planned_end):null,
		  maj_date: project.maj_date? new Date(project.maj_date):null,
		  task_manager: user,
		  raw_data_org: project.raw_data_org
			}})}

		
		}
		}
		else{
			var  project = await getInfoProject(links[i]);
			console.log("NEW")
		//country_id
		var country_id = await iati_country_norm(project.country)
		country_id = country_id?country_id._id:null
		console.log("country_id  "+country_id)
		//region_id
		var region= await iati_region_norm(project.region)
		let region_id = region?region._id:null
		//multinational
		if(country_id==null){
			if(region){
				if(region.countries)
				country_id = region.countries
			}
		}
		let counts = 0
		if(country_id){
			if(country_id.length) counts = country_id.length
		}
		console.log("country_id "+country_id)
		//status_id
		var status_code = status_wb(project.status)
		var status = await iati_status_norm(status_code)
		//funder_id
		var funder = await getFunder(project.funder)
		//implementer_id
		var implementer = await getImplementer(project.implementer)
		//sub_funder_id
		let sub_funder = await getSubFunder(project.sub_funder)
		//task_manager
		let user = await get_user(project.task_manager)
		//thematique
		let thematique = await thematique_norm(project.thematique)
		if(counts){
			for(let c =0; c<country_id.length;c++){
		var project_to_save = new ProjectPreProd({
			source : project.source,
		source_id: project.source_id,
	 proj_org_id:proj_org_id,
      name: project.name,
      funder: funder,
      implemeter: implementer,
     sub_funder:sub_funder,
     // sub_implementer: project.sub_implementer,
      objectives:project.objectives,
      status: status,
      country: country_id[c],
      region:region_id,
     thematique: thematique,
      total_cost:project.total_cost,
      approval_date: project.approval_date? new Date(project.approval_date):null,
      planned_end: project.planned_end? new Date(project.planned_end):null,
      maj_date: project.maj_date? new Date(project.maj_date):null,
      task_manager: user,
      raw_data_org: project.raw_data_org
			})
		projects.push(project_to_save);
		project_to_save.save()
		}}
		else{
			var project_to_save = new ProjectPreProd({
				source : project.source,
			source_id: project.source_id,
		 proj_org_id:proj_org_id,
		  name: project.name,
		  funder: funder,
		  implemeter: implementer,
		 sub_funder:sub_funder,
		 // sub_implementer: project.sub_implementer,
		  objectives:project.objectives,
		  status: status,
		  country: country_id,
		  region:region_id,
		  thematique: thematique,
		  total_cost:project.total_cost,
		  approval_date: project.approval_date? new Date(project.approval_date):null,
		  planned_end: project.planned_end? new Date(project.planned_end):null,
		  maj_date: project.maj_date? new Date(project.maj_date):null,
		  task_manager: user,
		  raw_data_org: project.raw_data_org
				})
			projects.push(project_to_save);
			project_to_save.save()
			}
		}
		await Params.updateOne({source_id:"WB"}, {$set:{ interrupted:true, row:i,offset:offset}})
	}
	await Params.updateOne({source_id:"WB"}, {$set:{ interrupted:true, row:i,offset:offset}})
	
}
	catch(error){
		console.log(error)
		await Params.updateOne({source_id:"WB"}, {$set:{ interrupted:true, row:i,offset:offset,error:error}})
	}
	
}
await Params.updateOne({source_id:"WB"}, {$set:{ interrupted:false, row:0,offset:0}})
};
exports.interrupted = async (req, res, next) => {
	const interr = await Params.find({source_id:"WB"})
	return interr[0].interrupted
  
  
  }
exports.newWBProjects = async (req, res, next) =>{

	base_url="https://projects.worldbank.org/en/projects-operations/projects-list?os=20";
	var page = 0 ; 
	//var url = base_url  ;

	const links = await getProLink(base_url);

	console.log(links);
	let projects = []

	for (var i = 0; i < links.length; i++) {
		try{
		var proj_org_id = links[i].split('/').pop()
		var proj_exist = await containsProject(proj_org_id)
		
		console.log(proj_exist)
		if(proj_exist){
			console.log("DONE!!!!!!!!!!!!!!!111")
		break
		
		}
		else{
			var  project = await getInfoProject(links[i]);
			console.log("NEW")
		//country_id
		var country_id = await iati_country_norm(project.country)
		country_id = country_id?country_id._id:null
		console.log(country_id)
		//region_id
		var region_id = await iati_region_norm(project.region)
		region_id = region_id?region_id._id:null
		console.log(region_id)
		//multinational
		if(country_id==null){
			if(region){
				if(region.countries)
				country_id = region.countries
			}
		}
		let counts = 0
		if(country_id){
			if(country_id.length) counts = country_id.length
		}
		//status_id
		var status_code = status_wb(project.status)
		console.log(status_code)
		var status = await iati_status_norm(status_code)
		console.log(status)
		//funder_id
		var funder = await getFunder(project.funder)
		console.log(funder)
		//implementer_id
		var implementer = await getImplementer(project.implementer)
		console.log(implementer)
		//sub_funder_id
		let sub_funder = await getSubFunder(project.sub_funder)
		//task_manager
		let user = await get_user(project.task_manager)
		//thematique
		let thematique = await thematique_norm(project.thematique)
		if(counts){
			for(let c =0; c<country_id.length;c++){

				var project_to_save = new ProjectPreProd({
					source : project.source,
				source_id: project.source_id,
			 proj_org_id:proj_org_id,
			  name: project.name,
			  funder: funder,
			  implemeter: implementer,
			  sub_funder: sub_funder,
			 // sub_implementer: project.sub_implementer,
			  objectives:project.objectives,
			  status: status,
			  country: country_id[c],
			  region:region_id,
			 thematique: thematique,
			  total_cost:project.total_cost,
			  approval_date: project.approval_date? new Date(project.approval_date):null,
			  planned_end: project.planned_end? new Date(project.planned_end):null,
			  maj_date: project.maj_date? new Date(project.maj_date):null,
			  task_manager: user,
			  raw_data_org: project.raw_data_org
					})
				projects.push(project_to_save);
				project_to_save.save()
				}
			
		}
		else{
		var project_to_save = new ProjectPreProd({
			source : project.source,
		source_id: project.source_id,
	 proj_org_id:proj_org_id,
      name: project.name,
      funder: funder,
      implemeter: implementer,
      sub_funder: sub_funder,
     // sub_implementer: project.sub_implementer,
      objectives:project.objectives,
      status: status,
      country: country_id,
      region:region_id,
      thematique: thematique,
      total_cost:project.total_cost,
      approval_date: project.approval_date? new Date(project.approval_date):null,
      planned_end: project.planned_end? new Date(project.planned_end):null,
      maj_date: project.maj_date? new Date(project.maj_date):null,
      task_manager: user,
      raw_data_org: project.raw_data_org
			})
		projects.push(project_to_save);
		project_to_save.save()
		}
	}}
	catch(error){
		console.log(error)
	}
		
}

};

async function containsProject(proj_org_id){
	let proj = await ProjectPreProd.find({proj_org_id:proj_org_id})
	return proj.length? true : false
  }

function status_wb(name) {
	var statuses = [['Pipeline', '1'], ['Dropped', '5'], ['Active','2'],['Closed', '4']]
	for(let i =0; i< statuses.length;  i++){
		if(statuses[i][0] == name) return statuses[i][1]
	}
	return null
	
}
async function iati_status_norm(status_code) {

	statuses = [['completed', '3'], ['closed', '4'], ['identification', '1'], ['approved', ''], ['lending', ''], ['ongoing', '2'], ['cancelled', '5'], ['suspended', '6']]
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

  

async function getFunder(org) {
	let funder = null;
	
	if (org) {
	
		    let data = JSON.stringify({"text":org})
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
  async function getSubFunder(iati_org) {
	const funder_object_id = "60c23ffc2b006960f055e8ef";
	let sub_funder = [];
	if (iati_org) {
	  if (iati_org.length > 0) {
		for (let i = 0; i < iati_org.length; i++) {
			let data = JSON.stringify({"text":iati_org[i]})
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
			sub_funder.push(finded_organizations[0][0])
		  
			
		  // else funder = "not exist";
		
	  }
	  }
	}
	return sub_funder;
  }
  
  async function getImplementer(org) {
	let funder = null;
	
	if (org) {
	
		    let data = JSON.stringify({"text":org})
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
  
  async function getSubImplementer(iati_org, implemeter) {
	const implemeter_object_id = "60c23ffc2b006960f055e8f2";
	let sub_funder = [];
	if (iati_org) {
	  if (iati_org.length > 0) {
		for (let i = 0; i < iati_org.length; i++) {
		  if(iati_org[i][0] == '2' || iati_org[i][0] == '4' || iati_org[i][0] == 'Implementing' || iati_org[i][0] == 'Accountable'){
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
	return [sub_funder, iati_org];
  }
  async function maj_date_recent(source_id, maj_date){
	let proj = await ProjectPreProd.find({source_id:source_id})
	if(proj.length==0) return false
	
	if(new Date(proj[0].maj_date) >= new Date(maj_date)) {
		console.log(proj[0].maj_date +" || "+ maj_date)
		return true}
	else return false
  
  }
  async function iati_country_norm(name) {
	
	if(name == 'Zaire') name = 'Congo, The Democratic Republic of the'
	let country_id = await Countries.find(FuzzySearch(['name'],name))
	if(country_id){
	  if(country_id.length>0) return country_id[0]
	}
	
	return null;
  }
  async function iati_region_norm(country_code) {
	let code = country_code
	if(code == "Africa") code="Africa, regional"
	if(code == "South Asia") code="South Asia, regional"
	if(code == "Africa East") code = "Eastern Africa, regional"
	if(code == "Africa West") code = "Western Africa, regional"
	let country_id = await Regions.find({region_name:code})
  
	console.log(country_id)
	if(country_id){
	  if(country_id.length>0) return country_id[0]
	}
	
	return null;
  }

  async function thematique_norm(thematique) {
	  if(thematique==null){return null}
		  if(thematique.length>1){
			let them_id = await Thematiques.find({name:"Divers"})
			console.log(them_id)
			try{
				return them_id[0]._id}
				catch(e){
					
					return null
				}
		  }
	  
	let thems = [["Water & Sanitation","Environment and Natural Resource Management"]
	,["Urban Development & Transportation","Urban and Rural Development"]
	,["Gouvernance, Human Rights, Democracy, Public Sector","Human Development and Gender"]
	,["Economic Development","Economic Policy"]
	,["Finance","Finance"]
	,["Economic Development","Private Sector Development"]
	,["Gouvernance, Human Rights, Democracy, Public Sector","Public Sector Management"]
	,["Gouvernance, Human Rights, Democracy, Public Sector","Social Development and Protection"]
]
	for(let i =0 ; i<thems.length;i++){
		if(thematique[0] == thems[i][1]){
			let them_id = await Thematiques.find({name:thems[i][0]})
			console.log(thems[i][0]+"  ||  "+them_id)
			try{
				return them_id[0]._id}
				catch(e){
					return null
				}
		}
	}

	return null;
  }