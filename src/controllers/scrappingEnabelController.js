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
var ProjectPreProd = require("../models/projectpreprod");
const { FuzzySearch } = require('mongoose-fuzzy-search-next');
const { get } = require("mongoose");

//countries enabel numbers
const enabel_countries = [
    { num: '12', name: 'Algeria', code: 'DZ' },
    { num: '24', name: 'Angola', code: 'AO' },
    { num: '50', name: 'Bangladesh', code: 'BD' },
    { num: '56', name: 'Belgium', code: 'BE' },
    { num: '204', name: 'Benin', code: 'BJ' },
    { num: '68', name: 'Bolivia', code: 'BO' },
    { num: '854', name: 'Burkina Faso', code: 'BF' },
    { num: '108', name: 'Burundi', code: 'BI' },
    { num: '116', name: 'Cambodia', code: 'KH' },
    { num: '120', name: 'Cameroon', code: 'CM' },
    { num: '140', name: 'Central African Republic', code: 'CF' },
    { num: '152', name: 'Chile', code: 'CL' },
    { num: '156', name: 'China', code: 'CN' },
    { num: '384', name: 'Côte d’Ivoire', code: 'CI' },
    { num: '180', name: 'DR Congo', code: 'CD' },
    { num: '218', name: 'Ecuador', code: 'EC' },
    { num: '222', name: 'El Salvador', code: 'SV' },
    { num: '231', name: 'Ethiopia', code: 'ET' },
    { num: '270', name: 'Gambia', code: 'GM' },
    { num: '288', name: 'Ghana', code: 'GH' },
    { num: '300', name: 'Greece', code: 'GR' },
    { num: '320', name: 'Guatemala', code: 'GT' },
    { num: '324', name: 'Guinea', code: 'GN' },
    { num: '624', name: 'Guinea-Bissau', code: 'GW' },
    { num: '332', name: 'Haiti', code: 'HT' },
    { num: '360', name: 'Indonesia', code: 'ID' },
    { num: '400', name: 'Jordan', code: 'JO' },
    { num: '404', name: 'Kenya', code: 'KE' },
    { num: '418', name: 'Laos', code: 'LA' },
    { num: '434', name: 'Libya', code: 'LY' },
    { num: '450', name: 'Madagascar', code: 'MG' },
    { num: '466', name: 'Mali', code: 'ML' },
    { num: '478', name: 'Mauritania', code: 'MR' },
    { num: '504', name: 'Morocco', code: 'MA' },
    { num: '508', name: 'Mozambique', code: 'MZ' },
    { num: '516', name: 'Namibia', code: 'NA' },
    { num: '562', name: 'Niger', code: 'NE' },
    { num: '275', name: 'Palestine', code: 'PS' },
    { num: '604', name: 'Peru', code: 'PE' },
    { num: '608', name: 'Philippines', code: 'PH' },
    { num: '646', name: 'Rwanda', code: 'RW' },
    { num: '686', name: 'Senegal', code: 'SN' },
    { num: '710', name: 'South Africa', code: 'ZA' },
    { num: '740', name: 'Suriname', code: 'SR' },
    { num: '834', name: 'Tanzania', code: 'TZ' },
    { num: '764', name: 'Thailand', code: 'TH' },
    { num: '788', name: 'Tunisia', code: 'TN' },
    { num: '800', name: 'Uganda', code: 'UG' },
    { num: '704', name: 'Vietnam', code: 'VN' },
    { num: '894', name: 'Zambia', code: 'ZM' }
]


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function getProjectLinks(index) {
    //base url to get projects
    var url = "https://open.enabel.be/en/projects/" + index;
    //init and lunch puppeteer browser
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    var page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    // go to link
    await page.goto(url, { waitUntil: 'networkidle2' });
    // get page
    let data = await page.evaluate(() => {
        //get all project a tags
        let raw_links = document.querySelectorAll("div > div.caption > h4 > a");
        //get all links
        let links = Array.from(raw_links, a => "https://open.enabel.be" + a.getAttribute('href'))
        return links
    });
    // console.log(data);
    await browser.close();
    return data
}

async function getProjectInfo(link) {
    let resp = await axios.get(link)
    var dom = new JSDOM(resp.data)
    let name = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(2) > div > h2").textContent
    let img = dom.window.document.querySelector("#myCarousel > div > div.item.active > img")
    let image_url = get_image_src(img)
    let description = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(2) > td > p").textContent
    let general_objective = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(2) > td > p").textContent
    let specific_objective = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div.panel-body").textContent
    let proj_code = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(3) > td:nth-child(2)").textContent
    let start_date = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(4) > td:nth-child(2)").textContent
    let end_date = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(5) > td:nth-child(2)").textContent
    let stage = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(6) > td:nth-child(2)").textContent
    let donor = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(7) > td:nth-child(2)").textContent
    let sector = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(8) > td:nth-child(2)").textContent
    let budget = dom.window.document.querySelector("#display > div:nth-child(4) > div > div > div > div:nth-child(3) > div.project-info.span8 > table > tbody > tr:nth-child(9) > td:nth-child(2)").textContent
    let country = await getCountry(link.split('/')[4])
    return {
        proj_code: proj_code.replace(/^\s+|\s+$/g, ''),
        name: name.replace(/^\s+|\s+$/g, ''),
        image_url: image_url,
        donor: donor.replace(/^\s+|\s+$/g, ''),
        description: description.replace(/^\s+|\s+$/g, ''),
        general_objective: general_objective.replace(/^\s+|\s+$/g, ''),
        specific_objective: specific_objective.replace(/^\s+|\s+$/g, ''),
        start_date: start_date.replace(/^\s+|\s+$/g, ''),
        end_date: end_date.replace(/^\s+|\s+$/g, ''),
        stage: stage.replace(/^\s+|\s+$/g, ''),
        sector: sector.replace(/^\s+|\s+$/g, ''),
        budget: budget.replace(/^\s+|\s+$/g, ''),
        country: country,
    }
}

async function normProject(project, link) {
    //norm data
    let raw_data = project
    let name = project.name
    let source = 'open.enabel.be/en/projects'
    let proj_org_id = project.proj_code
    let funder = await getFunder(project.donor == 'Belgium' ? 'Belgian Development Agency (ENABEL)' : project.donor)
    let image_url = project.image_url
    let description = project.description
    let objectives = project.general_objective + '\n\n' + project.specific_objective
    let actual_start = new Date(project.start_date) ? new Date(project.start_date) : null
    let approval_date = actual_start
    let actual_end = new Date(project.end_date) ? new Date(project.end_date) : null
    let planned_end = actual_end
    let status = await getStatus(project.stage)
    let sector = await getSector(project.sector)
    let budget = project.budget
    let total_cost = project.budget
    let country = project.country
    let project_url = link
    return new ProjectPreProd({
        source: source,
        project_url: project_url,
        proj_org_id: proj_org_id,
        name: name,
        description: description,
        objectives: objectives,
        image_url: image_url,
        funder: funder,
        status: status,
        country: country,
        thematique: sector,
        budget: budget,
        total_cost: total_cost,
        approval_date: approval_date,
        actual_start: actual_start,
        actual_end: actual_end,
        planned_end: planned_end,
        raw_data_org: raw_data
    })
}

exports.getEnabelProjects = async (req, res, next) => {

}

exports.newEnabelProjects = async (req, res, next) => {
    let to_stop = false
    //loop through all pages 
    for (let i = 1; i <= 10; i++) {
        if(to_stop) break
        //get proj links of each page
        let resp = await getProjectLinks(i)
        for (let j = 0; j < resp.length; j++) {
            //get raw data
            let raw_data = await getProjectInfo(resp[j])
            //norm data
            let proj = await normProject(raw_data, resp[j])
            
            //if proj exists stop scrapping
            let proj_exists = await containsProject(proj.proj_org_id, proj.source)
            if (proj_exists) {
                to_stop =true
                break}
            console.log(proj)
            proj.save()
        }
        console.log(i)
    }
    console.log("done")
}


async function getCountry(num) {
    let code = null
    for (let i = 0; i < enabel_countries.length; i++) {
        if (num == enabel_countries[i].num) {
            code = enabel_countries[i].code
            break
        }

    }
    let country = await Countries.findOne({ code: code })

    return country?._id
}

function get_image_src(img) {
    if (img != null && img.src != '') {
        return img.src
    }
    return null
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
    const statuses = { 'Execution': 'ongoing', 'Formulation': 'identification', 'Closed': 'closed' }
    try {
        let stat = await Status.findOne({ name: statuses[s] })
        return stat._id
    }
    catch (e) {
        return null
    }
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

async function containsProject(proj_org_id, source) {
    let proj = await ProjectPreProd.find({ proj_org_id: proj_org_id, source: source })
    return proj.length ? true : false
}