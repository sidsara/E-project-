const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
//projects encadrant // linked

exports.getMyProjects = async (req, res) => {
  try {
    const { userId } = req.user;
    const projects = await prisma.projet.findMany({
      where: {
        encadrantId: userId,
      },
      include: {
        Sujet: {
          select: {
            titre: true,
            description: true,
          },
        },
        Equipe: {
          select: {
            id: true,
            etudiants: {
              // Changed from 'members' to 'etudiants'
              select: {
                nom: true,
                prenom: true,
                profileImageUrl: true,
                chefEquipe: true,
              },
            },
          },
        },
      },
    });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        message: "Aucun projet trouvé",
      });
    }

    return res.status(200).json({
      status: "success",
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des projets",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//Encadrant : fixer des rdv // linked
exports.createAppointment = async (req, res) => {
  try {
    const { titre, date, heure, salle, duration, type } = req.body;
    const projetId = req.params.projectId;

    // Validate required fields
    if (!titre || !date || !heure || !salle || !duration) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["titre", "date", "heure", "salle", "duration"],
      });
    }

    // Combine date and time into DateTime
    const dateTime = new Date(`${date}T${heure}:00`);

    // Validate enum values
    const validTypes = ["ONLINE", "ONSITE"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid meeting type",
        validTypes,
      });
    }

    const rdv = await prisma.rendezVous.create({
      data: {
        titre,
        date: dateTime,
        heure,
        salle,
        duration,
        type: type || "ONSITE",
        projetId: parseInt(projetId),
        // status defaults to UPCOMING
      },
    });

    return res.status(201).json({
      status: "success",
      data: rdv,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({
      message: "Failed to create appointment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//update status ta3 appointment (encadrant) //linked
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const appointment = await prisma.rendezVous.update({
      where: { id: parseInt(appointmentId) },
      data: { status: status },
    });

    return res.status(200).json({
      status: "success",
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//update status ta3 task (chef dequipe) //linked
exports.updateTaskStatus = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!status) {
      return res.status(400).json({ message: "Le statut est requis" });
    }

    // First check if task exists and belongs to the project
    const task = await prisma.task.findFirst({
      where: {
        AND: [{ id: parseInt(taskId) }, { projetId: parseInt(projectId) }],
      },
      include: {
        projet: {
          include: {
            Equipe: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Tâche non trouvée ou n'appartient pas à ce projet",
      });
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status },
      include: {
        projet: {
          include: {
            Equipe: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Statut de la tâche mis à jour avec succès",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour du statut",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//donner une remarque (encadrant) // linked
exports.addRemark = async (req, res) => {
  try {
    const { remark } = req.body;
    const projetId = parseInt(req.params.projectId);

    if (!remark) {
      return res.status(400).json({ message: "Remark is required" });
    }

    const task = await prisma.Remarque.create({
      data: { contenu: remark, projetId: projetId },
    });

    return res.status(200).json({
      status: "success",
      data: task,
    });
  } catch (error) {
    console.error("Error adding remark:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get all remarks (equipe) // linked
exports.getAllRemarks = async (req, res) => {
  try {
    const projetId = parseInt(req.params.projectId, 10); // Convertir en entier

    if (isNaN(projetId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const remarks = await prisma.remarque.findMany({
      where: {
        projetId: projetId, // Utiliser l'entier converti
      },
    });

    if (!remarks || remarks.length === 0) {
      return res.status(404).json({ message: "No remarks found" });
    }

    return res.status(200).json({
      status: "success",
      data: remarks,
    });
  } catch (error) {
    console.error("Error fetching remarks:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
//linked
//deposer un livrable (chef dequipe)
exports.deposerLivrable = async (req, res) => {
  try {
    const projetId = parseInt(req.params.projectId);
    const { nom } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Veuillez fournir un fichier",
      });
    }

    const livrable = await prisma.livrable.create({
      data: {
        nom: nom || req.file.originalname,
        fichier: req.file.path,
        projetId: projetId,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Livrable déposé avec succès",
      data: livrable,
    });
  } catch (error) {
    console.error("Erreur lors du dépôt du livrable:", error);
    return res.status(500).json({
      message: "Erreur lors du dépôt du livrable",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// linked
exports.createTache = asyncHandler(async (req, res) => {
  const { description, deadline } = req.body;
  const { projectId } = req.params;

  try {
    const task = await prisma.task.create({
      data: {
        description,
        deadline: new Date(deadline),
        projetId: parseInt(projectId),
        status: "TODO",
      },
    });
    console.log("Created task:", task); // Debug log

    res.status(201).json(task);
  } catch (error) {
    console.error("Erreur lors de la création de la tâche:", error);
    res.status(500).json({ message: "Erreur lors de la création de la tâche" });
  }
});
// linked
exports.getTaches = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        projetId: parseInt(projectId), // Convert string to integer
      },
      include: {
        projet: {
          include: {
            Equipe: true,
          },
        },
      },
    });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        message: "Aucune tâche trouvée pour ce projet",
      });
    }

    return res.status(200).json({
      status: "success",
      data: tasks,
    });
  } catch (error) {
    console.error("Error while fetching tasks:", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des tâches",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Supprimer une tâche // linked
exports.deleteTache = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  try {
    await prisma.task.delete({
      where: {
        id: parseInt(taskId),
      },
    });

    res.json({ message: "Task deleted succesfully" });
  } catch (error) {
    console.error("Error while deleting the task:", error);
    res.status(500).json({ message: "Error while deleting the task" });
  }
});

//afficher les livrables // linked
exports.getLivrables = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  try {
    const livrables = await prisma.livrable.findMany({
      where: {
        projetId: parseInt(projectId),
      },
    });

    res.json(livrables);
  } catch (error) {
    console.error("Error while fetching deliverables:", error);
    res.status(500).json({ message: "Error while fetching deliverables" });
  }
});
// linked
exports.getTaches = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  try {
    // Convertir projectId en entier
    const projectIdInt = parseInt(projectId, 10);

    if (isNaN(projectIdInt)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projetId: projectIdInt, // Utiliser l'entier converti
      },
      include: {
        projet: {
          include: {
            Equipe: true,
          },
        },
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error while fetching tasks:", error);
    res.status(500).json({ message: "Error while fetching tasks" });
  }
});

// Supprimer une tâche // linked
exports.deleteTache = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  try {
    // Vérifier si la tâche existe
    const task = await prisma.task.findUnique({
      where: {
        id: parseInt(taskId, 10),
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Supprimer la tâche
    await prisma.task.delete({
      where: {
        id: parseInt(taskId, 10),
      },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error while deleting the task:", error);
    res.status(500).json({ message: "Error while deleting the task" });
  }
});
// linked
exports.getRendezVous = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  try {
    // Convertir projectId en entier
    const projectIdInt = parseInt(projectId, 10);

    if (isNaN(projectIdInt)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Récupérer les rendez-vous associés au projet
    const rendezVous = await prisma.rendezVous.findMany({
      where: {
        projetId: projectIdInt,
      },
      orderBy: {
        date: "asc", // Trier par date croissante
      },
    });

    if (rendezVous.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for this project" });
    }

    res.status(200).json({
      status: "success",
      data: rendezVous,
    });
  } catch (error) {
    console.error("Error while fetching appointments:", error);
    res.status(500).json({ message: "Error while fetching appointments" });
  }
});
// linked
exports.updateLivrableStatus = asyncHandler(async (req, res) => {
  const { livrableId } = req.params;
  const { status } = req.body; // 🟢 Validated / 🟠 Needs improvement / 🔴 Rejected

  try {
    // Vérifier si le statut est valide
    const validStatuses = ["VALIDATED", "NEEDS_IMPROVEMENT", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Vérifier si le livrable existe
    const livrable = await prisma.livrable.findUnique({
      where: { id: parseInt(livrableId, 10) },
    });

    if (!livrable) {
      return res.status(404).json({ message: "Livrable not found" });
    }

    // Mettre à jour le statut du livrable
    const updatedLivrable = await prisma.livrable.update({
      where: { id: parseInt(livrableId, 10) },
      data: { status },
    });

    res.status(200).json({
      message: "Livrable status updated successfully",
      data: updatedLivrable,
    });
  } catch (error) {
    console.error("Error while updating livrable status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//linked
//get projet ta3 letudiant connecte

exports.getProjetEtudiant = async (req, res) => {
  try {
    console.log("getProjetEtudiant called");

    const { userId } = req.user;
    console.log("User ID:", userId);

    const etudiant = await prisma.etudiant.findUnique({
      where: { id: userId },
      include: {
        equipe: {
          include: {
            projet: {
              include: {
                Sujet: true,
                Encadrant: true,
                Equipe: {
                  include: {
                    etudiants: true,
                  },
                },
                livrables: true,
                rendezVous: true,
                remarques: true,
                tasks: true,
              },
            },
          },
        },
      },
    });

    console.log("Etudiant found:", etudiant);

    if (!etudiant) {
      return res.status(404).json({ message: "Étudiant introuvable" });
    }

    if (!etudiant.equipe) {
      return res.status(404).json({ message: "Étudiant sans équipe assignée" });
    }

    // equipe found, but project may be null
    if (!etudiant.equipe.projet) {
      return res.status(200).json({
        status: "success",
        message: "Équipe sans projet assigné",
        data: {
          etudiant: {
            id: etudiant.id,
            nom: etudiant.nom,
            prenom: etudiant.prenom,
            email: etudiant.email,
          },
          equipe: {
            id: etudiant.equipe.id,
            niveau: etudiant.equipe.niveau,
            specialite: etudiant.equipe.specialite,
            skillsRequired: etudiant.equipe.skillsRequired,
            status: etudiant.equipe.status,
            minMembers: etudiant.equipe.minMembers,
            maxMembers: etudiant.equipe.maxMembers,
            // no project data here
          },
          projet: null,
        },
      });
    }

    // Return full project data with team and student info
    return res.status(200).json({
      status: "success",
      data: {
        etudiant: {
          id: etudiant.id,
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          email: etudiant.email,
        },
        equipe: etudiant.equipe,
        projet: etudiant.equipe.projet,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du projet de l'étudiant:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};


