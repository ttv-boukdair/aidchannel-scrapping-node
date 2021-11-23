const axios = require("axios");
const https = require('https');
const jsdom = require("jsdom");
var Organization = require("../models/organization");
var Regions = require("../models/regions");
const Params = require("../models/params");
var Status = require("../models/status");
var Countries = require("../models/country");
var Thematiques = require("../models/thematiques");
const { JSDOM } = jsdom;
var ProjectAI = require("../models/projectai");
var ProjectPreProd = require("../models/projectpreprod");
var SectorsDATA = require("../data/sectors.json");
const User = require("../models/user2");
const LanguageDetect = require('languagedetect');
const { off } = require("process");
const lngDetector = new LanguageDetect();
const agent = new https.Agent({
  rejectUnauthorized: false
});
const puppeteer = require("puppeteer");
const fs = require('fs');
const fss = require('fs-stream-sync')
const http = require('http');
const csv = require('csv-parser')
const getCountryISO2 = require("country-iso-3-to-2");
const { raw } = require("body-parser");


/**
 * Downloads file from remote HTTP[S] host and puts its contents to the
 * specified location.
 */
function getRemoteFile(file, url) {
      let localFile = fs.createWriteStream(file);
      const request = https.get(url, function(response) {
          var len = parseInt(response.headers['content-length'], 10);
          var cur = 0;
          var total = len / 1048576; //1048576 - bytes in 1 Megabyte
  
          response.on('data', function(chunk) {
              cur += chunk.length;
              showProgress(file, cur, len, total);
          });
  
          response.on('end', function() {
              console.log("Download complete");
          });
  
          response.pipe(localFile);
      });
  }
  
  function showProgress(file, cur, len, total) {
      console.log("Downloading " + file + " - " + (100.0 * cur / len).toFixed(2) 
          + "% (" + (cur / 1048576).toFixed(2) + " MB) of total size: " 
          + total.toFixed(2) + " MB");
  }

async function getInfoProject(link) {
	//init and lunch puppeteer browser 

	var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	var page = (await browser.pages())[0];
	page.setDefaultNavigationTimeout(0);
	// get project url content
	await page.goto(link, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#react-tabs-3 > div > div.dataquery__table--csv-wrapper > div.dataquery__table > div > div > div.jss12 > div > div > div > table > tbody > tr:nth-child(10)', {
    visible: true,
  });
  //await page.screenshot({path: 'test.png'})
  
  //actions filters
//   let filter_button = await page.click('#react-tabs-3 > div > div.grid-x > div.cell.auto > div > div.filter-bar__dataquery-button > button')
// // wait for page to load
//   await page.waitForSelector("body > div:nth-child(9) > div > div > div.cell.auto.overflow-y > div > div:nth-child(2) > div", {
//     visible: true,
//   });
//   let filter_fiscal = await page.click('body > div:nth-child(9) > div > div > div.cell.auto.overflow-y > div > div:nth-child(2) > div')
//   let filter_fiscal_1 =  await page.click("body > div:nth-child(9) > div > div > div.cell.auto.overflow-y > div > div > div.react-select__menu.css-2613qy-menu");
  //
  let nav = await page.click("#react-tabs-3 > div > div.dataquery__table--csv-wrapper > div.dataquery__selected-button > div > button", { waitUntil: 'domcontentloaded' })
  
  await page.waitForSelector("#react-select-2-option-0", {
    visible: true,
  });
	// fetch wanted data
	
    for(let i=0;i<=26;i++){
      if([1,8,13,17,23,24,25].includes(i)) continue
      await page.click(`#react-select-2-option-${i} > input[type=checkbox]`)
    }
   let nav_filters = await page.evaluate(() => {
    let items = [] 

   return items
  })
  await page.screenshot({path: 'test.png'})
	console.log("done", nav_filters)
	await browser.close();

}



exports.scrappingUSAID = async (req, res, next) => {
 
}


exports.newUSAID =  async (req, res, next) => {
  const link = "https://foreignassistance.gov/data#tab-query"
  // await getInfoProject(link)
  const download = "https://foreignassistance.gov/data_query/results.csv?country_id=504"
  const file = 'src/data/usaidData.csv'
  getRemoteFile(file,download)
  setTimeout(()=>{csvToArray(file)},30000)
  

}


function csvToArray(file){
  let arr= []
  fs.createReadStream(file)
  .pipe(csv())
  .on('data', (data) => arr.push(data))
  .on('end', async () => {
    for(let i=0;i<arr.length;i++){
      if(arr[i]['Fiscal Year'] == '2018'){
        console.log('done')
        break
      }
      
      let proj = await projectNormalize(arr[i])
      await proj.save()
      console.log(proj)
    }
    
  });
}

async function projectNormalize(p){
  let proj = {}
  //source
  let source = 'https://foreignassistance.gov'
  //country
  let countryCode = getCountryISO2(p['Country Code'])
  let countryObj = await Countries.findOne({code:countryCode.toUpperCase()})
  let country = countryObj._id
  //donor
  let funder = await getFunder(p['Funding Agency Name'])
  //implementer
  let implementer = await getImplementer(p['Implementing Partner Name'])
  //id
  let source_id = p['Activity ID']
  //name
  let name = p['Activity Name']
  //description
  let description = p['Activity Description']
  //start date
  let actual_start = p['Activity Start Date']
  //end date
  let actual_end = p['Activity End Date']
  //cost
  let total_cost = p['Current Dollar Amount']
  //thematique
  let thematique = await iati_sector_norm(p['International Purpose Code'])

  let raw_data_org = p
  return new ProjectPreProd({
    source:source,
    source_id:source_id,
    name:name,
    description:description,
    funder:funder,
    implementer:implementer,
    country:country,
    actual_start:actual_start,
    actual_end:actual_end,
    total_cost:total_cost,
    thematique:thematique,
    raw_data_org:raw_data_org,
  })
}



async function getFunder(org) {
  const funder_object_id = "60c23ffc2b006960f055e8ef";
  let funder = null;
  if (org) {
    //console.log(iati_org)
      
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
          funder = finded_organizations[0][0]
        // else funder = "not exist";
      
    
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
async function getImplementer(org) {
  const funder_object_id = "60c23ffc2b006960f055e8f2";
  let funder = null;
  if (org) {
    //console.log(iati_org)
      
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
          funder = finded_organizations[0][0]
        // else funder = "not exist";
      
    
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