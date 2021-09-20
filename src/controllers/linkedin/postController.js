const Like = require("../../models/linkedin/like");
const Post = require("../../models/linkedin/post");

exports.add = async (req, res, next) => {
  if (req.file != undefined) req.body.image = req.file.path;
  const post = req.body;
  try {
    const newPost = new Post(post);
    const user = await newPost.save();
    Post.populate(
      user,
      {
        path: "user",
        select:
          "expert_of_month cop role _id fullname email adress phone job_title image_url",
      },
      function (err, user) {
        return res.status(200).json(user);
      }
    );
  } catch (error) {
    return res.status(505).json({ error });
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .sort({ _id: -1 })
      .populate(
        "user",
        "expert_of_month cop role _id fullname email adress phone job_title image_url"
      )
      .populate("likes");
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(505).json({ error });
  }
};

exports.like = async (req, res, next) => {
  const { postId, userId } = req.params;

  try {
    const likeObj = new Like({ type: "like", userId: userId });
    const newLike = await likeObj.save();
    await Post.updateOne({ _id: postId }, { $push: { likes: newLike._id } });
    return res.status(200).json(newLike);
  } catch (error) {
    console.log(error);
  }
};
exports.dislike = async (req, res, next) => {
  const { postId, likeId } = req.params;

  try {
    await Like.deleteOne({ _id: likeId });
    const response = await Post.updateOne(
      { _id: postId },
      { $pull: { likes: likeId } }
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
};

exports.incrementView = async (req, res, next) => {
  const { postId, userId } = req.params;

  try {
    const updatedPost = await Post.updateOne(
      { _id: postId },
      { $addToSet: { views: userId } }
    );
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.log(error);
  }
};

exports.getLastPost = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const lastPost = await Post.findOne({ user: userId }).sort({ _id: -1 });
    return res.status(200).json(lastPost);
  } catch (error) {
    console.log(error);
  }
};
