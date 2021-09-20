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
const { FuzzySearch } = require('mongoose-fuzzy-search-next');
const { get } = require("mongoose");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function getProjectInfo(index) {

    var url = "https://www.giz.de/projektdaten/region/-1/countries";
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    var page = (await browser.pages())[0];
    page.setDefaultNavigationTimeout(0);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // flow to list projects & create session to access project
    await page.click(".app-projectsearch__container > ng-select");
    await page.click(".ng-dropdown-panel.ng-select-multiple.ng-select-bottom > div > div:nth-child(2) > div:nth-child(1)", { waitUntil: 'domcontentloaded' });
    await page.click(".ng-dropdown-panel.ng-select-multiple.ng-select-bottom > div > div:nth-child(2) > div:nth-child(1)", { waitUntil: 'networkidle2' });
    await sleep(5000);

    // open project page in new tab
    var projectTab = await browser.newPage();
    const projectUrl = "https://www.giz.de/projektdaten/projects.action?submitAction=details&target=projects&infotypeSource=pbsprojekte&documentId=" + index + "&request_locale=en_GB&position=2";
    await projectTab.goto(projectUrl, { waitUntil: 'networkidle2' });

    let data = await projectTab.evaluate(() => {

        // project details
        const title = document.querySelector(".titel-box h1:nth-child(2)").innerText;
        const projectNumber = document.querySelector("#pbs > div > div:nth-child(2) > div:nth-child(1) > ul > li:nth-child(1) > span").innerText;
        const status = document.querySelector("#pbs > div > div:nth-child(2) > div:nth-child(1) > ul > li:nth-child(2) > span").innerText;
        const responsible = document.querySelector("#pbs > div > div:nth-child(2) > div:nth-child(1) > ul > li:nth-child(3) > span").innerText;
        const contact = document.querySelector("#pbs > div > div:nth-child(2) > div:nth-child(1) > ul > li:nth-child(4) > span").innerText;
        const partnerCountries = document.querySelector("#pbs > div > div:nth-child(2) > div:nth-child(1) > ul > li:nth-child(5) > span").innerText;

        //Summary
        const objectives = document.querySelector("#pbs > div > div:nth-child(2) > div.halbe-breite.rechts-ausgerichtet > ul > li:nth-child(1) > p").innerText;
        const client = document.querySelector("#pbs > div > div:nth-child(2) > div.halbe-breite.rechts-ausgerichtet > ul > li:nth-child(2) > p").innerText;
        const projectPartner = document.querySelector("#pbs > div > div:nth-child(2) > div.halbe-breite.rechts-ausgerichtet > ul > li:nth-child(3) > p").innerText;
        const financingOrganization = document.querySelector("#pbs > div > div:nth-child(2) > div.halbe-breite.rechts-ausgerichtet > ul > li:nth-child(4) > p").innerText;

        // project value
        const totalFinancialCommitment = document.querySelector("#pbs > div > div:nth-child(4) > div:nth-child(1) > ul > li:nth-child(1) > div > span").innerText;
        const projectFinancialCommitment = document.querySelector("#pbs > div > div:nth-child(4) > div:nth-child(1) > ul > li:nth-child(2) > div > span").innerText;

        // co-financing
        const cofinancersText = [];
        const cofinancers = document.querySelectorAll("#pbs > div > div:nth-child(4) > div.halbe-breite.rechts-ausgerichtet > ul > li > p");
        for (let i = 0; i < cofinancers.length; i++) { cofinancersText.push(cofinancers[i].innerText) };

        // previous projects
        const prevProjectsText = [];
        const prevProjects = document.querySelectorAll("#pbs > div > div:nth-child(6) > div:nth-child(1) > ul > li")
        for (let i = 0; i < prevProjects.length; i++) { prevProjectsText.push(prevProjects[i].innerText) };

        // follow-on projects
        const followOnProjectsText = [];
        const followOnProjects = document.querySelectorAll("#pbs > div > div:nth-child(6) > div.halbe-breite.rechts-ausgerichtet > ul > li");
        for (let i = 0; i < followOnProjects.length; i++) { followOnProjectsText.push(followOnProjects[i].innerText) };

        // term
        const entireProjectDate = document.querySelector("#pbs > div > div:nth-child(8) > div:nth-child(1) > ul > li:nth-child(1) > div > span").innerText;
        const actualProjectDate = document.querySelector("#pbs > div > div:nth-child(8) > div:nth-child(1) > ul > li:nth-child(2) > div > span").innerText;

        // other participants
        const otherParticipantsText = [];
        const otherParticipants = document.querySelectorAll("#pbs > div > div:nth-child(8) > div.halbe-breite.rechts-ausgerichtet > ul > li");
        for (let i = 0; i < otherParticipants.length; i++) { otherParticipantsText.push(otherParticipants[i].innerText) };

        const projectWebsites = document.querySelector("#pbs > div > div:nth-child(10) > div > ul > li > span").innerText;

        // policy markers list
        const policyMarkersList = document.querySelectorAll("#pbs > div > div:nth-child(12) > div:nth-child(1) > ul > li");
        const policyMarkers = [];
        for (let i = 0; i < policyMarkersList.length; i++) { policyMarkers.push(policyMarkersList[i].innerText) };

        // crs code
        const crsCode = document.querySelector("#pbs > div > div:nth-child(12) > div.halbe-breite.rechts-ausgerichtet > ul > li > span").innerText;
        //  description
        try {
            var description = document.querySelector("#pbs > div > div:nth-child(16) > div > span > p").innerText;
        } catch (error) {
            var description = "";
        }

        return {
            "title": title,
            "projectNumber": projectNumber,
            "status": status,
            "Responsible Organisational unit": responsible,
            "Contact person": contact,
            "Partner countries": partnerCountries,
            "objectives": objectives,
            "client": client,
            "Project Partner": projectPartner,
            "Financing Organization": financingOrganization,
            "Project Value": {
                "Total financial commitment": totalFinancialCommitment,
                "Financial commitment for this project number": projectFinancialCommitment
            },
            "Cofinancing": cofinancersText,
            "Previous Projects": prevProjectsText,
            "Follow-on projects": followOnProjectsText,
            "term": {
                "Entire project": entireProjectDate,
                "Actual project": actualProjectDate
            },
            "other participants": otherParticipantsText,
            "contact": { "project websites": projectWebsites },
            "Policy markers": policyMarkers,
            "CRS code": crsCode,
            "description": description,


        }
    });
    // console.log(data);
    await browser.close();
    return data
}

async function iati_status_norm(status_code) {
    statuses = [
        ['completed', '3'],
        ['closed', '4'],
        ['identification', '1'],
        ['approved', ''],
        ['lending', ''],
        ['ongoing', '2'],
        ['cancelled', '5'],
        ['suspended', '6']
    ]
    let status_id = null;
    var status_tmp = null;

    for (let i = 0; i < statuses.length; i++) {
        if (status_code == statuses[i][1]) {
            status_tmp = statuses[i][0]
            status_id = await Status.find({ name: status_tmp })
            status_id = status_id[0]._id
            break
        }
    }
    return status_id;
}

function giz_status_code(status) {
    if (status.replace("\n", "") == "laufendes Projekt") return '2'
    if (status.replace("\n", "") == "Projekt beendet") return '3'
    return null
}

async function giz_aid_project(project) {
    const raw_data = project
    const name = project.title
    const proj_org_id = project.projectNumber.replace("\n", '')
        //status
    const status_code = giz_status_code(project.status)
    const status = await iati_status_norm(status_code)
        //task manager
    const contact = project["Contact person"].split('    ')
    const email = contact[1]
    const fullname = contact[0]
    const user = await get_user(fullname, email)
        // country
    const countries_list = project['Partner countries'].split(',')
    var counts = []
    for (let i = 0; i < countries_list.length; i++) {
        let tmp = await iati_country_norm(countries_list[i])
        if (tmp) counts.push(tmp._id)
    }
    //descriptions
    const description = project.description
    const objectives = project.objectives
        // thematique
    const thematique = await getSector(objectives)
        //total cost
    const total_cost = project["Project Value"] ? project["Project Value"]["Total financial commitment"].replace("\n", '') : null
        //dates
    const dates = project.term ? project.term["Actual project"].split(' - ') : []
    const actual_start = dates.length ? get_date(dates[0]) : null
    const actual_end = dates.length > 1 ? get_date(dates[1]) : null
        //  funder
    const funder_str = project["Financing Organization"] == "not available" ? null : project["Financing Organization"]
    const funder = await getFunder(funder_str)
        // implementer
    const implementer_str = project["Project Partner"] == "not available" ? null : project["Project Partner"]
    const implementer = await getImplementer(implementer_str)
        //sub_funder
    const sub_funder_str = project["Cofinancing"][0] == "not available" ? [] : project["Cofinancing"]
    var sub_funder_preprocess = []

    const sub_funder = await getSubFunder(sub_funder_str)


    return [{
        source: "giz.de/projektdaten",
        proj_org_id: proj_org_id,
        name: name,
        status: status,
        task_manager: user,
        description: description,
        thematique: thematique,
        funder: funder,
        implementer: implementer,
        sub_funder: sub_funder,
        objectives: objectives,
        total_cost: total_cost,
        actual_start: new Date(actual_start),
        actual_end: new Date(actual_end),
        raw_data_org: raw_data
    }, counts]

}

function get_date(date) {
    const dmy = date.split('.')
    return dmy[1] + '.' + dmy[0] + '.' + dmy[2]
}
exports.getProjects = async(req, res, next) => {
    data = [];
    for (let i = 0; i < 500; i++) {
        console.log(i);
        try {

            const project = await getProjectInfo(i);

            var tmp = await giz_aid_project(project)
            var project_data = tmp[0]
            var countries = tmp[1]
            var project_to_save = null
            let proj_exists = await containsProject(project_data.proj_org_id)
            if (proj_exists) {
                console.log("UPDATE!!!!!!!!")
                if (countries == null) {
                    project_to_save = await ProjectPreProd.updateOne({ proj_org_id: project_data.proj_org_id }, { $set: project_data })
                        //  console.log(project_data);
                    continue
                }
                if (countries.length == 0) {
                    project_to_save = await ProjectPreProd.updateOne({ proj_org_id: project_data.proj_org_id }, { $set: project_data })
                        //  console.log(project_data);
                    continue
                }
                for (let i = 0; i < countries.length; i++) {
                    project_data.country = countries[i]
                    project_to_save = await ProjectPreProd.updateOne({ proj_org_id: project_data.proj_org_id, country: countries[i] }, { $set: project_data })
                        //  console.log(project_data);
                }

            } else {
                console.log("NEW!!!!!!!!")
                if (countries == null) {
                    project_to_save = new ProjectPreProd(project_data)
                    project_to_save.save()
                        //    console.log(project_data);
                    continue
                }
                if (countries.length == 0) {
                    project_to_save = new ProjectPreProd(project_data)
                    project_to_save.save()
                        //   console.log(project_data);
                    continue
                }
                for (let i = 0; i < countries.length; i++) {
                    project_data.country = countries[i]
                    project_to_save = new ProjectPreProd(project_data)
                    project_to_save.save()
                        //   console.log(project_data);
                }
            }


        } catch (error) {
            console.log(error);
            continue;
        }
    }



}

exports.newProjects = async(req, res, next) => {
    data = [];
    for (let i = 0; i < 1000; i++) {
        console.log(i);
        try {

            const project = await getProjectInfo(i);

            var tmp = await giz_aid_project(project)
            var project_data = tmp[0]
            var countries = tmp[1]
            var project_to_save = null
            let proj_exists = await containsProject(project_data.proj_org_id)
            if (proj_exists) {
                console.log("Done!!!!!!!!")
                break


            } else {
                console.log("NEW!!!!!!!!")
                if (countries == null) {
                    project_to_save = new ProjectPreProd(project_data)
                    project_to_save.save()
                        //    console.log(project_data);
                    continue
                }
                if (countries.length == 0) {
                    project_to_save = new ProjectPreProd(project_data)
                    project_to_save.save()
                        //   console.log(project_data);
                    continue
                }
                for (let i = 0; i < countries.length; i++) {
                    project_data.country = countries[i]
                    project_to_save = new ProjectPreProd(project_data)
                    project_to_save.save()
                        //   console.log(project_data);
                }
            }


        } catch (error) {
            console.log(error);
            continue;
        }
    }



}

async function get_user(fullname, email) {
    let user_id = null;
    let found_user = await User.find({ fullname: fullname, email: email });
    if (found_user.length > 0) {
        user_id = found_user[0]._id;
    } else {
        let tmp_user = new User({ fullname: fullname, email: email })
        tmp_user.save()
        let found_user = await User.find({ fullname: fullname, email: email });
        if (found_user.length > 0) user_id = found_user[0]._id;
    }
    return user_id;
}

async function iati_country_norm(name) {

    if (name == 'Zaire') name = 'Congo, The Democratic Republic of the'
    let country_id = await Countries.find(FuzzySearch(['name'], name))
    if (country_id) {
        if (country_id.length > 0) return country_id[0]
    }

    return null;
}

exports.interrupted = async(req, res, next) => {
    const interr = await Params.find({ source_id: "GIZ" })
    return interr[0].interrupted


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