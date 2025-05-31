const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createSoutenance = async (req, res) => {
  try {
    const { equipeId, date, heure, salle, presidentId, membreJuryIds } =
      req.body;
    //membreJuryIds ykoun un tableau

    if (
      !equipeId ||
      !date ||
      !heure ||
      !salle ||
      !presidentId ||
      !membreJuryIds
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (membreJuryIds.includes(presidentId)) {
      return res
        .status(400)
        .json({ error: "president should not be in members list " });
    }

    const newSoutenance = await prisma.$transaction(async (prisma) => {
      const soutenance = await prisma.soutenance.create({
        data: {
          equipeId,
          date: new Date(date),
          heure,
          salle,
        },
      });

      // president
      await prisma.membreJury.create({
        data: {
          soutenanceId: soutenance.id,
          enseignantId: presidentId,
          estPresident: true,
        },
      });

      //autres membres du jury
      const membreJuryPromises = membreJuryIds.map((enseignantId) => {
        return prisma.membreJury.create({
          data: {
            soutenanceId: soutenance.id,
            enseignantId,
            estPresident: false,
          },
        });
      });

      await Promise.all(membreJuryPromises);

      // affichage
      return prisma.soutenance.findUnique({
        where: { id: soutenance.id },
        include: {
          membresJury: {
            include: {
              enseignant: true,
            },
          },
          equipe: true,
        },
      });
    });

    res.status(201).json(newSoutenance);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ message: error.message });
  }
};

//get soutenances ta3 chaque enseignant
exports.mesSoutenances = async (req, res) => {
  try {
    const enseignantId = req.user.userId;

    const soutenances = await prisma.soutenance.findMany({
      where: {
        membresJury: {
          some: {
            enseignantId,
          },
        },
      },
      include: {
        equipe: {
          include: {
            projet: {
              select: {
                Sujet: {
                  select: {
                    titre: true,
                  },
                },
              },
            },
          },
        },
        membresJury: {
          where: {
            enseignantId,
          },
          select: {
            estPresident: true,
          },
        },
      },
    });

    const formattedSoutenances = soutenances.map((soutenance) => {
      return {
        sujet: soutenance.equipe.projet?.Sujet?.titre,
        date: soutenance.date,
        heure: soutenance.heure,
        salle: soutenance.salle,
        role: soutenance.membresJury[0]?.estPresident ? "President" : "Member",
      };
    });

    res.status(200).json(formattedSoutenances);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSoutenanceEquipe = async (req, res) => {
  try {
    const etudiantId = req.user.userId;

    const etudiant = await prisma.etudiant.findUnique({
      where: { id: etudiantId },
      select: { equipeId: true },
    });

    if (!etudiant || !etudiant.equipeId) {
      return res.status(404).json({ message: "No team found" });
    }

    const soutenance = await prisma.soutenance.findUnique({
      where: { equipeId: etudiant.equipeId },
      include: {
        membresJury: {
          include: {
            enseignant: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });

    if (!soutenance) {
      return res
        .status(404)
        .json({ message: " Defense date not yet scheduled " });
    }

    const formattedSoutenance = {
      date: soutenance.date,
      heure: soutenance.heure,
      salle: soutenance.salle,
      jury: soutenance.membresJury.map((membre) => ({
        nom: `${membre.enseignant.prenom} ${membre.enseignant.nom}`,
        role: membre.estPresident ? "President" : "Member",
      })),
    };

    res.status(200).json(formattedSoutenance);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Afficher les livrables d'une équipe pour les enseignants du jury
exports.getLivrablesEquipe = async (req, res) => {
  try {
    const enseignantId = req.user.userId;
    const { equipeId } = req.params;

    // Vérifier si l'enseignant fait partie du jury de la soutenance de cette équipe
    const membreJury = await prisma.membreJury.findFirst({
      where: {
        enseignantId,
        soutenance: {
          equipeId: parseInt(equipeId),
        },
      },
      include: {
        soutenance: true
      }
    });
    
    // Vérifier si le membre du jury existe
    if (!membreJury) {
      return res.status(403).json({ 
        message: "Vous n'êtes pas autorisé à accéder aux livrables de cette équipe" 
      });
    }

    // Récupérer le projet de l'équipe
    const projet = await prisma.projet.findUnique({
      where: { equipeId: parseInt(equipeId) },
      select: { id: true },
    });

    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé pour cette équipe" });
    }

    // Récupérer les livrables du projet
    const livrables = await prisma.livrable.findMany({
      where: { projetId: projet.id },
      orderBy: { dateDepot: 'desc' },
    });

    res.status(200).json({
      status: "success",
      data: livrables,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des livrables:", error);
    res.status(500).json({ message: error.message });
  }
};

const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

// Générer un PV de délibération

exports.genererPvDeliberation = async (req, res) => {
  try {
    const { soutenanceId } = req.params;
    const { commentaires, decision } = req.body;
    const enseignantId = req.user.userId;

    // Verify president
    const membreJury = await prisma.membreJury.findFirst({
      where: {
        soutenanceId: parseInt(soutenanceId),
        enseignantId,
        estPresident: true,
      },
      include: {
        soutenance: {
          include: {
            equipe: {
              include: {
                etudiants: {
                  include: {
                    notesSoutenances: {
                      where: {
                        soutenanceId: parseInt(soutenanceId)
                      }
                    }
                  }
                },
                projet: {
                  include: {
                    Sujet: true,
                    Encadrant: true
                  }
                }
              }
            },
            membresJury: {
              include: {
                enseignant: true
              }
            }
          }
        }
      }
    });

    // Generate PDF with existing student data
    const doc = new PDFDocument({ margin: 50 });
    const pdfFileName = `PV_${soutenanceId}_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, '../uploads-pv', pdfFileName);
    const stream = fs.createWriteStream(pdfPath);
    
    doc.pipe(stream);
    
    // Header
    doc.fillColor('#4A90E2').fontSize(20).text('PROCÈS-VERBAL DE DÉLIBÉRATION', { align: 'center' });
    doc.moveDown();
    
    // Defense info
    const soutenance = membreJury.soutenance;
    doc.fillColor('#000000').fontSize(12)
      .text(`Date: ${new Date(soutenance.date).toLocaleDateString()}`)
      .text(`Heure: ${soutenance.heure}`)
      .text(`Salle: ${soutenance.salle}`);
    doc.moveDown();
    
    // Project info
    const projet = soutenance.equipe.projet;
    doc.fillColor('#4A90E2').fontSize(14).text('Projet', { underline: true });
    doc.fillColor('#000000').fontSize(12)
      .text(`Titre: ${projet?.Sujet?.titre || 'Non défini'}`)
      .text(`Encadrant: ${projet?.Encadrant ? `${projet.Encadrant.nom} ${projet.Encadrant.prenom}` : 'Non défini'}`)
      .text(`Spécialité: ${soutenance.equipe.specialite}`);
    doc.moveDown();
    
    // Notes
    doc.fillColor('#4A90E2').fontSize(14).text('Membres de l\'équipe et Notes', { underline: true });
    soutenance.equipe.etudiants.forEach(etudiant => {
      const noteData = etudiant.notesSoutenances.length > 0 
        ? etudiant.notesSoutenances[0] 
        : null;

      doc.fillColor('#000000').fontSize(12)
        .text(`Nom complet: ${etudiant.prenom} ${etudiant.nom}`)
        .text(`Note: ${noteData ? noteData.note + '/20' : 'Non notée'}`);

      // Add chef d'équipe status if applicable
      if (etudiant.chefEquipe) {
        doc.text('Statut: Chef d\'équipe');
      }
      
      // Add a line between students
      doc.moveDown();
      doc.fillColor('#CCCCCC').text('─────────────────────────────');
      doc.moveDown();
    });
    
    // Jury members
    doc.fillColor('#4A90E2').fontSize(14).text('Membres du Jury', { underline: true });
    soutenance.membresJury.forEach(membre => {
      doc.fillColor('#000000').fontSize(12)
        .text(`${membre.enseignant.nom} ${membre.enseignant.prenom} - ${membre.estPresident ? 'Président' : 'Membre'}`);
    });
    doc.moveDown();
    
    // Comments and Decision
    doc.fillColor('#4A90E2').fontSize(14).text('Délibération', { underline: true });
    doc.fillColor('#000000').fontSize(12)
      .text('Commentaires:')
      .text(commentaires)
      .moveDown()
      .text('Décision:')
      .text(decision);
    doc.moveDown(2);
    
    // Signatures
    doc.fillColor('#4A90E2').fontSize(14).text('Signatures', { underline: true });
    soutenance.membresJury.forEach(membre => {
      doc.fillColor('#000000').fontSize(12)
        .text(`${membre.estPresident ? 'Président' : 'Membre'}: ${membre.enseignant.nom} ${membre.enseignant.prenom}`)
        .moveDown()
        .text('_______________________')
        .moveDown();
    });
    
    doc.end();
    
    await new Promise((resolve) => stream.on('finish', resolve));
// Update the soutenance with the generated PDF URL
await prisma.soutenance.update({
  where: { 
    id: parseInt(soutenanceId) 
  },
  data: {
    pv: {
      create: {
        notes: null,
        commentaires,
        decision,
        dateGeneration: new Date(),
        pdfUrl: `/uploads-pv/${pdfFileName}`
      }
    }
  }
});

    res.status(201).json({
      status: "success",
      message: "PV généré avec succès",
      pdfUrl: `/uploads-pv/${pdfFileName}`
    });

  } catch (error) {
    console.error("Erreur lors de la génération du PV:", error);
    res.status(500).json({ message: error.message });
  }
};



// Route pour télécharger le PV en PDF
exports.telechargerPvPdf = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../uploads-pv', fileName);
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ message: "Le fichier PDF n'a pas été trouvé" });
    }
    
    // Envoyer le fichier
    res.download(filePath);
  } catch (error) {
    console.error("Erreur lors du téléchargement du PV:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.afficherPvEquipe = async (req, res) => {
  try {
    const etudiantId = req.user.userId;

    // Get student's team info and PV
    const etudiant = await prisma.etudiant.findFirst({
      where: { id: etudiantId },
      include: {
        equipe: {
          include: {
            soutenance: {
              include: {
                pv: true
              }
            }
          }
        }
      }
    });

    if (!etudiant?.equipe?.soutenance?.pv) {
      return res.status(404).json({
        message: "Aucun PV n'a été généré pour votre soutenance"
      });
    }

    const pdfPath = path.join(__dirname, '../uploads-pv', etudiant.equipe.soutenance.pv.pdfUrl.split('/').pop());

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        message: "Le fichier PDF n'a pas été trouvé"
      });
    }

    // Set response headers for PDF display
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=PV_Deliberation.pdf');

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Erreur lors de l'affichage du PV:", error);
    res.status(500).json({ message: error.message });
  }
};
