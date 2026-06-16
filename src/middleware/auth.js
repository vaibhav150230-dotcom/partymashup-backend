const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify any logged-in user
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorised" });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Owner only
const ownerOnly = (req, res, next) => {
  if (req.user?.role !== "owner")
    return res.status(403).json({ message: "Owner access only" });
  next();
};

module.exports = { protect, ownerOnly };
