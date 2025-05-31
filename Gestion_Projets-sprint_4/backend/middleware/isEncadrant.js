// filepath: c:\Users\WINDOWS\Gestion_Projets\backend\middleware\isEncadrant.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const isEncadrant = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.params;

    console.log("Checking encadrant access:", { userId, projectId });

    // Check if the user is an encadrant for the given project
    const projet = await prisma.projet.findUnique({
      where: { id: parseInt(projectId) },
      select: {
        encadrantId: true,
      },
    });

    if (!projet) {
      return res.status(404).json({
        message: "Projet non trouvé",
      });
    }

    if (projet.encadrantId !== userId) {
      return res.status(403).json({
        message: "Vous n'êtes pas l'encadrant de ce projet",
      });
    }

    next();
  } catch (error) {
    console.error("Error in isEncadrant middleware:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = isEncadrant;
