const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const  verificationEtudiant = async (req, res, next) => {
    try {
        const etudiantId = req.user.userId;

        // Vérifier si l'étudiant existe et obtenir son niveau et spécialité
        const etudiant = await prisma.etudiant.findUnique({
            where: { id: etudiantId },
            select: {
                niveau: true,
                specialite: true
            }
        });

        if (!etudiant) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }

        // Ajouter les informations de l'étudiant à la requête
        req.etudiant = etudiant;
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification de l'étudiant:", error);
        res.status(500).json({ message: "Erreur lors de la vérification de l'étudiant" });
    }
};

module.exports = verificationEtudiant;