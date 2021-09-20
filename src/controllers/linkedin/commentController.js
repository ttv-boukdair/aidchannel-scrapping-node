const Comment = require("../../models/linkedin/comment");
const Post = require("../../models/linkedin/post");

exports.addComment = async (req, res, next) => {
  const comment = req.body;
  try {
    const CommentObj = new Comment(comment);
    const newComment = await CommentObj.save();

    await Post.updateOne(
      { _id: comment.post },
      { $push: { comments: newComment._id } }
    );

    Comment.populate(
      newComment,
      {
        path: "user",
        select:
          "expert_of_month cop role _id fullname email adress phone job_title image_url",
      },
      function (err, comment) {
        return res.status(200).json(comment);
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.getComments = async (req, res, next) => {
  const { idPost } = req.params;
  const { limit = 9, page = 1 } = req.query;
  try {
    const comments = await Comment.find({ post: idPost })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("user")
      .sort({ _id: -1 });
    res.status(200).json({
      data: comments,
      page: page,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getNumberComments = async (req, res, next) => {
  const { idPost } = req.params;

  try {
    const post = await Post.findOne({ _id: idPost });

    res.status(200).json(post?.comments?.length);
  } catch (error) {
    console.log(error);
  }
};
