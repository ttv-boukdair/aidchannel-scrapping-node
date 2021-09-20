const express = require("express");
const router = express.Router();

const projectpreprodCtrl = require("../controllers/projectController");
const uploadMulter = require("../middlewares/multer");
router.get(
  "/projectsOfMonthByThematic/:id/:codeCountry",
  projectpreprodCtrl.getAllProjectsOfMonthByThematic
);
router.get("/numberProjects", projectpreprodCtrl.getNumberAllProjects);
router.get(
  "/projectsOfMonthByDonors/:idOrg/:codeCountry",
  projectpreprodCtrl.getAllProjectsOfMonthByDonors
);
router.get(
  "/projectsOfMonthByImplementers/:idOrg/:codeCountry",
  projectpreprodCtrl.getAllProjectsOfMonthByImplementers
);

// get all projects accepted
router.post(
  "/projectsAccepted/:codeCountry",
  projectpreprodCtrl.getAllProjectsAccepted
);
// accept project web master
router.put("/acceptProject/:projectId", projectpreprodCtrl.acceptProject);

//refuse project web master
router.put("/refuseProject/:projectId", projectpreprodCtrl.refuseProject);
router.get(
  "/getAllProjectsByCountryNull",
  projectpreprodCtrl.getAllProjectsByCountryNull
);

router.get(
  "/byCodeCountry/:codeCountry",
  projectpreprodCtrl.getAllProjectsByCountry
);

router.post(
  "/byCodeCountryPagination/:codeCountry",
  projectpreprodCtrl.getAllProjectsByPaginationAndCountry
);
router.post(
  "/AddedByExpertPagination",
  projectpreprodCtrl.getAllProjectsAddedByExpertByPagination
);
router.get(
  "/projectsOfMonthByCodeCountry/:codeCountry",
  projectpreprodCtrl.getAllProjectsOfMonthByCountry
);

router.get(
  "/oneProjectOfMonthByCodeCountry/:codeCountry",
  projectpreprodCtrl.getOneProjectsOfMonthByCountry
);
// get global projects by keyword
router.get(
  "/globalProjectsByKeyWord",
  projectpreprodCtrl.globalProjectsByKeyWord
);

router.get("/projectsByStatus", projectpreprodCtrl.projectsByStatus);

router.get("/byFunder/:id", projectpreprodCtrl.projectsByFunder);
router.get("/byThematic/:id", projectpreprodCtrl.projectsByThematicc);
//insert new test item
router.post(
  "/",
  uploadMulter.single("projectImage"),
  projectpreprodCtrl.addProject
);
router.post(
  "/ByExpert",
  uploadMulter.single("projectImage"),
  projectpreprodCtrl.addProjectByExpert
);

router.post("/projectOfMonth", projectpreprodCtrl.getAFDBProjectsOfMonth);

//return the list of test items
router.get("/:code?", projectpreprodCtrl.index);

router.post("/list", projectpreprodCtrl.indexPost);

router.get(
  "/projectDetailData/:project_id",
  projectpreprodCtrl.projectDetailData
);

router.get(
  "/numberProjectsbyCodeCountry/:codeCountry",
  projectpreprodCtrl.getNumberProjectsByCountry
);

router.get(
  "/numberProjectsbyCodeCountryNull/:codeCountry",
  projectpreprodCtrl.getNumberProjectsByCountryNULL
);
//add project by webMaster
router.post(
  "/",
  uploadMulter.single("projectImage"),
  projectpreprodCtrl.addProject
);
// delete project by webMaster
router.delete("/:id", projectpreprodCtrl.deleteProject);
// router.get("/project_by_id/:id", projectpreprodCtrl.project_by_id);

// get projects by key word and code country
router.post("/searchByKeyword", projectpreprodCtrl.searchByKeyword);

// router.get("/project_by_id_v2", projectpreprodCtrl.project_by_id_v2);

router.put(
  "/enabelProjectOfMonth/:projectId/:codeCountry",
  projectpreprodCtrl.enablePojectOfMonth
);

router.put(
  "/disabledProjectOfMonth/:projectId",
  projectpreprodCtrl.disabledPojectOfMonth
);

router.put(
  "/:projectId",
  uploadMulter.single("projectImage"),
  projectpreprodCtrl.updateProject
);

module.exports = router;
