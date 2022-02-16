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
var Project = require("../models/projectpreprod");
var SectorsDATA = require("../data/sectors.json");
const User = require("../models/user2");
const LanguageDetect = require('languagedetect');
const { off } = require("process");
const lngDetector = new LanguageDetect();
const agent = new https.Agent({
  rejectUnauthorized: false
});

exports.newAFDProjects = async(req, res) => {
    const url = "https://opendata.afd.fr/api/records/1.0/search/?dataset=donnees-aide-au-developpement-afd&q=&sort=date_d_octroi&refine.pays_de_realisation=MAROC&refine.etat_du_projet=Exécution&lang=en&rows=2000";
    const projects = await axios.get(url);
    const dataset = projects.data.records;
    var count = dataset.length;
    const raw_data = [];
    for (let i = 0; i < dataset.length; i++) {
        
        const { datasetid, recordid, geometry, record_timestamp } = dataset[i];
        const {
            id_concours,
            date_de_1er_versement_projet,
            libelle_indicateur_apd,
            versements_euro,
            societe,
            date_d_octroi,
            description_du_projet,
            decaissement_annuel,
            libelle_cicid,
            libelle_agence,
            date_de_la_derniere_publication,
            date_de_publication_nco,
            pays_de_realisation,
            libelle_beneficiaire_primaire,
            division_technique,
            date_de_signature_de_convention,
            groupe_de_produit,
            latitude,
            publie_dans_le_xml_de_campagne,
            etat_du_projet,
            lien_fiche_projet,
            cofinanciers_o_n,
            libelle_risque_souverain,
            valeur_fixe0,
            valeur_fixe1,
            valeur_fixe2,
            engagements_bruts_euro,
            nom_du_projet_pour_les_instances,
            valeur_fixe,
            geo,
            date_mise_a_jour_donnees_projet,
            libelle_secteur_economique_cad_5,
            budget,
            longitude,
            id_projet,
            region
        } = dataset[i].fields;
        let proj_exists = await containsProject("https://opendata.afd.fr", id_projet)
        if (proj_exists) {
            console.log("Done!!!!!!!!!");
            break
        };
        const data_model = {
            "datasetid": datasetid,
            "recordid": recordid,
            "geometry": geometry,
            "record_timestamp": record_timestamp,
            "id_concours": id_concours,
            "date_de_1er_versement_projet": date_de_1er_versement_projet,
            "libelle_indicateur_apd": libelle_indicateur_apd,
            "versements_euro": versements_euro,
            "societe": societe,
            "date_d_octroi": date_d_octroi,
            "description_du_projet": description_du_projet,
            "decaissement_annuel": decaissement_annuel,
            "libelle_cicid": libelle_cicid,
            "libelle_agence": libelle_agence,
            "date_de_la_derniere_publication": date_de_la_derniere_publication,
            "date_de_publication_nco": date_de_publication_nco,
            "pays_de_realisation": pays_de_realisation,
            "libelle_beneficiaire_primaire": libelle_beneficiaire_primaire,
            "division_technique": division_technique,
            "date_de_signature_de_convention": date_de_signature_de_convention,
            "groupe_de_produit": groupe_de_produit,
            "latitude": latitude,
            "publie_dans_le_xml_de_campagne": publie_dans_le_xml_de_campagne,
            "etat_du_projet": etat_du_projet,
            "lien_fiche_projet": lien_fiche_projet,
            "cofinanciers_o_n": cofinanciers_o_n,
            "libelle_risque_souverain": libelle_risque_souverain,
            "valeur_fixe0": valeur_fixe0,
            "valeur_fixe1": valeur_fixe1,
            "valeur_fixe2": valeur_fixe2,
            "engagements_bruts_euro": engagements_bruts_euro,
            "nom_du_projet_pour_les_instances": nom_du_projet_pour_les_instances,
            "valeur_fixe": valeur_fixe,
            "geo": geo,
            "date_mise_a_jour_donnees_projet": date_mise_a_jour_donnees_projet,
            "libelle_secteur_economique_cad_5": libelle_secteur_economique_cad_5,
            "budget": budget,
            "longitude": longitude,
            "id_projet": id_projet,
            "region": region
        };

        let proj = await normProject(data_model)
        proj.save()
        console.log(proj);

    }

    console.log(count);



}

function getIsoCode(c){
    let dict = {'MAROC':'MA'}
    return dict[c]
}
async function normProject(p){
    //get country
    const country_code = getIsoCode(p.pays_de_realisation)
    let country = await Countries.findOne({code:country_code})
    //get funder
    let funder = await getFunder("Agence Française de Développement (AFD)")
    //sector
    let thematique = await getSector(p.libelle_secteur_economique_cad_5)
    const proj = new Project({
        source:"https://opendata.afd.fr",
        proj_org_id:p.id_projet,
        name:p.nom_du_projet_pour_les_instances,
        description:p.description_du_projet,
        country:country._id,
        funder:funder,
        implementer:funder,
        status:"60c7672e97cf97698bbe1755",
        approval_date:p.date_d_octroi,
        actual_start:p.date_d_octroi,
        total_cost:"Euro "+p.engagements_bruts_euro,
        budget:"Euro "+p.budget,
    thematique:thematique,
    project_url:p.lien_fiche_projet,
    raw_data_org:p,
    maj_date:p.date_mise_a_jour_donnees_projet,
    })

    return proj
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

async function containsProject(source, proj_org_id) {
    let proj = await Project.find({ source:source, proj_org_id: proj_org_id })
    return proj.length ? true : false
}
