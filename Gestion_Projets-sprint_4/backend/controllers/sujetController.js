const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcrypt");
//linked
// FUNCTION POUR DEPOSER UN SUJET--ZEDT F SCHEMA A MODEL TA3 USER PSQ 7TAJIT LE ROLE
exports.deposerSujet = async (req, res) => {
  try {
    const { titre, description, niveau, specialite, encadrantsEmails } =
      req.body;
    const documentPath = req.file?.path;
    const { userId, role } = req.user;

    // Validation de base
    if (!titre || !description) {
      return res
        .status(400)
        .json({ error: "Le titre et la description sont obligatoires." });
    }

    // Vérification du rôle
    if (role !== "enseignant" && role !== "entreprise") {
      return res.status(403).json({
        error:
          "Seuls les enseignants et les entreprises peuvent déposer un sujet.",
      });
    }

    // Fonction helper pour traiter les encadrants
    const processEncadrants = async (emails) => {
      try {
        const emailArray =
          typeof emails === "string" ? JSON.parse(emails) : emails;

        if (!Array.isArray(emailArray)) {
          throw new Error("Format invalide");
        }

        const encadrants = await prisma.enseignant.findMany({
          where: { email: { in: emailArray } },
          select: { id: true },
        });

        if (encadrants.length !== emailArray.length) {
          throw new Error("Encadrants non trouvés");
        }

        return encadrants.map((e) => ({ id: e.id }));
      } catch (error) {
        throw new Error(`Erreur traitement encadrants: ${error.message}`);
      }
    };

    // Cas entreprise
    if (role === "entreprise") {
      if (!documentPath) {
        return res.status(400).json({
          error: "Un document est obligatoire pour les entreprises.",
        });
      }

      let encadrantsConnections = [];
      if (encadrantsEmails) {
        try {
          encadrantsConnections = await processEncadrants(encadrantsEmails);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }

      const sujetData = {
        titre,
        description,
        niveau: 5,
        specialite,
        document: documentPath,
        Entreprise: { connect: { id: userId } },
      };

      if (encadrantsConnections.length > 0) {
        sujetData.equipeEncadrants = {
          create: {
            Enseignants: { connect: encadrantsConnections },
          },
        };
      }

      const sujet = await prisma.sujet.create({
        data: sujetData,
        include: {
          equipeEncadrants: { include: { Enseignants: true } },
        },
      });

      return res.status(201).json({
        message: "Sujet déposé avec succès par l'entreprise",
        sujet,
      });
    }

    // Cas enseignant
    // Validation du niveau
    const niveauInt = parseInt(niveau, 10);
    if (isNaN(niveauInt)) {
      return res
        .status(400)
        .json({ error: "Le niveau doit être un nombre valide." });
    }

    let encadrantsConnections = [];
    if (encadrantsEmails) {
      try {
        encadrantsConnections = await processEncadrants(encadrantsEmails);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    const sujet = await prisma.sujet.create({
      data: {
        titre,
        description,
        niveau: niveauInt,
        specialite,
        document: documentPath,
        Enseignant: { connect: { id: userId } },
        equipeEncadrants: {
          create: {
            Enseignants: { connect: encadrantsConnections },
          },
        },
      },
      include: {
        equipeEncadrants: { include: { Enseignants: true } },
      },
    });

    return res.status(201).json({
      message: "Sujet déposé avec succès par un enseignant",
      sujet,
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Violation de contrainte unique",
        details: error.meta?.target,
      });
    }

    return res.status(500).json({
      error: "Erreur serveur",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
//linked
// FUNTION T3 SUPPRESSION
exports.deleteSujet = async (req, res) => {
  const { id } = req.params;

  try {
    // CHERCHER 3LA SUJET LI BAGHY Y SUPPRIMIH
    const sujet = await prisma.sujet.findUnique({
      where: { id: parseInt(id) },
      include: { equipeEncadrants: true, Projet: true }, // HADO LES RELATION LIEE M3A MODEL T3 SUJET CHOFO SCHEMA TFHMO
    });

    if (!sujet) {
      return res.status(404).json({ error: "Sujet non trouvé" });
    }

    // Supprimer les entrées associées dans la table EquipeEncadrants
    if (sujet.equipeEncadrants) {
      // D'abord, dissocier les enseignants de l'équipe d'encadrants YA3NI NGL3O AYY HAJA KANAT CONNECTER M3A SUJET TANI CHOFO SCHEMA TAFHMO
      await prisma.equipeEncadrants.update({
        where: { id: sujet.equipeEncadrants.id },
        data: {
          Enseignants: {
            set: [], // Dissocier tous les enseignants
          },
        },
      });

      // Ensuite, dissocier l'équipe d'encadrants du sujet
      await prisma.sujet.update({
        where: { id: parseInt(id) },
        data: {
          encadrants: null, // Dissocier l'équipe d'encadrants du sujet
        },
      });

      // Enfin, supprimer l'équipe d'encadrants
      await prisma.equipeEncadrants.delete({
        where: { id: sujet.equipeEncadrants.id },
      });
    }

    // Supprimer les Projets associés au sujet
    if (sujet.Projet && sujet.Projet.length > 0) {
      await prisma.projet.deleteMany({
        where: { sujetId: parseInt(id) },
      });
    }

    // Supprimer le sujet
    await prisma.sujet.delete({
      where: { id: parseInt(id) },
    });

    // Supprimer le fichier associé s'il existe
    if (sujet.document) {
      const fs = require("fs");
      fs.unlink(sujet.document, (err) => {
        if (err)
          console.error("Erreur lors de la suppression du fichier :", err);
      });
    }

    res.status(200).json({ message: "Good job Sara 😍" });
  } catch (error) {
    console.error("Erreur lors de la suppression du sujet :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
//linked
// Récupérer tous les sujets (BAYNAA)
exports.getSujets = async (req, res) => {
  try {
    const sujets = await prisma.sujet.findMany({
      include: {
        equipeEncadrants: {
          include: {
            Enseignants: true,
          },
        },
        Enseignant: true,
        Entreprise: true,
      },
    });
    res.status(200).json(sujets);
  } catch (error) {
    console.error("Erreur lors de la récupération des sujets :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
//linked
//afficher un sujet par un  enseignant or une entreprise specifier
exports.getMySujets = async (req, res) => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    let sujets;

    if (role === "enseignant") {
      sujets = await prisma.sujet.findMany({
        where: {
          OR: [
            { enseignantId: userId },
            {
              equipeEncadrants: {
                Enseignants: {
                  some: { id: userId },
                },
              },
            },
          ],
        },
        include: {
          equipeEncadrants: {
            include: {
              Enseignants: true,
            },
          },
          Entreprise: true,
        },
      });
    } else if (role === "entreprise") {
      sujets = await prisma.sujet.findMany({
        where: {
          entrepriseId: userId,
        },
        include: {
          equipeEncadrants: {
            include: {
              Enseignants: true,
            },
          },
          Enseignant: true,
        },
      });
    } else {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    res.status(200).json(sujets || []);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Récupérer un sujet par son ID(BAYNA*2)
exports.getSujetById = async (req, res) => {
  const { id } = req.params;

  try {
    const sujet = await prisma.sujet.findUnique({
      where: { id: parseInt(id) },
      include: {
        equipeEncadrants: {
          include: {
            Enseignants: true,
          },
        },
        Enseignant: true,
        Entreprise: true,
      },
    });

    if (!sujet) {
      return res.status(404).json({ message: "Sujet non trouvé" });
    }

    res.status(200).json(sujet);
  } catch (error) {
    console.error("Erreur lors de la récupération du sujet :", error);
    res.status(500).json({ message: error.message });
  }
};
//linked (need fix f file f front)
// MISE A JOUR
exports.updateSujet = async (req, res) => {
  const { id } = req.params;
  const { titre, description, niveau, specialite, encadrantsEmails } = req.body;
  const documentPath = req.file ? req.file.path : null;

  try {
    // Convertir encadrantsEmails en tableau si nécessaire
    let emails = [];
    if (encadrantsEmails) {
      try {
        emails =
          typeof encadrantsEmails === "string"
            ? JSON.parse(encadrantsEmails)
            : encadrantsEmails;
      } catch (error) {
        return res.status(400).json({
          error: "Le champ 'encadrantsEmails' doit être un tableau JSON valide.",
        });
      }
    }

    // Convertir le niveau en nombre
    const niveauNumber = parseInt(niveau);
    if (niveau && isNaN(niveauNumber)) {
      return res.status(400).json({
        error: "Le champ 'niveau' doit être un nombre valide.",
      });
    }

    // Mettre à jour les informations du sujet (sans modifier les champs si non fournis)
    const sujet = await prisma.sujet.update({
      where: { id: parseInt(id) },
      data: {
        ...(titre && { titre }),
        ...(description && { description }),
        ...(niveau && { niveau: niveauNumber }),
        ...(specialite && { specialite }),
        ...(documentPath && { document: documentPath }),
      },
      include: {
        equipeEncadrants: true,
      },
    });

    // Si des emails sont fournis, gérer les encadrants
    if (emails.length > 0) {
      const encadrants = await prisma.enseignant.findMany({
        where: { email: { in: emails } },
        select: { id: true },
      });

      if (encadrants.length !== emails.length) {
        return res.status(404).json({
          error: "email ne correspondent à aucun enseignant.",
        });
      }

      let equipeId = sujet.equipeEncadrants?.id;

      if (!equipeId) {
        // Créer une nouvelle équipe si elle n'existe pas
        const newEquipe = await prisma.equipeEncadrants.create({
          data: {
            Sujet: {
              connect: { id: sujet.id },
            },
            Enseignants: {
              connect: encadrants.map((e) => ({ id: e.id })),
            },
          },
        });
        equipeId = newEquipe.id;
      } else {
        // Sinon, mettre à jour l'équipe existante
        await prisma.equipeEncadrants.update({
          where: { id: equipeId },
          data: {
            Enseignants: {
              set: encadrants.map((e) => ({ id: e.id })),
            },
          },
        });
      }
    }

    res.status(200).json({
      message: "Sujet mis à jour avec succès",
      sujet,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du sujet :", error);
    res.status(500).json({
      error: error.message || "Erreur serveur",
    });
  }
};


exports.updateSujetEntreprise = async (req, res) => {
  const { id } = req.params;
  const { titre, description, specialite, encadrantsEmails } = req.body; // Correction de la faute de frappe
  const documentPath = req.file ? req.file.path : null;
  const userId = req.user?.userId;
  const role = req.user?.role;

  try {
    // ... validations existantes ...

    // Traitement des encadrants - version plus robuste
    let emails = [];
    if (encadrantsEmails && encadrantsEmails.length > 0) {
      try {
        emails =
          typeof encadrantsEmails === "string"
            ? JSON.parse(encadrantsEmails)
            : encadrantsEmails;
      } catch (e) {
        console.error("Erreur parsing encadrantsEmails:", e);
      }
    }

    // Mise à jour du sujet
    const sujet = await prisma.sujet.update({
      where: { id: parseInt(id) },
      data: {
        titre,
        description,
        specialite,
        niveau: 5,
        ...(documentPath && { document: documentPath }),
      },
      include: {
        equipeEncadrants: {
          include: {
            Enseignants: true,
          },
        },
      },
    });
    if (emails.length > 0) {
      const encadrants = await prisma.enseignant.findMany({
        where: { email: { in: emails } },
        select: { id: true },
      });

      if (encadrants.length !== emails.length) {
        return res.status(404).json({
          error: "Un ou plusieurs emails ne correspondent à aucun enseignant.",
        });
      }

      if (existingSujet.equipeEncadrants) {
        await prisma.equipeEncadrants.update({
          where: { id: existingSujet.equipeEncadrants.id },
          data: {
            Enseignants: {
              set: encadrants.map((e) => ({ id: e.id })),
            },
          },
        });
      } else {
        // Création avec la bonne relation
        await prisma.equipeEncadrants.create({
          data: {
            sujet: {
              // Utilisez le nom de la relation défini dans votre schéma Prisma
              connect: { id: sujet.id },
            },
            Enseignants: {
              connect: encadrants.map((e) => ({ id: e.id })),
            },
          },
        });
      }
    } else if (existingSujet.equipeEncadrants) {
      // Option: supprimer l'équipe si aucun encadrant n'est spécifié
      await prisma.equipeEncadrants.delete({
        where: { id: existingSujet.equipeEncadrants.id },
      });
    }

    // Recharger le sujet avec les relations mises à jour
    const updatedSujet = await prisma.sujet.findUnique({
      where: { id: parseInt(id) },
      include: {
        equipeEncadrants: {
          include: {
            Enseignants: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Sujet mis à jour avec succès",
      sujet: updatedSujet,
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({
      error: "Erreur serveur",
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  }
};
