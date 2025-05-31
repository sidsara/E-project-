const express = require('express');
const router = express.Router();
const { getSujetsDisponibles } = require('../controllers/sujetAffectationController');
const authenticateToken = require('../middleware/protect');
const { isStudent } = require('../middleware/studentMiddleware');
const  verificationEtudiant  = require('../middleware/verifyEtudiantMiddleware');

// Route pour obtenir les sujets disponibles avec filtrage par niveau et recherche
router.get('/sujets-disponibles', 
    authenticateToken, 
    isStudent,
    verificationEtudiant,
    getSujetsDisponibles
);

module.exports = router;