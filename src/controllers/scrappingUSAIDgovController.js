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
  const download = "https://foreignassistance.gov/data_query/results.csv?country_id=504&transaction_type=Obligations"
  const file = 'src/data/usaidData.csv'
  // let downFile = getRemoteFile(file,download)
  let arr = setTimeout(()=>{let arr = csvToArray(file); return arr},2000)
  console.log(arr)
  setTimeout(()=>{console.log(arr[0])},3000)

}


function csvToArray(file){
  let arr = []
  fss.createSyncReadStream(file)
  .pipe(csv())
  .on('data', (data) => arr.push(data))
  .on('end', () => {
    console.log(arr.length)
    
  });
  return arr
}