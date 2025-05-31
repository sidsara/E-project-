const express = require('express');
const router = express.Router();

const { ajouterNotes } = require('../controllers/noteSoutenance');
const isPresident = require('../middleware/Isjurypresident');
const authenticateToken = require("../middleware/protect");

router.post("/soutenances/:soutenanceId/notes", authenticateToken, isPresident, ajouterNotes);

module.exports = router;
