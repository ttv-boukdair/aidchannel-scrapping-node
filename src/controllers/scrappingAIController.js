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


let orgs_id_iati = ['46002', '44000']

const url_iati_base = "https://datastore.codeforiati.org/api/1/access/activity.json"

exports.interrupted = async(req, res, next) => {
    const interr = await Params.find({ source_id: "IATI" })
    return interr[0].interrupted


}
async function existsDB(id) {

    let response = await ProjectPreProd.find({ source_id: id });
    console.log(response)
    if (response == null) return false
    if (response.length == 0) return false
    return true
}
async function getParams() {

    let response = await Params.find({ source_id: "IATIv2" });
    if (response[0].interrupted == true)
        return [response[0].offset, response[0].interrupted, response[0].row]
    return [0, response[0].interrupted, 0]

}

async function clean_interrupted(source_id) {
    await ProjectPreProd.deleteMany({ source_id: source_id })
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

async function get_docs_number() {
    const url_size = url_iati_base + "?limit=1"
    let response = await axios.get(url_size, {
        headers: { 'User-Agent': 'Axios 0.21.1' }
    });
    return parseInt(response.data['total-count']) % 100 ? parseInt(parseInt(response.data['total-count']) / 100) + 1 : parseInt(response.data['total-count']) / 100
}

function getOffPages(off) {
    return parseInt(off / 100)
}

async function orgMajProject(source_id) {
    let proj = await ProjectPreProd.find({ source_id: source_id })
    if (proj.length == 0) return false
    return proj[0].org_id ? true : false
}
async function containsProject(source_id) {
    let proj = await ProjectPreProd.find({ source_id: source_id })
    return proj.length ? true : false
}

function iati_name(project) {
    let name = null
    if (isString(project.title.narrative)) {
        name = project.title.narrative
    } else {
        try {
            if (isString(project.title.narrative.text)) {
                name = project.title.narrative.text
            } else {
                try {
                    for (let t = 0; t < project.title.narrative.length; t++) {
                        if (lngDetector.detect(project.title.narrative[t].text)[0][0] == 'english')
                            name = project.title.narrative[t].text
                    }
                } catch (e) { name = null }
            }
        } catch (e) {
            name = null
        }
    }
    if (name == null) {
        try {
            name = lngDetector.detect(project.title.text)[0][0] == 'english' ? project.title.text : null
        } catch (e) {
            if (isString(project.title)) name = project.title
        }
    }
    return name
}



function iati_descriptions(project) {
    let description = null
    let objectives = null
    let beneficiaries = null
    try {
        if (isString(project.description.narrative)) { description = project.description.narrative } else {
            try {
                for (let d = 0; d < project.description.length; d++) {
                    if (project.description[d].type == '1') {
                        try {
                            for (let t = 0; t < project.description[d].narrative.length; t++) {
                                if (lngDetector.detect(project.description[d].narrative[t].text)[0][0] == 'english')
                                    description = project.description[d].narrative[t].text
                            }

                        } catch (e) {
                            description = project.description[d].narrative
                        }
                    }
                    if (project.description[d].type == '2') {
                        try {
                            for (let t = 0; t < project.description[d].narrative.length; t++) {
                                if (lngDetector.detect(project.description[d].narrative[t].text)[0][0] == 'english')
                                    objectives = project.description[d].narrative[t].text
                            }

                        } catch (e) {
                            objectives = project.description[d].narrative
                        }
                    }
                    if (project.description[d].type == '3') {
                        try {
                            for (let t = 0; t < project.description[d].narrative.length; t++) {
                                if (lngDetector.detect(project.description[d].narrative[t].text)[0][0] == 'english')
                                    beneficiaries = project.description[d].narrative[t].text
                            }

                        } catch (e) {
                            beneficiaries = project.description[d].narrative
                        }
                    }
                }
            } catch (e) { console.log(e) }
        }

        if (description == null) {
            try {
                description = lngDetector.detect(project.description.text)[0][0] == 'english' ? project.description.text : null
            } catch (e) {}
        }
    } catch (e) {}
    return [description, objectives, beneficiaries]
}


function iati_orgs(project) {
    let iati_org = []
    if (project["participating-org"]) {
        if (project["participating-org"].narrative) {
            iati_org.push([project["participating-org"].role, project["participating-org"].narrative])
        } else {
            for (let o = 0; o < project["participating-org"].length; o++)
                iati_org.push([project["participating-org"][o].role, project["participating-org"][o].narrative])
        }
        if (project["participating-org"].text) {
            iati_org.push([project["participating-org"].role, project["participating-org"].text])
        }

    }
    return iati_org
}

function iati_status_code(project) {
    var status_code = null
    if (project['activity-status']) {
        status_code = project['activity-status'].code ?
            project['activity-status'].code :
            null;
    } else {
        if (isString(project['activity-status'])) status_code = project['activity-status']
        else status_code = null
    }
    return status_code
}

async function iati_region_and_countries(project) {
    let country = null
    let region = null
    let multinational = false
    let country_id = null
    let region_id = null

    try {
        if (project['recipient-country']) {
            var country_code = project['recipient-country'].code ? project['recipient-country'].code : null;
            country = await iati_country_norm(country_code)
            console.log(country)
            if (country) country_id = country._id
        } else {
            if (project['recipient-region']) {

                var region_code = project['recipient-region'].code ? project['recipient-region'].code : null;
                region = await iati_region_norm(region_code)
                console.log(region_code)
                console.log(region)
                if (region) {
                    region_id = region._id
                    if (region.countries.length > 0) multinational = true
                }
            }
        }
    } catch (e) {}
    return [country, region, multinational, country_id, region_id]
}

function iati_sector_code(project) {
    var thematique_code = null
    if (project.sector) {
        thematique_code = project.sector.code ? project.sector.code : null;
    } else {

        thematique_code = null
    }
    return thematique_code
}

function iati_total_cost(project) {
    var total_cost = null
    var cost = ''
    var currency = ''
    if (project['default-currency']) {
        currency = project['default-currency']
    }
    if (project['transaction']) {
        if (project['transaction'].value) {
            cost = project['transaction'].value.text
        } else {
            cost = project['transaction'][0].value.text
        }
    }
    if (cost == '') total_cost = null
    else total_cost = currency + ' ' + cost
    return total_cost
}


async function maj_date_recent(source_id, maj_date) {
    let proj = await ProjectPreProd.find({ source_id: source_id })
    if (proj.length == 0) return false
    if (new Date(proj[0].maj_date) >= new Date(maj_date)) return true
    else return false

}
exports.scrappingIATI = async(req, res, next) => {
    const max = 100
    const tmp = await getParams()
    const skip_off = tmp[0]
    const interrupted = tmp[1]
    const row = tmp[2]
    var cleaned = false
    var offset = 0
    const n_docs = await get_docs_number()
    let results = []

    for (let i = 0; i < n_docs; i++) {
        offset = i * max
        console.log(offset)
        console.log(skip_off)
        if (offset < skip_off) {
            continue
        }
        const url_iati = url_iati_base + "?limit=" + max + "&offset=" + offset
        console.log(url_iati)
        results.push(url_iati)
        let response = await axios.get(url_iati, {
            headers: { 'User-Agent': 'Axios 0.21.1' }
        });

        var projects = response.data["iati-activities"]
        console.log(projects)
        for (let j = 0; j < projects.length; j++) {

            console.log(j)
            let project = projects[j]['iati-activity']

            const source_id = project['iati-identifier'] ? project['iati-identifier'] : null;

            // GET UPDATED TIME
            let maj_date = project['last-updated-datetime']

            //IF INFO IS MAJ by rep org skip

            const exists_proj = await orgMajProject(source_id)
            console.log(exists_proj)
            if (exists_proj) continue
                //IF MAJDATE SAME SKIP
            const maj = await maj_date_recent(source_id, maj_date)
            console.log(maj)
            if (maj) continue
                //CLEAN AT RESUME SCRAPPING
            if (cleaned == false) {
                if (interrupted && j == (row + 1)) {
                    await clean_interrupted(source_id)
                    cleaned = true
                }
            }
            // GET NAME
            let name = iati_name(project)


            // GET DESCRIPTIONS
            let descriptions = iati_descriptions(project)
            let description = descriptions[0]
            let objectives = descriptions[1]
            let beneficiaries = descriptions[2]

            // GET ORGZ
            // GET ORGZ PREPROCESS
            let iati_org = iati_orgs(project)
            let tmp = null
            let funder = null
            let implementer = null
            let sub_funder = []
            let sub_implementer = []

            //GET FUNDER
            try {
                tmp = await getFunder(iati_org)
                funder = tmp[0]
                iati_org = tmp[1]
            } catch (e) {}

            //GET IMPLEMENTER
            try {
                tmp = await getImplementer(iati_org)
                implementer = tmp[0]
                iati_org = tmp[1]
            } catch (e) {}

            //GET SUB-FUNDER
            try {
                tmp = await getSubFunder(iati_org)
                sub_funder = tmp[0]
                iati_org = tmp[1]
            } catch (e) {}

            //GET SUB-IMPLEMENTER
            try {
                tmp = await getSubImplementer(iati_org)
                sub_implementer = tmp[0]
                iati_org = tmp[1]
            } catch (e) {}

            // GET STATUS
            var status_code = iati_status_code(project)

            var status = await iati_status_norm(status_code);

            // GET COUNTRY
            let tmp_countries_region = await iati_region_and_countries(project)
            let country = tmp_countries_region[0]
            let region = tmp_countries_region[1]
            let multinational = tmp_countries_region[2]
            let country_id = tmp_countries_region[3]
            let region_id = tmp_countries_region[4]
            let countries_ids = region ? region.countries : []

            // GET THEMATIQUE
            var thematique_code = iati_sector_code(project)
            try {
                var thematique = await iati_sector_norm(thematique_code);
            } catch (e) {
                var thematique = null
            }
            //GET COST
            var total_cost = iati_total_cost(project)
                // GET DATES
            let dates = itai_activity_dates(project['activity-date'])

            let approval_date = dates[0] ? new Date(dates[0]) : null
            let actual_start = dates[1] ? new Date(dates[1]) : null
            let planned_end = dates[2] ? new Date(dates[2]) : null
            let actual_end = dates[3] ? new Date(dates[3]) : null

            // GET USER
            let user = null
            if (project['contact-info']) user = await get_user(project['contact-info'])
                //Project save
            let proj_exist = await containsProject(source_id)
            if (proj_exist == false) {
                if (countries_ids.length > 0) {
                    for (let i = 0; i < countries_ids.length; i++) {
                        let project_to_save = new ProjectPreProd({
                            source_id: source_id,
                            name: name,
                            funder: funder,
                            implemeter: implementer,
                            sub_funder: sub_funder,
                            sub_implementer: sub_implementer,
                            description: description,
                            objectives: objectives,
                            beneficiaries: beneficiaries,
                            status: status,
                            country: countries_ids[i]._id,
                            region: region_id,
                            thematique: thematique,
                            total_cost: total_cost,
                            approval_date: approval_date,
                            actual_start: actual_start,
                            planned_end: planned_end,
                            actual_end: actual_end,
                            maj_date: maj_date,
                            task_manager: user,
                            multinational: multinational,
                            raw_data_iati: project

                        })
                        project_to_save.save()
                        console.log(project_to_save)
                    }
                    await Params.updateOne({ source_id: "IATIv2" }, { $set: { interrupted: true, multinational: true, row: j, offset: offset } })
                } else {
                    let project_to_save = new ProjectPreProd({
                        source_id: source_id,
                        name: name,
                        funder: funder,
                        implemeter: implementer,
                        sub_funder: sub_funder,
                        sub_implementer: sub_implementer,
                        description: description,
                        objectives: objectives,
                        beneficiaries: beneficiaries,
                        status: status,
                        country: country_id,
                        region: region_id,
                        thematique: thematique,
                        total_cost: total_cost,
                        approval_date: approval_date,
                        actual_start: actual_start,
                        planned_end: planned_end,
                        actual_end: actual_end,
                        maj_date: maj_date,
                        task_manager: user,
                        multinational: multinational,
                        raw_data_iati: project

                    })
                    project_to_save.save()
                    console.log(project_to_save)
                    await Params.updateOne({ source_id: "IATIv2" }, { $set: { interrupted: true, multinational: false, row: j, offset: offset } })
                }

            } else {
                if (countries_ids.length > 0) {
                    for (let i = 0; i < countries_ids.length; i++) {
                        let proj_c = await ProjectPreProd.find({ source_id: source_id, country: countries_ids[i]._id, })
                        let project_to_save = null
                        if (proj_c.length) {
                            project_to_save = await ProjectPreProd.updateOne({ source_id: source_id, country: countries_ids[i]._id, }, {
                                $set: {
                                    source_id: source_id,
                                    name: name,
                                    funder: funder,
                                    implemeter: implementer,
                                    sub_funder: sub_funder,
                                    sub_implementer: sub_implementer,
                                    description: description,
                                    objectives: objectives,
                                    beneficiaries: beneficiaries,
                                    status: status,
                                    country: countries_ids[i]._id,
                                    region: region_id,
                                    thematique: thematique,
                                    total_cost: total_cost,
                                    approval_date: approval_date,
                                    actual_start: actual_start,
                                    planned_end: planned_end,
                                    actual_end: actual_end,
                                    maj_date: maj_date,
                                    task_manager: user,
                                    multinational: multinational,
                                    raw_data_iati: project

                                }
                            })
                        } else {
                            project_to_save = new ProjectPreProd({
                                source_id: source_id,
                                name: name,
                                funder: funder,
                                implemeter: implementer,
                                sub_funder: sub_funder,
                                sub_implementer: sub_implementer,
                                description: description,
                                objectives: objectives,
                                beneficiaries: beneficiaries,
                                status: status,
                                country: countries_ids[i]._id,
                                region: region_id,
                                thematique: thematique,
                                total_cost: total_cost,
                                approval_date: approval_date,
                                actual_start: actual_start,
                                planned_end: planned_end,
                                actual_end: actual_end,
                                maj_date: maj_date,
                                task_manager: user,
                                multinational: multinational,
                                raw_data_iati: project

                            })
                            project_to_save.save()
                        }
                        console.log(project_to_save)
                    }
                    await Params.updateOne({ source_id: "IATIv2" }, { $set: { interrupted: true, multinational: true, row: j, offset: offset } })
                } else {
                    let project_to_save = await ProjectPreProd.updateOne({ source_id: source_id }, {
                        $set: {
                            source_id: source_id,
                            name: name,
                            funder: funder,
                            implemeter: implementer,
                            sub_funder: sub_funder,
                            sub_implementer: sub_implementer,
                            description: description,
                            objectives: objectives,
                            beneficiaries: beneficiaries,
                            status: status,
                            country: country_id,
                            region: region_id,
                            thematique: thematique,
                            total_cost: total_cost,
                            approval_date: approval_date,
                            actual_start: actual_start,
                            planned_end: planned_end,
                            actual_end: actual_end,
                            maj_date: maj_date,
                            task_manager: user,
                            multinational: multinational,
                            raw_data_iati: project

                        }
                    })
                    console.log(project_to_save)
                }
                await Params.updateOne({ source_id: "IATIv2" }, { $set: { interrupted: true, multinational: false, row: j, offset: offset } })
            }

        }

    }
    await Params.updateOne({ source_id: "IATIv2" }, { $set: { interrupted: false, multinational: false, row: 0, offset: 0 } })

}




function get_image_src(img) {
    if (img != null) {
        return img.src
    }
    return null
}


async function iati_country_norm(country_code) {
    let code = country_code
    if (code == 'ZR') code = 'CD'
    let country_id = await Countries.find({ code: code })
    if (country_id) {
        if (country_id.length > 0) return country_id[0]
    }

    return null;
}

async function iati_region_norm(country_code) {
    let code = country_code
    let country_id = await Regions.find({ region_code: code })

    console.log(country_id)
    if (country_id) {
        if (country_id.length > 0) return country_id[0]
    }

    return country_id;
}

function itai_activity_dates(dates) {
    let types = ['start-planned', 'start-actual', 'end-planned', 'end-actual']
    let res_dates = [null, null, null, null]
    let ind = null
    if (dates) {
        if (dates['iso-date']) {
            if (types.includes(dates['type'])) ind = types.indexOf(dates['type'])
            else ind = parseInt(dates['type'])
            res_dates[ind] = dates['iso-date']

        } else {
            for (let i = 0; i < dates.length; i++) {
                if (types.includes(dates[i]['type'])) ind = types.indexOf(dates[i]['type'])
                else ind = parseInt(dates[i]['type'])
                res_dates[ind - 1] = dates[i]['iso-date']
            }
        }
    }

    return res_dates
}

async function iati_sector_norm(sector_code) {
    let sector_id = null;
    if (sector_code == null) {
        return null
    }

    for (let i = 0; i < SectorsDATA.length; i++) {
        if (sector_code == SectorsDATA[i].IATI) {
            sector_id = await Thematiques.find({ name: SectorsDATA[i].AID })
            if (sector_id != null) {
                if (sector_id.length > 0) { sector_id = sector_id[0]._id } else {
                    sector_id = null
                }
            }

            break
        }
    }
    if (sector_id == null) {
        for (let i = 0; i < SectorsDATA.length; i++) {
            if (SectorsDATA[i].IATI.includes(sector_code)) {
                sector_id = await Thematiques.find({ name: SectorsDATA[i].AID })
                if (sector_id != null) {
                    if (sector_id.length > 0) { sector_id = sector_id[0]._id } else {
                        sector_id = null
                    }
                }

                break
            }
        }
    }

    return sector_id;
}

async function iati_status_norm(status_code) {
    statuses = [
        ['Pipeline/identification', '1'],
        ['Implementation', '2'],
        ['Finalisation', '3'],
        ['Closed', '4'],
        ['Cancelled', '5'],
        ['Suspended', '6'],
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



async function getFunder(iati_org) {
    let funder = null;

    if (iati_org) {
        //console.log(iati_org)
        if (iati_org.length > 0) {
            for (let i = 0; i < iati_org.length; i++) {
                if (iati_org[i][0] == '1' || iati_org[i][1] == 'Funding') {
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
                    iati_org.splice(i, 1)
                    if (finded_organizations.length > 0)
                        funder = finded_organizations[0][0];
                    break
                    // else funder = "not exist";
                }
            }
        }
    }
    return [funder, iati_org];
}
async function getSubFunder(iati_org, funder) {
    const funder_object_id = "60c23ffc2b006960f055e8ef";
    let sub_funder = [];
    if (iati_org) {
        if (iati_org.length > 0) {
            for (let i = 0; i < iati_org.length; i++) {
                if (iati_org[i][0] == '1' || iati_org[i][0] == '3' || iati_org[i][0] == 'Funding' || iati_org[i][0] == 'Extending') {
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

async function getImplementer(iati_org) {

    let funder = null;
    if (iati_org) {
        if (iati_org.length > 0) {
            for (let i = 0; i < iati_org.length; i++) {
                if (iati_org[i][0] == '4' || iati_org[i][0] == 'Implementing') {
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
                    iati_org.splice(i, 1)
                    finded_organizations = finded_organizations.data
                    if (finded_organizations.length > 0)
                        funder = finded_organizations[0][0];
                    break
                    // else funder = "not exist";
                }
            }
        }
    }
    return [funder, iati_org];
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
async function get_user(user) {
    let user_id = null;
    let fullname = null
    let email = user['email']
    let phone = user['telephone']
    let address = null
    let job_title = null

    if (user['person-name']) {
        fullname = user['person-name'].narrative
        if (isString(fullname) == false && fullname != null) fullname = fullname.text
    }
    if (user['mailing-address']) {
        address = user['mailing-address'].narrative
        if (isString(address) == false && address != null) address = address.text
    }
    if (user['job-title']) {
        job_title = user['job-title'].narrative
        if (isString(job_title) == false && job_title != null) job_title = job_title.text
    }
    let found_user = await User.find({
        fullname: fullname,
        email: email
    });
    if (found_user.length > 0) {
        user_id = found_user[0]._id;
    } else {
        let tmp_user = new User({
            fullname: fullname,
            email: email,
            phone: phone,
            adress: address,
            job_title: job_title
        })
        tmp_user.save()
        let found_user = await User.find({ fullname: fullname, email: email });
        if (found_user.length > 0) user_id = found_user[0]._id;
    }
    return user_id;
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