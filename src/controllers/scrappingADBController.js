var Organization = require("../models/organization")
const https = require('https');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require("axios");
const agent = new https.Agent({
    rejectUnauthorized: false
});
var Status = require("../models/status");
var Countries = require("../models/country");
var Regions = require("../models/regions");
var User = require("../models/user2");
const puppeteer = require("puppeteer");

var ProjectAI = require("../models/projectai");
var ProjectPreProd = require("../models/projectpreprod");
const { FuzzySearch } = require('mongoose-fuzzy-search-next');
const impact = require("../models/impact");



async function getProjectInfo(link) {

    // let response = await axios(link);
    // var dom =  new JSDOM(response.data);
    //console.log(response.data);
    var browser = await puppeteer.launch({ headless: true ,args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    var page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    await page.goto(link, { waitUntil: 'networkidle2' });

    const info = await page.evaluate(() => {

        const first_part = document.querySelector("table.pds").querySelectorAll("td");
        // const second_part = document.querySelectorAll("table.pds")[1];
        const source = "www.adb.org";
        const name = first_part[1].innerText;
        const number = first_part[3].innerText;
        const country = first_part[5].innerText;
        const status = first_part[7].innerText;
        const type = document.querySelector("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(5) > td:nth-child(2)").innerText;
        const sectors = document.querySelector("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(9) > td:nth-child(2)").innerText;
        const gender = document.querySelector("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(10) > td:nth-child(2)").innerText;
        const description = document.querySelector("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(11) > td:nth-child(2)").innerText;
        const rationale = document.querySelector("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(12) > td:nth-child(2)").innerText;
        const projectImpact = document.querySelector("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(13) > td:nth-child(2)").innerText;

        // Source of Funding / Amount
        const funding = document.querySelectorAll("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(2) > table > tbody > tr");
        const funders = [];
        for (let i = 0; i < funding.length; i++) { funders.push(funding[i].innerText); };

        const agendas = document.querySelector("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(7) > td:nth-child(2)").innerText;
        const driversOfChange = document.querySelector("#project-pds > div > div > div > table:nth-child(1) > tbody > tr:nth-child(8) > td:nth-child(2)").innerText;

        const outcome_descr = document.querySelector("#project-pds > div > div > div > div:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2)").innerText;
        const outcomeProgress = document.querySelector("#project-pds > div > div > div > div:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(2)").innerText;
        const output_descr = document.querySelector("#project-pds > div > div > div > div:nth-child(2) > table > tbody > tr:nth-child(5) > td:nth-child(2)").innerText;
        const ImplementationProgress = document.querySelector("#project-pds > div > div > div > div:nth-child(2) > table > tbody > tr:nth-child(6) > td:nth-child(2)").innerText;
        const geoLocation = document.querySelector("#project-pds > div > div > div > div:nth-child(2) > table > tbody > tr:nth-child(7) > td:nth-child(2)").innerText;

        const envAspects = document.querySelector("#project-pds > div > div > div > div:nth-child(3) > table > tbody > tr:nth-child(2) > td:nth-child(2)").innerText;
        const resettlement = document.querySelector("#project-pds > div > div > div > div:nth-child(3) > table > tbody > tr:nth-child(3) > td:nth-child(2)").innerText;
        const indigenous = document.querySelector("#project-pds > div > div > div > div:nth-child(3) > table > tbody > tr:nth-child(4) > td:nth-child(2)").innerText;
        const prjDesign = document.querySelector("#project-pds > div > div > div > div:nth-child(3) > table > tbody > tr:nth-child(6) > td:nth-child(2)").innerText;
        const prjImplementation = document.querySelector("#project-pds > div > div > div > div:nth-child(3) > table > tbody > tr:nth-child(7) > td:nth-child(2)").innerText;

        // try {
        //     // exists only in some projects ************************
        //     const consultingServices = document.querySelector("#project-pds > div > div > div > div:nth-child(4) > table > tbody > tr:nth-child(2) > td:nth-child(2)").innerText;
        //     const Procurement = document.querySelector("#project-pds > div > div > div > div:nth-child(4) > table > tbody > tr:nth-child(3) > td:nth-child(2)").innerText;

        //     // these change their positions in dom
        //     var responsibleAdbOfficer = document.querySelector("#project-pds > div > div > div > table:nth-child(5) > tbody > tr:nth-child(1) > td:nth-child(2)").innerText;
        //     var responsibleAdbDepartment = document.querySelector("#project-pds > div > div > div > table:nth-child(5) > tbody > tr:nth-child(2) > td:nth-child(2)").innerText;
        //     var responsibleAdbDivision = document.querySelector("#project-pds > div > div > div > table:nth-child(5) > tbody > tr:nth-child(3) > td:nth-child(2)").innerText;
        //     var executingAgencies = document.querySelector("#project-pds > div > div > div > table:nth-child(5) > tbody > tr:nth-child(4) > td:nth-child(2)").innerText;


        // } catch (error) {
        //     const consultingServices = "";
        //     const Procurement = "";
        //     // var responsibleAdbOfficer = document.querySelector("#project-pds > div > div > div > table:nth-child(4) > tbody > tr:nth-child(1) > td:nth-child(2)").innerText;
        // var responsibleAdbDepartment = document.querySelector("#project-pds > div > div > div > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(2)").innerText;
        // var responsibleAdbDivision = document.querySelector("#project-pds > div > div > div > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(2)").innerText;
        // var executingAgencies = document.querySelector("#project-pds > div > div > div > table:nth-child(4) > tbody > tr:nth-child(4) > td:nth-child(2)").innerText;

        // }
        // *****************************************************







        // const last_update_date = document.querySelector("#project-pds > div > div > div > div:nth-child(5) > table > tbody > tr:nth-child(7) > td:nth-child(2)").innerText;
        // const Approval_date = document.querySelector("#project-pds > div > div > div > div:nth-child(7) > table > tbody > tr:nth-child(4) > td:nth-child(1)").innerText;
        // const start_date = document.querySelector("#project-pds > div > div > div > div:nth-child(7) > table > tbody > tr:nth-child(4) > td:nth-child(3)").innerText;
        // const closed_date_original = document.querySelector("#project-pds > div > div > div > div:nth-child(7) > table > tbody > tr:nth-child(4) > td:nth-child(4)").innerText;
        // const closed_date_rivised = document.querySelector("#project-pds > div > div > div > div:nth-child(7) > table > tbody > tr:nth-child(4) > td:nth-child(5)").innerText;


        return {
            "source": source,
            "Project Name": name,
            "Project Number": number,
            "Country": country,
            "Project status": status,
            "Project Type / Modality of Assistance": type,
            "Source of Funding / Amount": funders,
            "Strategic Agendas": agendas,
            "Drivers of Change": driversOfChange,
            "Sector / Subsector": sectors,
            "Gender Equity and Mainstreaming": gender,
            "Description": description,
            "Project Rationale and Linkage to Country/Regional Strategy": rationale,
            "Impact": projectImpact,
            "Project Outcome": {
                "Description of Outcome": outcome_descr,
                "Progress Toward Outcome": outcomeProgress
            },
            "Implementation Progress": {
                "Description of Project Outputs": output_descr,
                "Status of Implementation Progress (Outputs, Activities, and Issues)": ImplementationProgress
            },
            "Geographical Location": geoLocation,

            "Summary of Environmental and Social Aspects": {
                "Environmental Aspects": envAspects,
                "Involuntary Resettlement": resettlement,
                "Indigenous Peoples": indigenous,
                "Stakeholder Communication, Participation, and Consultation": {
                    "During Project Design": prjDesign,
                    "During Project Implementation": prjImplementation
                }
            },

            // "Responsible ADB Officer:": responsibleAdbOfficer,
            // "Responsible ADB Department": responsibleAdbDepartment,
            // "Responsible ADB Division": responsibleAdbDivision,
            // "Executing Agencies": executingAgencies,

            // "description": description,
            // "impact": impact,
            // "approval_date": Approval_date,
            // "actual_start": start_date,
            // "planned_end": closed_date_original,
            // "actual_end": closed_date_rivised,
            // "maj_date": last_update_date
        };

    });
    await browser.close();
    return info;




}

async function getProjectsLinks(adbUrl) {
    let response = await axios(adbUrl);
    const dom = new JSDOM(response.data);
    const links = dom.window.document.querySelectorAll("div.item-title > a");
    return Array.from(links, a => "https://www.adb.org/" + a["href"] + "#project-pds");
}

exports.getADBProjects = async(req, res, next) => {

    const base_url = "https://www.adb.org/projects?page=0";
    const links = await getProjectsLinks(base_url);
    console.log(links);

    const projects = [];
    for (var i = 0; i < links.length; i++) {
        console.log(i);
        // if (i == 2) break;
        var project = await getProjectInfo(links[i]);
        projects.push(project);
    }

    res.status(200).json(projects);
}