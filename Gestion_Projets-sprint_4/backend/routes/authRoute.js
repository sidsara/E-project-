const {
  listeEtudiants,
  listeEnseignants,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  createEntreprise,
  getStudentCount,
  getTeacherCount,
  getCompanyCount,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/protect");
const { isAdmin } = require("../middleware/adminMiddleware");
const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/liste-etudiants",
  authenticateToken,
  isAdmin,
  upload.single("file"),
  listeEtudiants
);
router.post(
  "/liste-enseignants",
  authenticateToken,
  isAdmin,
  upload.single("file"),
  listeEnseignants
);

router.post("/login", login);
router.get("/logout", logout);
router.put("/change-password", authenticateToken, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/creer-entreprise", authenticateToken, isAdmin, createEntreprise);
router.get("/count-students", authenticateToken, isAdmin, getStudentCount);
router.get("/count-teachers", authenticateToken, isAdmin, getTeacherCount);
router.get("/count-companies", authenticateToken, isAdmin, getCompanyCount);
module.exports = router;
