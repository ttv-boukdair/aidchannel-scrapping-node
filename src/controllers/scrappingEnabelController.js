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
var ProjectPreProd = require("../models/projectpreprod");
const { FuzzySearch } = require('mongoose-fuzzy-search-next');
const { get } = require("mongoose");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function getProjectInfo(index) {
    //base url to get projects
    var url = "https://open.enabel.be/en/projects";
    //init and lunch puppeteer browser
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    var page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    // go to link
    await page.goto(url, { waitUntil: 'networkidle2' });

    // flow to list projects & create session to access project
    //await page.click(".app-projectsearch__container > ng-select");
   // await page.click(".ng-dropdown-panel.ng-select-multiple.ng-select-bottom > div > div:nth-child(2) > div:nth-child(1)", { waitUntil: 'domcontentloaded' });
   // await page.click(".ng-dropdown-panel.ng-select-multiple.ng-select-bottom > div > div:nth-child(2) > div:nth-child(1)", { waitUntil: 'networkidle2' });
    //await sleep(5000);

    // open project page in new tab to get it as text
   // var projectTab = await browser.newPage();
  //  const projectUrl = "https://www.giz.de/projektdaten/projects.action?submitAction=details&target=projects&infotypeSource=pbsprojekte&documentId=" + index + "&request_locale=en_GB&position=2";
   // await projectTab.goto(projectUrl, { waitUntil: 'networkidle2' });


    // let data = await projectTab.evaluate(() => {

    // });
    // console.log(data);
    await browser.close();
    return data
}

async function normProject(project) {
    //get raw data
    const raw_data = project
    
}

exports.getProjects = async(req, res, next) => {

}

exports.newProjects = async(req, res, next) => {
 

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
async function getSubFunder(iati_org) {
    const funder_object_id = "60c23ffc2b006960f055e8ef";
    let sub_funder = [];
    if (iati_org) {
        if (iati_org.length > 0) {
            for (let i = 0; i < iati_org.length; i++) {
                let data = JSON.stringify({ "text": iati_org[i].split(":")[0] })
                console.log(iati_org[i].split(":")[0])
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
                    sub_funder.push(finded_organizations[0][0])


                // else funder = "not exist";

            }
        }
    }
    return sub_funder
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

async function getSubImplementer(iati_org, implemeter) {
    const implemeter_object_id = "60c23ffc2b006960f055e8f2";
    let sub_funder = [];
    if (iati_org) {
        if (iati_org.length > 0) {
            for (let i = 0; i < iati_org.length; i++) {
                if (iati_org[i][0] == '2' || iati_org[i][0] == '4' || iati_org[i][0] == 'Implementing' || iati_org[i][0] == 'Accountable') {
                    let data = JSON.stringify({ "text": iati_org[i][1] })
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
                        sub_funder.push(finded_organizations[0][0])


                    // else funder = "not exist";
                }
            }
        }
    }
    return sub_funder
}

async function containsProject(proj_org_id) {
    let proj = await ProjectPreProd.find({ proj_org_id: proj_org_id })
    return proj.length ? true : null
}