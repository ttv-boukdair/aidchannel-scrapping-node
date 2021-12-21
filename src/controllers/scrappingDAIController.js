var Organization = require("../models/organization")
const https = require('https');
const axios = require("axios");
const agent = new https.Agent({
    rejectUnauthorized: false
});
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var Status = require("../models/status");
var Countries = require("../models/country");
var Regions = require("../models/regions");
var User = require("../models/user2");
const puppeteer = require("puppeteer");
var Thematiques = require("../models/thematiques");
var ProjectAI = require("../models/projectai");
var ProjectPreProd = require("../models/projectpreprod");
const { FuzzySearch } = require('mongoose-fuzzy-search-next');
const { get } = require("mongoose");
const { getProjects } = require("./scrappingGIZController");
const thematiques = require("../models/thematiques");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function getProjectInfo(c) {
    //base url to get projects
    var url = "https://www.dai.com/search?keywords="+c;
    //init and lunch puppeteer browser
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    var page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    // go to link
    await page.goto(url, { waitUntil: 'networkidle2' });

    // flow to list projects & create session to access project
    await page.click("#rev-box > div > div > div.ais-body.ais-menu--body > div > div:nth-child(3)", { waitUntil: 'domcontentloaded' });
    let showMore = true
    while(showMore){
        console.log('clicking')
        try{
            await page.click("#hits > div > div.ais-infinite-hits--showmore", { waitUntil: 'domcontentloaded' });
        }
        catch(e){
            try{
                await page.click("div.ais-infinite-hits--showmore", { waitUntil: 'domcontentloaded' });
            }
            catch(e){
                break
            }
            
        }
        try{
            showMore = await page.evaluate(() => {
            return !document.querySelector("#hits > div > div.ais-infinite-hits--showmore > button").hasAttribute('disabled')
        });
        }catch(e){
            showMore = await page.evaluate(() => {
                return !document.querySelector("div.ais-infinite-hits--showmore > button").hasAttribute('disabled')})
        }
        
    }
   let all_links = await page.evaluate(() => {
    let raw_links = document.querySelectorAll("#hits > div > div.ais-infinite-hits > div > a")
    let links = Array.from(raw_links, a => "https://www.dai.com" + a.getAttribute('href'))
    return links
   })
   
   console.log(all_links)

    // open project page in new tab to get it as text
    // var projectTab = await browser.newPage();
    // const projectUrl = "https://www.giz.de/projektdaten/projects.action?submitAction=details&target=projects&infotypeSource=pbsprojekte&documentId=" + index + "&request_locale=en_GB&position=2";
    // await projectTab.goto(projectUrl, { waitUntil: 'networkidle2' });


    // let data = await projectTab.evaluate(() => {
    // });
    // console.log(data);
    await browser.close();
    return all_links
}

exports.newProjects = async(req, res, next) => {
    let links =[]
    let tries = 0
   while(!links.length || tries >10){
    tries+=1
    links = await getProjectInfo('morocco');  
   }
  
   
   const projects = await getProjectsData(links, 'MA')

             
  }

async function getProjectsData(links, code){
      if(!links) return;
      const source = 'https://www.dai.com/'
      for(let i=0; i<links.length; i++){
        let proj_exist = await containsProject(links[i], source)

        if(proj_exist) break
         let resp = await axios.get(links[i])
         var dom = new JSDOM(resp.data)
         let title = dom.window.document.querySelector("body > div > div > div.node-inner > h1").textContent
         let client = dom.window.document.querySelector("body > div > div > div.node-inner > div > p:nth-child(1)").textContent.split(':')[1]
         let duration = dom.window.document.querySelector("body > div > div > div.node-inner > div > p:nth-child(2)").textContent.split(':')[1]
         let region = dom.window.document.querySelector("body > div > div > div.node-inner > div > p:nth-child(3)").textContent.split(':')[1].replace(/\n/g,'').replace(/^\s+|\s+$/g,'').replace(/\s\s+/g,' ')
         let country = dom.window.document.querySelector("body > div > div > div.node-inner > div > p:nth-child(4)").textContent.split(':')[1].replace(/\n/g,'').replace(/^\s+|\s+$/g,'').replace(/\s\s+/g,' ')
         let sectors = dom.window.document.querySelector("body > div > div > div.node-inner > div > p:nth-child(5)").textContent.split(':')[1].replace(/\n/g,'').replace(/^\s+|\s+$/g,'').replace(/\s\s+/g,' ')
         let description = ''
         let desc_n = 3
         let description_piece = dom.window.document.querySelector("body > div > div > div.node-inner > p:nth-child("+desc_n+")")
         while(description_piece){
             if(description == '') description += description_piece.textContent
             else description += '\n'+ description_piece.textContent
             desc_n+=1
             description_piece = dom.window.document.querySelector("body > div > div > div.node-inner > p:nth-child("+desc_n+")")
         }
         let data = {
             proj_org_id:links[i],
             title:title,
             client:client,
             duration:duration.replace(' ',''),
             region:region,
             country:country,
             sectors:sectors,
             description:description,
             implemeter:"DAI",
             project_url:links[i]
         }
         let thematique = await getSector(sectors)
         let country_obj = await Countries.findOne({code:code})
         let status = await status_norm(new Date(duration.split('-')[1]))
         let funder = await getFunder(client)
         let implementer = await getImplementer("DAI")
         let project = new ProjectPreProd({
             source:source,
            proj_org_id:links[i],
             name:title,
             approval_date:new Date(duration.split('-')[0]),
             actual_start:new Date(duration.split('-')[0]),
             actual_end:new Date(duration.split('-')[1]),
             planned_end:new Date(duration.split('-')[1]),
             description:description,
             country:country_obj._id,
             thematique:thematique,
             status:status,
             funder:funder,
             implementer:implementer,
             project_url:links[i],
             raw_data_org:data,
         })
         await project.save()
         console.log(project)


      }
      console.log('Done!!!!')
  } 
async function status_norm(date) {
    let status_id = null;

    if(Date.now() > date){
        status_id = await Status.findOne({ name: 'closed'})
        status_id = status_id._id
    }
    else{
        status_id = await Status.findOne({ name: 'ongoing'})
        status_id = status_id._id
    }
    
    return status_id;
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
async function getImplementer(org) {
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

async function containsProject(proj_org_id, source) {
    let proj = await ProjectPreProd.find({ proj_org_id: proj_org_id , source:source})
    return proj.length ? true : false
}