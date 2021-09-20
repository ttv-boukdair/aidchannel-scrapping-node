const express = require("express");
const router = express.Router();

const invitationCtrl = require("../../controllers/linkedin/invitationController");
const requireLogin = require("../../middlewares/requireLogin");

router.post("/", requireLogin, invitationCtrl.sendInvitation);
router.get("/:receverId", requireLogin, invitationCtrl.getInvitations);
router.delete("/:invitationId", requireLogin, invitationCtrl.ignoreInvitation);
router.get(
  "/getInvitation/:user1Id/:user2Id",
  requireLogin,
  invitationCtrl.getInvitation
);
router.put(
  "/acceptInvitation/:idInvitation",
  requireLogin,
  invitationCtrl.acceptInvitation
);

module.exports = router;
