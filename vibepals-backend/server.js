require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const postsRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 VibeSync Backend is Running!");
});


app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://vibesync-gemmichaels-projects.vercel.app",
        "https://vibesync-mr3fx7c11-gemmichaels-projects.vercel.app",
        "http://localhost:3000", 
      ];

      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {

        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"), false);
      }
    },
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);


app.options("*", cors());


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
