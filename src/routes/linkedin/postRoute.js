const express = require("express");
const router = express.Router();

const postCtrl = require("../../controllers/linkedin/postController");
const uploadMulter = require("../../middlewares/multer");
const requireLogin = require("../../middlewares/requireLogin");

router.post("/", requireLogin, uploadMulter.single("postImage"), postCtrl.add);
router.get("/", requireLogin, postCtrl.getPosts);
router.post("/like/:userId/:postId", requireLogin, postCtrl.like);
router.post("/dislike/:likeId/:postId", requireLogin, postCtrl.dislike);
router.put(
  "/incrementView/:postId/:userId",
  requireLogin,
  postCtrl.incrementView
);
router.get("/getLastPost/:userId", requireLogin, postCtrl.getLastPost);
module.exports = router;
