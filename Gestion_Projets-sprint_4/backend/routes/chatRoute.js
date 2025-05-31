const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/users", async (req, res) => {
  try {
    // Récupérer les utilisateurs de toutes les tables
    const [etudiants, enseignants, entreprises] = await Promise.all([
      prisma.etudiant.findMany({
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          niveau: true,
          specialite: true,
        },
      }),
      prisma.enseignant.findMany({
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      }),
      prisma.entreprise.findMany({
        select: {
          id: true,
          nom: true,
          email: true,
        },
      }),
    ]);

    // Formater les données avec le type d'utilisateur et garder les IDs originaux
    const formattedUsers = [
      ...etudiants.map((user) => ({
        id: user.id, // Garder l'ID original de la base de données
        nom: user.nom,
        prenom: user.prenom || "",
        email: user.email,
        role: "etudiant",
        displayName: user.prenom ? `${user.nom} ${user.prenom}` : user.nom,
        niveau: user.niveau,
        specialite: user.specialite,
      })),
      ...enseignants.map((user) => ({
        id: user.id, // Garder l'ID original de la base de données
        nom: user.nom,
        prenom: user.prenom || "",
        email: user.email,
        role: "enseignant",
        displayName: user.prenom ? `${user.nom} ${user.prenom}` : user.nom,
      })),
      ...entreprises.map((user) => ({
        id: user.id, // Garder l'ID original de la base de données
        nom: user.nom,
        prenom: "",
        email: user.email,
        role: "entreprise",
        displayName: user.nom,
      })),
    ];

    // Trier par nom pour une meilleure UX
    const sortedUsers = formattedUsers.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );

    res.json(sortedUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

module.exports = router;
