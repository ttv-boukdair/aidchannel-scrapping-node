const express = require("express");
const router = express.Router();

const organizationCtrl = require("../controllers/organizationController");
const uploadMulter = require("../middlewares/multer");

// get implementers of the month
router.get("/ImplementerOfMonth/", organizationCtrl.getImplementerOfMonth);

// get funders of the month
router.get("/funderOfMonth/", organizationCtrl.getFunderOfMonth);

// get subsidiary Organization
router.get("/subsidiaryOrganization", organizationCtrl.subsidiaryOrganization);

// get all organization  with fields ID and Name just to improve performance
router.get(
  "/headOrganizationWithIdAndName",
  organizationCtrl.getAllHeadOrganizationsIdAndName
);
router.get("/donors/:codeCountry", organizationCtrl.getDonors);
router.get("/implementers/:codeCountry", organizationCtrl.getImplementers);
//return the list of test items
router.get("/", organizationCtrl.index);
router.get("/:id", organizationCtrl.getOne);

router.get("/RandomFunderOfMonth", organizationCtrl.getFunderOfMonth);
router.get("/RandomImplementerOfMonth", organizationCtrl.getImplementerOfMonth);

// add organiztion
router.post(
  "/",
  uploadMulter.single("logoOrg"),
  organizationCtrl.addOrganization
);

//delete organization
router.delete("/:id", organizationCtrl.deleteOrganization);

// count organization by country
router.get(
  "/numberByCodeCountry/:codeCountry",
  organizationCtrl.getNumberOrganizationsByCountry
);
// get all organization by country
router.get(
  "/byCodeCountry/:codeCountry",
  organizationCtrl.getAllOrganizationsByCountry
);
router.post(
  "/byCodeCountryPagination/:codeCountry",
  organizationCtrl.getAllOrganizationsByCountryPagination
);
router.post(
  "/getAllOrganizationsByPagination",
  organizationCtrl.getAllOrganizationsByPagination
);
// update org
router.put(
  "/:id",
  uploadMulter.single("logoOrg"),
  organizationCtrl.updateOrganization
);

router.get("/byType/:type", organizationCtrl.getOrganizationByType);

router.put("/enableDonorOfMonth/:donorId", organizationCtrl.enableDonorOfMonth);

router.put(
  "/disabledDonorOfMonth/:donorId",
  organizationCtrl.disabledDonorOfMonth
);

router.put(
  "/enableImplementerOfMonth/:implementerId",
  organizationCtrl.enableImplementerOfMonth
);

router.put(
  "/disabledImplementerOfMonth/:implementerId",
  organizationCtrl.disabledImplementerOfMonth
);

module.exports = router;
