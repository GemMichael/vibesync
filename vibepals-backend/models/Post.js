const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
