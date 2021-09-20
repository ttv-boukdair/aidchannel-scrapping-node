const express = require("express");
const router = express.Router();

const commentCtrl = require("../../controllers/linkedin/commentController");
const requireLogin = require("../../middlewares/requireLogin");

router.post("/", requireLogin, commentCtrl.addComment);
router.get("/:idPost", requireLogin, commentCtrl.getComments);
router.get("/numberComment/:idPost", requireLogin, commentCtrl.getNumberComments);

module.exports = router;
