const express = require("express");
const router = express.Router();
const sujetController = require("../controllers/sujetController");
const authenticateToken = require("../middleware/protect");
const multer = require("multer");
// Configuration de Multer (utiliser pour le path t3 doc li yzidha emseigmat ki ydeposer un sujet)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nom du fichier
  },
});
const upload = multer({ storage });

router.post(
  "/deposerSujet",
  upload.single("document"),
  authenticateToken,
  sujetController.deposerSujet
);
router.delete(
  "/delete-sujet/:id",
  authenticateToken,
  sujetController.deleteSujet
);
router.put("/update-sujet/:id",authenticateToken, sujetController.updateSujet);
router.put(
  "/update-sujet-entreprise/:id",
  authenticateToken,
  sujetController.updateSujetEntreprise
);
router.get("/sujets-by-user",
   authenticateToken,
   sujetController.getMySujets
  );

router.get("/sujets", sujetController.getSujets);
router.get("/sujet/:id", sujetController.getSujetById);
module.exports = router;
