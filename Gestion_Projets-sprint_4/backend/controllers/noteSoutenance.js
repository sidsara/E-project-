const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.ajouterNotes = async (req, res) => {
  const { soutenanceId } = req.params;
  const juryPresidentId = req.user.userId;
  const { notes } = req.body;

  if (!Array.isArray(notes)) {
    return res.status(400).json({ message: 'Format des notes invalide' });
  }

  try {
    const soutenance = await prisma.soutenance.findUnique({
      where: { id: parseInt(soutenanceId) },
      include: {
        equipe: {
          include: { etudiants: true }
        }
      }
    });

    if (!soutenance) return res.status(404).json({ message: 'Soutenance non trouvée' });

    const etudiantsIds = soutenance.equipe.etudiants.map(e => e.id);

    for (let noteObj of notes) {
      if (!etudiantsIds.includes(noteObj.etudiantId)) {
        return res.status(400).json({ message: `L'étudiant ${noteObj.etudiantId} ne fait pas partie de l'équipe.` });
      }
    }

    const savedNotes = await prisma.$transaction(
      notes.map(note => 
        prisma.noteSoutenance.upsert({
          where: {
            uniqueNote: {
              etudiantId: note.etudiantId,
              soutenanceId: parseInt(soutenanceId),
              juryPresidentId
            }
          },
          update: {
            note: note.note
          },
          create: {
            etudiantId: note.etudiantId,
            soutenanceId: parseInt(soutenanceId),
            juryPresidentId,
            note: note.note
          }
        })
      )
    );

    res.status(201).json(savedNotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
