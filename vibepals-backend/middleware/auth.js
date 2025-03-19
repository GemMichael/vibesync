const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; 
  if (!token) return res.status(401).json({ error: "Access denied" });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
  
};

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("🔍 Received Token:", token);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Authenticated User ID:", req.user.id);
    next();
  } catch (error) {
    console.error("❌ Token Verification Failed:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

