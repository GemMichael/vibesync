const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const User = require("../models/User"); 


router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).select("_id text likes comments user userName");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});



router.post("/", auth, async (req, res) => {
  try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });


      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });


      const newPost = new Post({
          text,
          user: user._id,
          userName: user.name, 
          likes: [],
          comments: [],
      });

      await newPost.save();
      res.status(201).json(newPost);
  } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
  }
});




router.patch("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const userId = req.user.id;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post); 
  } catch (error) {
    res.status(500).json({ error: "Failed to like post" });
  }
});




router.post("/:id/comment", auth, async (req, res) => {
  try {
      const { comment } = req.body;
      if (!comment) return res.status(400).json({ error: "Comment is required" });

      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      post.comments.push({ text: comment, user: user._id, userName: user.name });
      await post.save();

      res.json(post);
  } catch (error) {
      res.status(500).json({ error: "Failed to add comment" });
  }
});


module.exports = router;
