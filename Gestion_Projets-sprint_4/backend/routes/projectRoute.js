const express = require("express");
const router = express.Router();

// Middlewares
const authenticateToken = require("../middleware/protect");
const isLeader = require("../middleware/LeaderMiddelware");
const isEncadrant = require("../middleware/isEncadrant");
const upload = require("../outilles/multerLivrable");
const verificationEtudiant = require("../middleware/verifyEtudiantMiddleware");
// Contrôleurs
const {
  getMyProjects,
  createAppointment,
  updateAppointmentStatus,
  updateTaskStatus,
  addRemark,
  getAllRemarks,
  deposerLivrable,
  getLivrables,
  createTache,
  getTaches,
  deleteTache,
  getRendezVous,
  updateLivrableStatus,
  getProjetEtudiant,
} = require("../controllers/projectController");

router.put(
  "/updateTaskStatus/:projectId/:tasktId/",
  authenticateToken,
  isLeader,
  updateTaskStatus
);
// Routes pour les projets
router.get("/myProjects", authenticateToken, getMyProjects);

// Routes pour les rendez-vous
router.post(
  "/createAppointment/:projectId",
  authenticateToken,
  isEncadrant,
  createAppointment
);

router.put(
  "/updateAppointmentStatus/:projectId/:appointmentId",
  authenticateToken,
  isEncadrant,
  updateAppointmentStatus
);

// Routes pour les tâches
router.post(
  "/createTask/:projectId",
  authenticateToken,
  isEncadrant,
  createTache
);

router.get("/getTasks/:projectId", authenticateToken, getTaches);

router.delete("/deleteTask/:taskId", authenticateToken, deleteTache);
router.get("/appointments/:projectId", authenticateToken, getRendezVous);

// Routes pour les remarques
router.post("/addRemark/:projectId", authenticateToken, isEncadrant, addRemark);

router.get("/getAllRemarks/:projectId", authenticateToken, getAllRemarks);

// Routes pour les livrables
router.post(
  "/deposerLivrable/:projectId",
  authenticateToken,
  isLeader,
  upload.single("fichier"),
  deposerLivrable
);

router.get("/getLivrables/:projectId", authenticateToken, getLivrables);

router.put("/livrables/:livrableId", authenticateToken, updateLivrableStatus);

// Routes pour les projets étudiants
router.get(
  "/projectStudent",
  authenticateToken,
  verificationEtudiant,
  getProjetEtudiant
);

module.exports = router;
