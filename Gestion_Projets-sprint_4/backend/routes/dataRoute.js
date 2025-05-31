const {
  afficherEtudiants,
  afficherEnseignants,
  afficherEntreprises,
  afficherUtilisateurs,
  supprimerUtilisateur,
  getCounts
} = require("../controllers/dataController");
const authenticateToken = require("../middleware/protect");
const { isAdmin } = require("../middleware/adminMiddleware");
const router = require("express").Router();

router.get("/etudiants", authenticateToken, isAdmin, afficherEtudiants);
router.get("/enseignants", authenticateToken, isAdmin, afficherEnseignants);
router.get("/entreprises", authenticateToken, afficherEntreprises);
router.get("/utilisateurs", authenticateToken, isAdmin, afficherUtilisateurs);
router.delete(
  "/delete-user/:id",
  authenticateToken,
  isAdmin,
  supprimerUtilisateur
);
module.exports = router;
