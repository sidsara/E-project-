const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async function isPresident(req, res, next) {
  const enseignantId = req.user?.userId;
  const soutenanceIdParam = req.params?.soutenanceId;

  if (!soutenanceIdParam) {
    return res.status(400).json({ message: "soutenanceId manquant dans l'URL." });
  }

  const soutenanceId = parseInt(soutenanceIdParam);
  if (isNaN(soutenanceId)) {
    return res.status(400).json({ message: "soutenanceId invalide." });
  }

  try {
    const isPresident = await prisma.membreJury.findFirst({
      where: {
        enseignantId: enseignantId,
        estPresident: true,
        soutenanceId: soutenanceId,
      },
    });

    if (!isPresident) {
      return res.status(403).json({
        message: "Vous n'êtes pas président du jury de cette soutenance.",
      });
    }

    next();
  } catch (error) {
    console.error("Erreur dans isPresident:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
