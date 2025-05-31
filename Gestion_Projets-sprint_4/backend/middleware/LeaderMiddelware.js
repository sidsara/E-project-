const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const isLeader = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Récupéré depuis le token
    let equipeId; // ✅ Déclaration manquante corrigée

    // Si equipeId est dans les params
    if (req.params.equipeId) {
      equipeId = parseInt(req.params.equipeId);
    }
    // Si projectId est présent dans les params
    else if (req.params.projectId) {
      const project = await prisma.projet.findUnique({
        where: { id: parseInt(req.params.projectId) },
        select: { equipeId: true },
      });

      if (!project) {
        return res.status(404).json({
          message: "Projet non trouvé",
        });
      }

      equipeId = project.equipeId;
    }
    // Sinon, tente de récupérer via le token
    else if (req.user.equipeId) {
      equipeId = req.user.equipeId;
    }
    // Si aucune source d'équipe
    else {
      return res.status(400).json({
        message: "Référence d'équipe ou de projet manquante",
      });
    }

    // Vérifie si l'utilisateur est bien chef d'équipe
    const student = await prisma.etudiant.findUnique({
      where: { id: userId },
      select: {
        equipeId: true,
        chefEquipe: true,
      },
    });

    if (!student || student.equipeId !== equipeId || !student.chefEquipe) {
      return res.status(403).json({
        message: "Vous n'êtes pas le chef de cette équipe",
      });
    }

    next(); // ✅ Tout est bon, on continue
  } catch (error) {
    console.error("Erreur dans le middleware isLeader :", error);
    return res.status(500).json({
      message: "Erreur serveur interne",
    });
  }
};

module.exports = isLeader;
