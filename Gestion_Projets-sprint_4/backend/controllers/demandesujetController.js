const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const sendEmail = require("../outilles/email");


//linked
const sendDemande = async (req, res) => {
  try {
    
    const { sujetId } = req.body;
    const equipeId = req.user.equipeId;  // Récupération de l'ID de l'équipe depuis le token

    // Vérifier si une demande a déjà été envoyée pour ce sujet
    const existing = await prisma.demandeSujet.findFirst({
      where: { equipeId, sujetId },
    });

    if (existing) {
      return res.status(400).json({ error: "Vous avez déjà envoyé une demande pour ce sujet." });
    }
    const existingProject = await prisma.projet.findFirst({
      where: { equipeId },
    });

    if (existingProject) {
      return res.status(400).json({ error: "Votre équipe a déjà un projet avec un encadrant." });
    }
    const sujet = await prisma.sujet.findUnique({
      where: { id: sujetId },
      include: { Entreprise: true },
    });

    if (!sujet) {
      return res.status(404).json({ error: "Sujet introuvable." });
    }
 // Vérifier si le nombre de projets acceptés pour ce sujet a atteint la limite
       const teamCount = await prisma.projet.count({
        where: { sujetId: sujet.id },
      });
  
      if (teamCount >= 5) {
        return res.status(400).json({ error: "Le sujet a atteint le nombre maximal d'équipes." });
      }

    // Créer la demande de sujet
    await prisma.demandeSujet.create({
      data: {
        equipeId,   // Utilisation de l'ID de l'équipe récupéré du token
        sujetId,
      },
    });

    res.status(201).json({ message: "Demande envoyée avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi de la demande." });
  }
  
};
//linked
// Voir les demandes reçues par un enseignant
const getDemandesReceived = async (req, res) => {
  try {
    const enseignantId = req.user.userId;

    const demandes = await prisma.demandeSujet.findMany({
      where: {
        Sujet: { enseignantId },
        statut: "PENDING",
      },
      include: {
        Equipe: { include: { etudiants: true } },
        Sujet: true,
      },
    });

    res.status(200).json(demandes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des demandes." });
  }
};
//linekd
const acceptDemande = async (req, res) => {
  try {
    const { demandeId } = req.params;

    // Fetch the demande data with related Sujet and Equipe details
    const demande = await prisma.demandeSujet.findUnique({
      where: { id: parseInt(demandeId) },
      include: { 
        Sujet: { 
          include: { 
            equipeEncadrants: { include: { Enseignants: true } } 
          } 
        }, 
        Equipe: { 
          include: { 
            etudiants: true 
          } 
        } 
      },
    });

    if (!demande) {
      return res.status(404).json({ error: "Demande non trouvée." });
    }

    // Check if the demande exists and its status is PENDING
    if (demande.statut !== "PENDING") {
      return res.status(404).json({ error: "Demande déjà traitée." });
    }

    // Check if the team already has a project
    const existingProject = await prisma.projet.findUnique({
      where: { equipeId: demande.equipeId },
    });

    if (existingProject) {
      return res.status(400).json({ error: "L'équipe a déjà un projet." });
    }

    // Default encadrant to the enseignantId from the sujet
    let encadrantId = demande.Sujet.enseignantId;

    // If the sujet has a team of encadrants, choose the one with the least projects
    if (demande.Sujet.equipeEncadrants && demande.Sujet.equipeEncadrants.Enseignants.length > 0) {
      const encadrants = demande.Sujet.equipeEncadrants.Enseignants;

      // Count how many projects each enseignant is already supervising
      const encadrantCounts = await Promise.all(
        encadrants.map(async (e) => {
          const count = await prisma.projet.count({
            where: { encadrantId: e.id }
          });
          return { id: e.id, count };
        })
      );

      // Sort encadrants by the number of projects, pick the one with the least
      encadrantCounts.sort((a, b) => a.count - b.count);
      encadrantId = encadrantCounts[0].id;
    }

    const now = new Date();

    // Create the project with the selected encadrant
    const project = await prisma.projet.create({
      data: {
        equipeId: demande.equipeId,
        sujetId: demande.sujetId,
        encadrantId: encadrantId,
        dateDebut: now,
        dateFin: new Date(now.setFullYear(now.getFullYear() + 1)),
      },
    });

    // Update the demande status to ACCEPTED
    await prisma.demandeSujet.update({
      where: { id: demande.id },
      data: { statut: "ACCEPTED" },
    });

    // Delete all other pending demandes for the same team
    await prisma.demandeSujet.deleteMany({
      where: {
        equipeId: demande.equipeId,
        statut: "PENDING",
        id: { not: demande.id },  // Do not delete the accepted demande
      },
    });

    // Find the chefEquipe (team leader) by searching for the Etudiant where chefEquipe is true
    const chefEquipe = demande.Equipe.etudiants.find(e => e.chefEquipe);

    if (!chefEquipe || !chefEquipe.email) {
      return res.status(400).json({ error: "Aucun chef d'équipe trouvé ou l'email est manquant." });
    }

    // Fetch the enseignant (supervisor)
    const enseignant = await prisma.enseignant.findUnique({
      where: { id: demande.Sujet.enseignantId },
    });

    if (!enseignant) {
      return res.status(400).json({ error: "Enseignant introuvable." });
    }

    let emaill = chefEquipe.email;
    console.log(emaill);

    // Send email to the team leader
    await sendEmail({
      email: emaill,
      subject: "Demande Acceptée",
      message: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
          <h2 style="color:rgb(4, 13, 4);">Demande acceptée</h2>

          <p>Bonjour ${chefEquipe.prenom || ""} ${chefEquipe.nom || ""},</p>

          <p>Votre demande pour le sujet <strong>"${demande.Sujet.titre}"</strong> a été <strong style="color: #4CAF50;">acceptée</strong>.</p>

          <p>Vous pouvez commencer votre projet sous la supervision de votre encadrant.</p>

          <p>Cordialement,<br/>
          ${enseignant.prenom || ""} ${enseignant.nom || ""}</p>
        </div>
      `,
    });

    // Send a success response
    res.status(200).json({ message: "Demande acceptée, projet créé avec affectation automatique d'un encadrant." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'acceptation." });
  }
};
//linked
const rejectDemande = async (req, res) => {
  try {
    const { demandeId } = req.params;
    const { motifRefus } = req.body;

    if (!motifRefus) {
      return res.status(400).json({ error: "Motif de refus obligatoire." });
    }

    // Find the demande
    const demande = await prisma.demandeSujet.findUnique({
      where: { id: parseInt(demandeId) },
      include: { Equipe: { include: { etudiants: true } }, Sujet: true },
    });

    // Check if the demande exists
    if (!demande) {
      return res.status(404).json({ error: "Demande non trouvée." });
    }

    // Check if the demande is still pending
    if (demande.statut !== "PENDING") {
      return res.status(400).json({ error: "La demande a déjà été traitée." });
    }

    // Update the demande status to REJECTED
    await prisma.demandeSujet.update({
      where: { id: demande.id },
      data: {
        statut: "REJECTED",
        motifRefus,
      },
    });

    // Find the chef d'équipe (team leader)
    const chefEquipe = demande.Equipe.etudiants.find(e => e.chefEquipe);

    if (!chefEquipe || !chefEquipe.email) {
      return res.status(400).json({ error: "Aucun chef d'équipe trouvé ou email manquant." });
    }
 // Fetch the enseignant (supervisor)
 const enseignant = await prisma.enseignant.findUnique({
  where: { id: demande.Sujet.enseignantId },
});

if (!enseignant) {
  return res.status(400).json({ error: "Enseignant introuvable." });
}

    // Send the rejection email
    await sendEmail({
      email: chefEquipe.email,
      subject: "Demande Refusée",
      message: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
          <h2 style="color: rgb(255, 0, 0);">Demande refusée</h2>

          <p>Bonjour ${chefEquipe.prenom || ""} ${chefEquipe.nom || ""},</p>

          <p>Votre demande pour le sujet <strong>"${demande.Sujet.titre}"</strong> a été <strong style="color: red;">refusée</strong>.</p>

          <p>Motif du refus : <strong>"${motifRefus}"</strong></p>

          <p>Nous vous encourageons à revoir votre projet et à soumettre une nouvelle demande.</p>

          <p>Cordialement,<br/>
          ${enseignant.prenom || ""} ${enseignant.nom || ""}</p>
        </div>
      `,
    });

    res.status(200).json({ message: "Demande refusée et notification envoyée." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du refus." });
  }
};

module.exports = {
  sendDemande,
  getDemandesReceived,
  acceptDemande,
  rejectDemande,
};
