const Invitation = require("../../models/linkedin/invitation");
const User = require("../../models/user2");

exports.sendInvitation = async (req, res, next) => {
  try {
    const invitation = new Invitation(req.body);
    const newInvitation = await invitation.save();
    return res.status(200).json(newInvitation);
  } catch (error) {
    return res.status(505).json({ error });
  }
};
exports.ignoreInvitation = async (req, res, next) => {
  const { invitationId } = req.params;
  try {
    await Invitation.deleteOne({ _id: invitationId });
    return res.status(200).json({ msg: "invitation deleted successfully" });
  } catch (error) {
    return res.status(505).json({ error });
  }
};
exports.getInvitations = async (req, res, next) => {
  const { receverId } = req.params;
  try {
    const invitations = await Invitation.find({ recever: receverId }).populate(
      "sender"
    );
    return res.status(200).json(invitations);
  } catch (error) {
    return res.status(505).json({ error });
  }
};

exports.getInvitation = async (req, res, next) => {
  const { user1Id, user2Id } = req.params;
  try {
    const invitation = await Invitation.findOne({
      $or: [
        { $and: [{ recever: user1Id }, { sender: user2Id }] },
        { $and: [{ recever: user2Id }, { sender: user1Id }] },
      ],
    });
    // .populate("sender")
    // .populate("recever");
    return res.status(200).json(invitation);
  } catch (error) {
    return res.status(505).json({ error });
  }
};

exports.acceptInvitation = async (req, res, next) => {
  const { idInvitation } = req.params;
  try {
    const invitation = await Invitation.findOne({
      _id: idInvitation,
    });
    if (invitation) {
      await Invitation.deleteOne({ _id: idInvitation });
      await User.updateOne(
        { _id: invitation?.sender },
        { $push: { connections: invitation?.recever } }
      );
      await User.updateOne(
        { _id: invitation?.recever },
        { $push: { connections: invitation?.sender } }
      );
    }
    return res.status(200).json({ msg: "connection added" });
  } catch (error) {
    return res.status(505).json({ error });
  }
};
