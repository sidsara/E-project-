const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Middleware: Ensure the user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user?.role || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Forbidden: Admin privileges required" });
  }
  next();
};

module.exports = { isAdmin };
