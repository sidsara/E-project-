// backend/routes/equipeRoute.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/protect");
const {
  createEquipe,
  updateEquipe,
  minMaxMembers,
  leaveTeam,
  getTeams,
  getTeamsForAdmin,
  transferLeadership,
  deleteEquipe,
  createTeamByAdmin,
  affectStudentToTeam,
  getStudentsWithoutTeam,
  getEquipeById,
} = require("../controllers/equipeController");
const { isStudent } = require("../middleware/studentMiddleware");
const isLeader = require("../middleware/LeaderMiddelware");
const { isAdmin } = require("../middleware/adminMiddleware");

router.post("/createEquipe", authenticateToken, isStudent, createEquipe);
router.put(
  "/updateEquipe/:equipeId",
  authenticateToken,
  isLeader,
  updateEquipe
);

router.post("/leave", authenticateToken, leaveTeam);

router.get("/teams", authenticateToken, getTeams);
router.get("/equipes/:equipeId", authenticateToken, getEquipeById);

router.get("/admin/teams", authenticateToken, isAdmin, getTeamsForAdmin);

//router.get("/teams", authenticateToken, getTeams);
router.get("/admin/teams", authenticateToken, isAdmin, getTeamsForAdmin);
router.put("/transferLeadership", authenticateToken, transferLeadership);
router.put("/minMaxMembers", authenticateToken, isAdmin, minMaxMembers);

router.delete("/delete/:equipeId", authenticateToken, isLeader, deleteEquipe);

router.get(
  "/admin/students-without-team",
  authenticateToken,
  isAdmin,
  getStudentsWithoutTeam
);

router.post(
  "/admin/affect-student",
  authenticateToken,
  isAdmin,
  affectStudentToTeam
);

router.post(
  "/admin/create-team",
  authenticateToken,
  isAdmin,
  createTeamByAdmin
);

module.exports = router;
