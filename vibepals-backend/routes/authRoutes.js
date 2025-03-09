const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const router = express.Router();


router.post("/signup", async (req, res) => {
  console.log("📩 Received signup request:", req.body);
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token, user: { id: newUser._id, name, email } });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(200)
      .json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});


router.get("/random-users", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const users = await User.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $sample: { size: 5 } },
    ]);

    res.json(users.map((user) => ({ _id: user._id, name: user.name })));
  } catch (error) {
    console.error("❌ Error fetching random users:", error);
    res.status(500).json({ error: "Failed to fetch random users" });
  }
});


router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("friends", "_id name email"); 

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});


router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Search query is required" });

    const users = await User.find({ name: new RegExp(query, "i") }).select(
      "_id name"
    );
    res.json(users);
  } catch (error) {
    console.error("❌ Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

router.post("/add-friend/:friendId", auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ error: "User not found" });
    if (user.friends.includes(friendId))
      return res.status(400).json({ error: "Already friends" });

    user.friends.push(friendId);
    friend.friends.push(user._id); 
    await user.save();
    await friend.save(); 

    res.json({ message: "Friend added successfully", friends: user.friends });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ error: "Failed to add friend" });
  }
});

router.post("/unfriend/:friendId", auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ error: "User not found" });

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter(
      (id) => id.toString() !== req.user.id
    );

    await user.save();
    await friend.save();

    res.json({ message: "Unfriended successfully", friends: user.friends });
  } catch (error) {
    console.error("Error unfriending:", error);
    res.status(500).json({ error: "Failed to unfriend" });
  }
});

router.post("/message/:recipientId", auth, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ error: "Message text is required" });

    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(recipientId);
    if (!recipient)
      return res.status(404).json({ error: "Recipient not found" });

    const message = {
      sender: sender._id,
      recipient: recipient._id,
      text,
      timestamp: new Date(),
    };

    sender.messages.push(message);
    recipient.messages.push(message);

    await sender.save();
    await recipient.save();

    res.json({ message: "Message sent successfully", data: message }); 
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});


router.get("/messages/:friendId", auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const messages = user.messages.filter(
      (msg) =>
        msg.sender.toString() === friendId ||
        msg.recipient.toString() === friendId
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.get("/chats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });


    const chatUsers = new Set();
    user.messages.forEach((msg) => {
      chatUsers.add(msg.sender.toString());
      chatUsers.add(msg.recipient.toString());
    });


    chatUsers.delete(req.user.id);

    const users = await User.find({
      _id: { $in: Array.from(chatUsers) },
    }).select("_id name");
    res.json(users);
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ error: "Failed to fetch chat users" });
  }
});

module.exports = router;
