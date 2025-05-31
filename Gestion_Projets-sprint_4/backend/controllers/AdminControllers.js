const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const sendEmail = require("../outilles/email");
//linked
const getSujets = asyncHandler(async (req, res) => {
  const sujets = await prisma.Sujet.findMany();
  res.json(sujets);
});

const affecterSujetsAleatoirement = asyncHandler(async (req, res) => {
  try {
    // Récupérer tous les sujets acceptés de niveau 3
    const sujetsAcceptes = await prisma.Sujet.findMany({
      where: {
        status: "accepted",
        niveau: 3,
      },
      include: { Enseignant: true },
    });

    // Récupérer toutes les équipes de niveau 3 sans projet affecté
    const equipesNiveau3 = await prisma.Equipe.findMany({
      where: {
        niveau: "3",
        projet: null,
      },
      include: {
        projet: true,
      },
    });

    if (sujetsAcceptes.length === 0) {
      return res
        .status(400)
        .json({ message: "Aucun sujet accepté disponible" });
    }

    if (equipesNiveau3.length === 0) {
      return res
        .status(400)
        .json({ message: "Aucune équipe de niveau 3 sans sujet" });
    }

    // Calculer le nombre d'équipes par sujet
    const equipesParSujet = Math.ceil(
      equipesNiveau3.length / sujetsAcceptes.length
    );

    // Mélanger les équipes aléatoirement
    const equipesShuffled = equipesNiveau3.sort(() => Math.random() - 0.5);

    // Affecter les sujets aux équipes
    const affectations = [];
    let equipeIndex = 0;

    for (const sujet of sujetsAcceptes) {
      const equipesForSujet = equipesShuffled.slice(
        equipeIndex,
        equipeIndex + equipesParSujet
      );

      for (const equipe of equipesForSujet) {
        if (equipeIndex < equipesNiveau3.length) {
          // Créer un nouveau projet pour l'équipe
          const dateDebut = new Date();
          const dateFin = new Date();
          dateFin.setMonth(dateFin.getMonth() + 6); // Projet de 6 mois par défaut

          await prisma.Projet.create({
            data: {
              equipeId: equipe.id,
              sujetId: sujet.id,
              encadrantId: sujet.enseignantId,
              dateDebut,
              dateFin,
            },
          });

          affectations.push({
            equipeId: equipe.id,
            sujetId: sujet.id,
            encadrantId: sujet.enseignantId,
          });
        }
      }
      equipeIndex += equipesParSujet;
    }

    res.status(200).json({
      message: "Affectation des sujets réussie",
      affectations,
    });
  } catch (error) {
    console.error("Erreur lors de l'affectation des sujets:", error);
    await prisma.$disconnect();

    if (error.errorCode === "P1001" || error.errorCode === "P1002") {
      res.status(503).json({
        message:
          "Service temporairement indisponible. Veuillez réessayer plus tard.",
        error: "Database connection failed",
      });
    } else {
      res.status(500).json({
        message: "Erreur lors de l'affectation des sujets",
        error: error.message,
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});

/// DONE
const validateSujet = asyncHandler(async (req, res) => {
  const { action, id } = req.params;
  const { reason } = req.body;

  if (!["validate", "reject"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const status = action === "validate" ? "accepted" : "rejected";

  try {
    // Update the subject status and include the owner (Enseignant or Entreprise)
    const sujet = await prisma.Sujet.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { Enseignant: true, Entreprise: true },
    });

    // Determine the recipient email (either Enseignant or Entreprise)
    let email = sujet.enseignantId
      ? sujet.Enseignant?.email
      : sujet.Entreprise?.email;

    if (!email) {
      return res.status(404).json({ error: "Subject owner not found" });
    }
    await sendEmail({
      email,
      subject: `Subject ${status}`,
      message: `Your subject "${sujet.titre}" has been ${status}.${
        reason ? " Reason: " + reason : ""
      }`,
    });

    res.json({ message: `Subject ${status} successfully`, sujet }); // ✅ FIXED
  } catch (error) {
    console.error("Error validating subject:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
/// DONE
const getAcceptedSujets = asyncHandler(async (req, res) => {
  const sujets = await prisma.Sujet.findMany({ where: { status: "accepted" } });
  res.json(sujets);
});


/// DONE
const assignEnseignantToEntrepriseSujet = async (req, res) => {
  try {
    const { enseignantId, sujetId } = req.body;

    const sujet = await prisma.sujet.findUnique({
      where: { id: sujetId },
      include: { Entreprise: true },
    });

    if (!sujet) {
      return res.status(404).json({ message: "Sujet non trouvé" });
    }

    if (!sujet.entrepriseId || !sujet.Entreprise) {
      return res
        .status(400)
        .json({ message: "Le sujet n'appartient pas à une entreprise" });
    }

    if (sujet.status.toLowerCase() !== "accepted") {
      return res.status(400).json({ message: "Le sujet n'est pas accepté" });
    }

    const enseignant = await prisma.enseignant.findUnique({
      where: { id: enseignantId },
    });

    if (!enseignant) {
      return res.status(404).json({ message: "Enseignant non trouvé" });
    }

    await prisma.sujet.update({
      where: { id: sujetId },
      data: {
        enseignantId: enseignant.id,
      },
    });

    res.status(200).json({
      message: "Enseignant assigné avec succès au sujet de l'entreprise",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'assignation", error: error.message });
  }
};

module.exports = {
  getSujets,
  validateSujet,
  getAcceptedSujets,
  affecterSujetsAleatoirement,
  assignEnseignantToEntrepriseSujet,
};
