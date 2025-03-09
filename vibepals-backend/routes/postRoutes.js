const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const User = require("../models/User");


router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .select("_id text likes comments user userName")
      .populate("user", "name");


    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      comments: post.comments.slice(0, 3),
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});


router.post("/", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text.trim())
      return res.status(400).json({ error: "Text is required" });

    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const newPost = await Post.create({
      text,
      user: user._id,
      userName: user.name,
      likes: [],
      comments: [],
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});


router.patch("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const userId = req.user.id;

    if (post.user.toString() === userId) {
      return res.status(400).json({ error: "You cannot like your own post" });
    }

    const hasLiked = post.likes.includes(userId);
    post.likes = hasLiked
      ? post.likes.filter((id) => id.toString() !== userId)
      : [...post.likes, userId];

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("❌ Error liking post:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
});


router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment.trim())
      return res.status(400).json({ error: "Comment cannot be empty" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    post.comments.push({
      text: comment.trim(),
      user: user._id,
      userName: user.name,
    });
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});


router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!post) {
      return res
        .status(404)
        .json({ error: "Post not found or unauthorized to delete" });
    }

    res.json({ message: "✅ Post deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});


router.delete("/:postId/comments/:commentId", auth, async (req, res) => {
  try {
    console.log(
      `🗑️ Deleting comment: Post ID: ${req.params.postId}, Comment ID: ${req.params.commentId}`
    );

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const commentIndex = post.comments.findIndex(
      (c) => c._id.toString() === req.params.commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ error: "Comment not found" });

    if (post.comments[commentIndex].user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this comment" });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    console.log("✅ Comment deleted successfully");
    res.json({ message: "✅ Comment deleted successfully", updatedPost: post });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});


router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching user posts:", error);
    res.status(500).json({ error: "Failed to fetch user's posts" });
  }
});

module.exports = router;
