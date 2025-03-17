require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const postsRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["https://vibesync-m13u90md4-gemmichaels-projects.vercel.app"], 
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS", 
    allowedHeaders: "Content-Type,Authorization", 
    credentials: true, 
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
