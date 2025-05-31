const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware pour vérifier si l'étudiant est dans une équipe
const studentInTeam = asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Authentification requise" });
    }

    try {
        const etudiantId = parseInt(req.user.userId);

        if (isNaN(etudiantId)) {
            return res.status(400).json({ message: "ID étudiant invalide" });
        }

        const etudiant = await prisma.etudiant.findUnique({
            where: { id: etudiantId },
            select: {
                id: true,
                equipeId: true,
                equipe: {
                    select: {
                        id: true,
                        niveau: true,
                        specialite: true,
                        status: true
                    }
                }
            }
        });

        if (!etudiant) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }

        if (!etudiant.equipeId) {
            return res.status(403).json({ message: "Vous devez être membre d'une équipe pour accéder aux sujets" });
        }

        // Ajouter les informations de l'équipe à la requête pour une utilisation ultérieure
        req.equipe = etudiant.equipe;
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification de l'équipe:", error);
        res.status(500).json({ message: "Une erreur est survenue lors de la vérification de l'équipe" });
    } finally {
        await prisma.$disconnect();
    }
})

module.exports = { studentInTeam };