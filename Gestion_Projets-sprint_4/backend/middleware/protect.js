const jwt = require("jsonwebtoken");
require("dotenv").config();
const { JWT_SECRET } = process.env;
const cookieParser = require("cookie-parser");

const parseCookies = cookieParser();

const authenticateToken = (req, res, next) => {
  parseCookies(req, res, () => {
    try {
      // Check for token in Authorization header or cookies
      const token = req.headers.authorization?.split(' ')[1] || req.cookies.jwt;
      console.log('Token from header or cookies:', token); // Log the token

      if (!token) {
        console.error('No token found in header or cookies');
        return res.status(401).json({ message: "VOUS DEVEZ VOUS CONNECTER" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded token:', decoded); // Log the decoded token

      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        equipeId: decoded.equipeId,
      };
      next();
    } catch (err) {
      console.error("Erreur lors de la vérification du token:", err); // Log the error

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "TOKEN EXPIRÉ. VEUILLEZ VOUS RECONNECTER.",
          expiredAt: err.expiredAt,
        });
      }

      res.status(401).json({ message: "TOKEN INVALIDE" });
    }
  });
};

module.exports = authenticateToken;
