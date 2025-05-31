const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Middleware: Ensure the user is a student
const isStudent = (req, res, next) => {
  if (!req.user?.role || req.user.role !== "etudiant") {
    return res.status(403).json({ error: "only student can create a team" });
  }
  next();
};

module.exports = { isStudent };
