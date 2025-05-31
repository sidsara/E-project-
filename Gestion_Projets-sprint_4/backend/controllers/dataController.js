const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();



//supprimmer un utilisateur
exports.supprimerUtilisateur = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  try {
    try {
      const entreprise = await prisma.entreprise.delete({
        where: { id: parsedId },
      });
      return res
        .status(200)
        .json({ message: "Entreprise supprimée avec succès" });
    } catch (err) {
      try {
        const enseignant = await prisma.enseignant.delete({
          where: { id: parsedId },
        });
        return res
          .status(200)
          .json({ message: "Enseignant supprimé avec succès" });
      } catch (err) {
        try {
          const etudiant = await prisma.etudiant.delete({
            where: { id: parsedId },
          });
          return res
            .status(200)
            .json({ message: "Etudiant supprimé avec succès" });
        } catch (err) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
      }
    }
  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur", err);
    res.status(500).json({ error: err.message });
  }
};

/*________________________________________DONE______________________________________________________*/

//LES AFFICHAGES SONT POUR LES FILTRES + D'AUTRES UTILISATIONS FUTURES

//affichage liste des etudiants                :DONE
exports.afficherEtudiants = async (req, res) => {
  try {
    const etudiants = await prisma.etudiant.findMany({
      select: {
        nom: true,
        prenom: true,
        email: true,
      },
    });

    const etudiantsAvecRole = etudiants.map((etudiant) => ({
      ...etudiant,
      role: "etudiant",
    }));

    res.status(200).json({
      students: etudiantsAvecRole,
      count: etudiants.length  // Simple count from the array length
    });
  } catch (err) {
    console.error("Erreur lors de l'affichage des etudiants", err);
    res.status(500).json({ error: err.message });
  }
};

//affichage liste des enseignants              :DONE
exports.afficherEnseignants = async (req, res) => {
  try {
    const enseignants = await prisma.enseignant.findMany({
      select: {
        nom: true,
        prenom: true,
        email: true,
      },
    });

    const enseignantsAvecRole = enseignants.map((enseignant) => ({
      ...enseignant,
      role: "enseignant",
    }));

    res.status(200).json({
      teachers: enseignantsAvecRole,
      count: enseignants.length
    });
  } catch (err) {
    console.error("Erreur lors de l'affichage des enseignants", err);
    res.status(500).json({ error: err.message });
  }
};

//affichage liste entreprises                   :DONE
exports.afficherEntreprises = async (req, res) => {
  try {
    const entreprises = await prisma.entreprise.findMany({
      select: {
        nom: true,
        email: true,
      },
    });

    const entreprisesAvecRole = entreprises.map((entreprise) => ({
      ...entreprise,
      role: "entreprise",
    }));

    res.status(200).json({
      companies: entreprisesAvecRole,
      count: entreprises.length
    });
  } catch (err) {
    console.error("Erreur lors de l'affichage des entreprises", err);
    res.status(500).json({ error: err.message });
  }
};

//afficher tous les utilisateurs                :DONE
exports.afficherUtilisateurs = async (req, res) => {
  try {
    const etudiants = await prisma.etudiant.findMany({
      select: {
        nom: true,
        prenom: true,
        email: true,
      },
    });

    const enseignants = await prisma.enseignant.findMany({
      select: {
        nom: true,
        prenom: true,
        email: true,
      },
    });

    const entreprises = await prisma.entreprise.findMany({
      select: {
        nom: true,
        email: true,
      },
    });

    const utilisateurs = [
      ...entreprises.map((entreprise) => ({
        ...entreprise,
        role: "entreprise",
      })),

      ...enseignants.map((enseignant) => ({
        ...enseignant,
        role: "enseignant",
      })),
      ...etudiants.map((etudiant) => ({
        ...etudiant,
        role: "etudiant",
      })),
    ];

    res.status(200).json(utilisateurs);
  } catch (err) {
    console.error("Erreur lors de l'affichage des utilisateurs", err);
    res.status(500).json({ error: err.message });
  }
};
