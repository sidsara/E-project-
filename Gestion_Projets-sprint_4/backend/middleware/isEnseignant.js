const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const isEnseignant = async (req, res, next) => {
  try {
    // Récupérer l'ID du sujet depuis les paramètres de la route
    const { demandeId } = req.params;

    // Trouver la demande dans la base de données
    const demande = await prisma.demandeSujet.findUnique({
      where: { id: parseInt(demandeId) },
      include: {
        Sujet: true, // On inclut les données du sujet pour vérifier le propriétaire
      },
    });

    if (!demande) {
      return res.status(404).json({ error: "Demande non trouvée." });
    }

    // Vérifier si l'enseignant authentifié est le propriétaire du sujet
    const enseignantId = req.user.userId; // On suppose que l'ID de l'utilisateur est stocké dans `req.user` après authentification (avec `authenticateToken`)

    if (demande.Sujet.enseignantId !== enseignantId) {
      return res.status(403).json({ error: "Vous n'êtes pas le propriétaire de ce sujet." });
    }

    // Si tout est bon, on passe à la prochaine étape
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne." });
  }
};

module.exports = isEnseignant;
