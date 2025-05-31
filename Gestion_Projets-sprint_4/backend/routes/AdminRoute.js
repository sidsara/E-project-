const express = require('express');
const { getSujets, validateSujet, getAcceptedSujets, affecterSujetsAleatoirement } = require('../controllers/AdminControllers');
const {  isAdmin } = require('../middleware/adminMiddleware');
const authenticateToken = require("../middleware/protect");
const assignEnseignant = require('../controllers/AdminControllers')
const router = express.Router();

// Route to fetch all sujets
router.get('/e', authenticateToken, isAdmin, getSujets);

// Route to validate or reject a sujet
router.patch('/:id/:action', authenticateToken, isAdmin, validateSujet);

// Route to fetch all accepted sujets
router.get('/accepted', authenticateToken, isAdmin, getAcceptedSujets);

// Route pour l'affectation aléatoire des sujets aux équipes
router.post('/affecter-sujets', authenticateToken, isAdmin, affecterSujetsAleatoirement);
router.post('/assign',authenticateToken,isAdmin, assignEnseignant.assignEnseignantToEntrepriseSujet);
module.exports = router;