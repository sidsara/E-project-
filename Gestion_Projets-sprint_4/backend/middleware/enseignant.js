const enseignantAuth = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "enseignant") {
      return res.status(403).json({
        message: "Access denied. This resource is only for teachers.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error in authorization" });
  }
};

module.exports = enseignantAuth;
