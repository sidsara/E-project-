const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/protect");
const { isAdmin } = require("../middleware/adminMiddleware");
const enseignantAuth = require("../middleware/enseignant");
const {
  createSoutenance,
  mesSoutenances,
  getSoutenanceEquipe,
  getLivrablesEquipe,
  genererPvDeliberation,
  afficherPvEquipe,
  telechargerPvPdf
} = require("../controllers/soutenanceController");
const { isStudent } = require("../middleware/studentMiddleware");

router.post("/createSoutenance", authenticateToken, isAdmin, createSoutenance);
router.get(
  "/mesSoutenances",
  authenticateToken,
  enseignantAuth,
  mesSoutenances
);
router.get(
  "/getSoutenanceEquipe",
  authenticateToken,
  isStudent,
  getSoutenanceEquipe
);

// Route pour afficher les livrables d'une équipe pour les enseignants du jury
router.get(
  "/livrables/:equipeId",
  authenticateToken,
  enseignantAuth,
  getLivrablesEquipe
);

// Route pour générer un PV de délibération
router.post(
  "/pv/:soutenanceId",
  authenticateToken,
  enseignantAuth,
  genererPvDeliberation
);

// Route pour télécharger le PV en PDF
router.get(
  "/pv/telecharger/:fileName",
  authenticateToken,
  telechargerPvPdf
);
router.get(
  "/afficher-pv",
  authenticateToken,
  isStudent,
  afficherPvEquipe
);
module.exports = router;
