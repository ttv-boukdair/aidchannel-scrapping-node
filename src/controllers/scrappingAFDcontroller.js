const axios = require("axios");


exports.getAFDProjects = async(req, res) => {
    const url = "https://opendata.afd.fr/api/records/1.0/search/?dataset=donnees-aide-au-developpement-afd&q=&lang=en&rows=2000";
    const projects = await axios.get(url);
    const dataset = projects.data.records;
    var count = dataset.length;
    const raw_data = [];
    for (let i = 0; i < dataset.length; i++) {
        // if (i == 5) break;
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
        raw_data.push(data_model);

    }

    console.log(count);


    try {
        return res.status(200).json(raw_data);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
    }
}