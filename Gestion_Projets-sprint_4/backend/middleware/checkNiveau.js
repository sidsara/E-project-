const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkNiveau = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const etudiant = await prisma.etudiant.findUnique({
      where: { id: userId },
    });



    if (!["2", "4", "5"].includes(etudiant.niveau)) {
      return res.status(403).json({ error: "Votre niveau ne vous permet pas d'envoyer une demande." });
    }

    next();
  } catch (error) {
    console.error("Erreur middleware niveau:", error);
    res.status(500).json({ error: "Erreur interne." });
  }
};

module.exports = checkNiveau;
