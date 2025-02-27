const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

const router = express.Router();

// ✅ Signup Route (Register a new user)
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

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ token, user: { id: newUser._id, name, email } });
    } catch (error) {
        console.error("❌ Signup error:", error);
        res.status(500).json({ error: "Signup failed" });
    }
});

// ✅ Login Route (Authenticate user)
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});


// ✅ Get 5 random users (excluding the logged-in user)
router.get("/random-users", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const users = await User.aggregate([
            { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } }, 
            { $sample: { size: 5 } } 
        ]);

        res.json(users.map(user => ({ _id: user._id, name: user.name })));
    } catch (error) {
        console.error("❌ Error fetching random users:", error);
        res.status(500).json({ error: "Failed to fetch random users" });
    }
});

// ✅ Get user details by ID (for profile page)
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password"); 
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});

// ✅ Search users by name
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: "Search query is required" });

        const users = await User.find({ name: new RegExp(query, "i") }).select("_id name"); 
        res.json(users);
    } catch (error) {
        console.error("❌ Error searching users:", error);
        res.status(500).json({ error: "Failed to search users" });
    }
});

module.exports = router;
