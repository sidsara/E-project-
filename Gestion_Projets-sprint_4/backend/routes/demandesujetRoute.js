const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/protect");
const isLeader = require("../middleware/LeaderMiddelware");
const checkNiveau = require("../middleware/checkNiveau");
const demandesController = require("../controllers/demandesujetController");
const isEnseignant = require("../middleware/isEnseignant");
// Routes pour les chefs d'équipe
router.post("/send", authenticateToken, checkNiveau,isLeader,(req, res) => {
  console.log("Request Body:", req.body);  // Log request body
  demandesController.sendDemande(req, res);
});

// Routes pour les enseignants
router.get("/received", authenticateToken, demandesController.getDemandesReceived);
router.post("/accept/:demandeId", authenticateToken, isEnseignant,demandesController.acceptDemande);
router.post("/reject/:demandeId", authenticateToken, isEnseignant, demandesController.rejectDemande);

module.exports = router;
