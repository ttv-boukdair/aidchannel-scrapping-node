const express = require("express");
const router = express.Router();
const uploadMulter = require("../middlewares/multer");
const userCtrl = require("../controllers/user2Controller");
const { userSignupValidator } = require("../middlewares/userValidator");
const requireLogin = require("../middlewares/requireLogin");
//const {requireSignIn,isAuth,isSuperAdmin,isWebMaster}=require('../middlewares/auth');

////////////////////LINKEDIN /////////////////////
router.get(
  "/linkedinUsersRecommandation",
  requireLogin,
  userCtrl.getLinkedinUsersRecommandation
);
router.get("/oneUser/:userId", requireLogin, userCtrl.getOneUser);

//////////// AIDCHANNEL /////////////////////
router.post(
  "/register",
  uploadMulter.single("image_url"),
  userSignupValidator,
  userCtrl.register
);
router.post("/login", userCtrl.login);
router.get("/logout", userCtrl.logout);
router.post("/add", uploadMulter.single("image_url"), userCtrl.addUser);
router.put(
  "/disabledExpertOfMonth/:expertId",

  userCtrl.disabledExpertOfMonth
);
router.post(
  "/addWebmaster",
  uploadMulter.single("image_url"),
  userCtrl.addWebmaster
);
router.get("/getAllUsers", userCtrl.getAllUsers);
router.get("/getAddedUsersByWebmaster", userCtrl.getAddedUsersByWebmaster);
router.get("/numberExpertsbyCodeCountry", userCtrl.getNumberExpertsByCountry);
router.put(
  "/enableExpertOfMonth/:expertId",

  userCtrl.enableExpertOfMonth
);
router.post(
  "/getAddedUsersByWebmasterPagination",

  userCtrl.getAddedUsersByWebmasterPagination
);
router.post(
  "/getwebmastersbypagination",

  userCtrl.getAllWebMastersPagination
);
router.get(
  "/Experts",

  userCtrl.getAllExpertsByCountry
);

router.post(
  "/expertsByCodeCountryPagination",

  userCtrl.getAllExpertsByCountryPagination
);

router.put("/:id", uploadMulter.single("image_url"), userCtrl.updateExpert);
router.post("/", uploadMulter.single("image_url"), userCtrl.addExpert);
router.delete("/:id", userCtrl.deleteExpert);
router.get("/expertDetailData/:expert_id", userCtrl.expertDetailData);
//return the list of test items
router.get("/", userCtrl.index);
//insert new test item
router.post("/", userCtrl.add);
router.get(
  "/headExpertWithIdAndName",

  userCtrl.getAllHeadExpertsIdAndName
);

router.post("/expertOfMonth", userCtrl.getExpertsOfMonth);

router.get("/allCop", userCtrl.getCop);

//webmaster

router.get("/getAllwebmasters", userCtrl.getAllwebmasters);
router.get("/:id", userCtrl.getOneWebmaster);
router.put(
  "/webmaster/:id",
  uploadMulter.single("image_url"),
  userCtrl.updateWebmaster
);

router.delete("/:id", userCtrl.deleteWebmaster);

router.get("/expertDetails/:expert_id", userCtrl.getExpertDetails);

router.delete("/:id", userCtrl.deleteUser);

module.exports = router;
