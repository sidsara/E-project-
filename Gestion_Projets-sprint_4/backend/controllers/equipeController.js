const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();





// Create team by admin
exports.createTeamByAdmin = async (req, res) => {
  try {
    const { memberIds, leaderId, niveau, specialite, minMembers: customMin, maxMembers: customMax } = req.body;

    // Validation
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: "Members list is required" });
    }

    if (!leaderId || !memberIds.includes(leaderId)) {
      return res.status(400).json({
        error: "Team leader must be included in the members list",
      });
    }

    const students = await prisma.etudiant.findMany({
      where: {
        id: { in: memberIds },
      },
    });

    if (students.length !== memberIds.length) {
      return res.status(400).json({ error: "Some students were not found" });
    }

    const studentsWithTeam = students.filter((s) => s.equipeId !== null);
    if (studentsWithTeam.length > 0) {
      return res.status(400).json({
        error: "Some students already belong to a team",
        students: studentsWithTeam.map((s) => ({
          id: s.id,
          email: s.email,
        })),
      });
    }

    // Chercher la configuration d'équipe pour ce niveau
    // Si une configuration personnalisée est fournie, l'utiliser
    let minMembers = customMin;
let maxMembers = customMax;

if (!minMembers || !maxMembers) {
  // Look for an existing team with the same niveau AND specialite
  const configSourceTeam = await prisma.equipe.findFirst({
    where: {
      niveau,
      specialite,
    },
    orderBy: { id: 'asc' },
    select: {
      minMembers: true,
      maxMembers: true,
    },
  });

  if (configSourceTeam) {
    minMembers = configSourceTeam.minMembers;
    maxMembers = configSourceTeam.maxMembers;
  } else {
    // No existing team config found, use default based on niveau
    if (String(niveau) === '5') {
      minMembers = 1;
      maxMembers = 2;
    } else {
      minMembers = 5;
      maxMembers = 7;
    }
  }
}



    if (memberIds.length < minMembers || memberIds.length > maxMembers) {
      return res.status(400).json({
        error: `Team size must be between ${minMembers} and ${maxMembers} members for this level`,
      });
    }

    const newTeam = await prisma.equipe.create({
      data: {
        niveau,
        specialite,
        status: memberIds.length >= minMembers ? "COMPLET" : "INCOMPLET",
        minMembers,
        maxMembers,
        etudiants: {
          connect: memberIds.map((id) => ({ id })),
        },
      },
    });

    // chef d'equipe
    await prisma.etudiant.update({
      where: { id: leaderId },
      data: { chefEquipe: true },
    });

    const teamWithMembers = await prisma.equipe.findUnique({
      where: { id: newTeam.id },
      include: {
        etudiants: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            chefEquipe: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: teamWithMembers,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/// DONE
exports.transferLeadership = async (req, res) => {
  try {
    const { userId } = req.user;
    const { newLeaderEmail } = req.body;

    // Vérifier si l'utilisateur actuel est bien le chef d'équipe
    const currentLeader = await prisma.etudiant.findUnique({
      where: { id: userId },
      include: { equipe: true },
    });

    if (!currentLeader || !currentLeader.chefEquipe) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas le chef d'équipe." });
    }

    // Rechercher le nouveau chef par email
    const newLeader = await prisma.etudiant.findUnique({
      where: { email: newLeaderEmail },
      include: { equipe: true },
    });

    if (!newLeader) {
      return res.status(404).json({
        message: "L'utilisateur spécifié n'existe pas.",
      });
    }

    if (!newLeader.equipeId || newLeader.equipeId !== currentLeader.equipeId) {
      return res.status(400).json({
        message: "Le nouveau chef doit être membre de la même équipe.",
      });
    }

    // Effectuer le transfert de leadership
    await prisma.$transaction([
      prisma.etudiant.update({
        where: { id: userId },
        data: { chefEquipe: false },
      }),
      prisma.etudiant.update({
        where: { id: newLeader.id },
        data: { chefEquipe: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Le rôle de chef d'équipe a été transféré avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors du transfert du rôle de chef d'équipe:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};


exports.getTeamsForAdmin = async (req, res) => {
  try {
    const teams = await prisma.equipe.findMany({
      include: {
        etudiants: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            chefEquipe: true,
            skills: true,
            niveau: true,
            specialite: true,
          },
        },
        projet: {
          select: {
            id: true,
            dateDebut: true,
            dateFin: true,
            Sujet: {
              select: {
                titre: true,
                description: true,
                status: true,
              },
            },
            encadrantId: true,
            sujetId: true,
          },
        },
      },
      orderBy: [{ niveau: "asc" }, { specialite: "asc" }, { status: "asc" }],
    });

    const formattedTeams = teams.map((team) => ({
      id: team.id,
      niveau: team.niveau,
      specialite: team.specialite,
      status: team.status,
      skillsRequired: team.skillsRequired,
      minMembers: team.minMembers,
      maxMembers: team.maxMembers,
      nombreMembres: team.etudiants.length,
      chefEquipe:
        team.etudiants.find((etudiant) => etudiant.chefEquipe) || null,
      membres: team.etudiants.filter((etudiant) => !etudiant.chefEquipe),
      projet: team.projet
        ? {
            ...team.projet,
            statut: team.projet.statut,
            sujet: team.projet.Sujet,
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      totalTeams: teams.length,
      teamsIncomplete: teams.filter((t) => t.status === "INCOMPLET").length,
      teamsComplete: teams.filter((t) => t.status === "COMPLET").length,
      teams: formattedTeams,
    });
  } catch (error) {
    console.error("Error fetching teams for admin:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};



/*________________________________________DONE______________________________________________________*/
/////// DONE 
exports.createEquipe = async (req, res) => {
  try {
    const { userId } = req.user;

    const { skillsRequired } = req.body;
    const student = await prisma.etudiant.findUnique({
      where: { id: userId },
      select: {
        id: true,
        equipeId: true,
        niveau: true,
        specialite: true,
      },
    });

    if (student.equipeId !== null) {
      return res
        .status(400)
        .json({ error: "You are already a member of a team" });
    }
    //sidSara : ajout verification du nombre d'equipes maximal
    // calcul max teams bach nchoufou si on peux creer
    const studentNiveau = student.niveau;
    const currentTeamsCount = await prisma.equipe.count({
      where: { niveau: studentNiveau },
    });

    const equipeConfig = await prisma.equipe.findFirst({
      where: { niveau: student.niveau },
      select: { minMembers: true },
    });

    // seulement si l'equipeConfig existe, on va calculer le max teams prc sinon ca veut dire que c'est la 1ere equipe donc on peut la creer
    if (equipeConfig) {
      const nbrEtudiants = await prisma.etudiant.count({
        where: { niveau: student.niveau },
      });
      const maximumTeams = Math.floor(nbrEtudiants / equipeConfig.minMembers);

      if (currentTeamsCount >= maximumTeams) {
        return res.status(400).json({
          error: "Maximum number of teams reached for this level",
          currentTeams: currentTeamsCount,
          maxTeams: maximumTeams,
        });
      }
    }

    const validatedSkills = Array.isArray(skillsRequired)
      ? skillsRequired.filter((skill) => typeof skill === "string")
      : [];

    const newTeam = await prisma.equipe.create({
      data: {
        niveau: student.niveau,
        specialite: student.specialite,
        skillsRequired: validatedSkills,
        etudiants: {
          connect: {
            id: userId,
          },
        },
        status: "INCOMPLET",
        // Si c'est la première équipe, utiliser les valeurs par défaut
        minMembers: equipeConfig?.minMembers ?? 2,
        maxMembers: equipeConfig?.maxMembers ?? 4,
      },
      include: {
        etudiants: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            chefEquipe: true,
          },
        },
      },
    });

    await prisma.etudiant.update({
      where: { id: userId },
      data: {
        chefEquipe: true,
        equipeId: newTeam.id,
      },
    });

    const updatedTeam = await prisma.equipe.findUnique({
      where: { id: newTeam.id },
      select: {
        id: true, // 👈 This is the key! (it's the "equipeId")
        niveau: true,
        specialite: true,
        status: true,
        skillsRequired: true,
        minMembers: true,
        maxMembers: true,
        etudiants: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            chefEquipe: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully with you as team leader",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

///// DONE
//Update Equipe (status and skills )
exports.updateEquipe = async (req, res) => {
  try {
    const { status, skillsRequired } = req.body;
    const { equipeId } = req.params;

    // Find team and count members
    const equipe = await prisma.equipe.findUnique({
      where: { id: parseInt(equipeId) },
      include: {
        _count: {
          select: { etudiants: true },
        },
        etudiants: true,
      },
    });

    if (!equipe) {
      return res.status(404).json({ error: "Team not found" });
    }

    const validatedSkills = Array.isArray(skillsRequired)
      ? skillsRequired.filter((skill) => typeof skill === "string")
      : equipe.skillsRequired;

    // Determiner status based on team size
    let finalStatus = status;
    const memberCount = equipe._count.etudiants;
    let msg = null;

    if (memberCount < equipe.minMembers) {
      finalStatus = "INCOMPLET";
      if (status == "COMPLET") {
        msg = "Cannot set status to COMPLET: Insufficient team members";
      }
    } else if (memberCount >= equipe.maxMembers) {
      finalStatus = "COMPLET";
      if (status == "INCOMPLET") {
        msg =
          "Cannot set status to INCOMPLET: Number of team members has attempted to exceed the maximum limit";
      }
    }

    // Update
    const updatedTeam = await prisma.equipe.update({
      where: { id: parseInt(equipeId) },
      data: {
        status: finalStatus,
        skillsRequired: validatedSkills,
      },
      include: {
        etudiants: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            chefEquipe: true,
          },
        },
      },
    });

    const response = {
      message: "Team updated successfully",
      team: updatedTeam,
      status: finalStatus,
      memberCount: memberCount,
    };

    if (msg) {
      response.warning = msg;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



//// DONE
exports.deleteEquipe = async (req, res) => {
  try {
    const { userId } = req.user;
    const { equipeId } = req.params;

    // Vérifier si l'équipe existe
    const equipe = await prisma.equipe.findUnique({
      where: { id: parseInt(equipeId) },
      include: {
        etudiants: true,
      },
    });

    if (!equipe) {
      return res.status(404).json({ error: "Équipe non trouvée" });
    }

    // Vérifier si l'utilisateur est le chef d'équipe
    const isTeamLeader = equipe.etudiants.some(
      (etudiant) => etudiant.id === userId && etudiant.chefEquipe
    );

    if (!isTeamLeader) {
      return res
        .status(403)
        .json({ error: "Seul le chef d'équipe peut supprimer l'équipe" });
    }

    // Supprimer toutes les invitations liées à l'équipe
    // await prisma.invitation.deleteMany({
    //   where: { equipeId: parseInt(equipeId) },
    // });

    // Mettre à jour les étudiants pour qu'ils ne soient plus liés à l'équipe
    // await prisma.etudiant.updateMany({
    //   where: { equipeId: parseInt(equipeId) },
    //   data: {
    //     equipeId: null,
    //     chefEquipe: false,
    //   },
    // });

    
    // Supprimer l'équipe
    await prisma.equipe.delete({
      where: { id: parseInt(equipeId) },
    });

    return res.status(200).json({
      success: true,
      message: "L'équipe a été supprimée avec succès",
      deletedTeamId: parseInt(equipeId)
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'équipe:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de l'équipe",
      details: error.message,
    });
  }
};

///// DONE
exports.leaveTeam = async (req, res) => {
  const etudiantId = req.user.userId;
  const { newChefId } = req.body;

  try {
    const student = await prisma.etudiant.findUnique({
      where: { id: etudiantId },
      include: { equipe: { include: { etudiants: true } } }, // <-- هنا التعديل
    });

    if (!student?.equipeId) {
      return res
        .status(400)
        .json({ message: "Student does not belong to any team." });
    }

    const team = student.equipe;

    if (student.chefEquipe) {
      if (team.etudiants.length > 1) {
        if (!newChefId) {
          return res.status(400).json({
            message: "You must assign a new leader before leaving the team.",
          });
        }

        const newLeader = team.etudiants.find((e) => e.id === newChefId);
        if (!newLeader) {
          return res.status(404).json({
            message: "The new leader must be a member of the same team.",
          });
        }

        await prisma.etudiant.update({
          where: { id: newChefId },
          data: { chefEquipe: true },
        });
      }
    }

    await prisma.etudiant.update({
      where: { id: etudiantId },
      data: {
        equipeId: null,
        chefEquipe: false,
      },
    });

    const updatedTeam = await prisma.equipe.findUnique({
      where: { id: team.id },
      include: { etudiants: true },
    });

    if (updatedTeam.etudiants.length === 0) {
      await prisma.equipe.delete({ where: { id: team.id } });
    }

    res.status(200).json({ success: true, message: "Student successfully left the team." });
  } catch (err) {
    console.error(err);
    res.status(500).json({success: false, message: "Server error." });
  }
};
//linked
exports.getTeams = async (req, res) => {
  try {
    const { niveau, specialite } = req.query;

    let whereClause = {};
    if (niveau) whereClause.niveau = niveau;
    if (specialite) whereClause.specialite = specialite;

    const teams = await prisma.equipe.findMany({
      where: whereClause,
      include: {
        etudiants: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            chefEquipe: true,
            skills: true,
            profileImageUrl: true,
          },
        },
        projet: {
          select: {
            id: true,
            sujetId: true,
            encadrantId: true,
            dateDebut: true,
            dateFin: true,
            Sujet: {
              select: {
                titre: true,
                description: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      teams: teams.map((team) => ({
        id: team.id,
        niveau: team.niveau,
        specialite: team.specialite,
        status: team.status,
        skillsRequired: team.skillsRequired,
        minMembers: team.minMembers,
        maxMembers: team.maxMembers,
        membres: team.etudiants.filter((etudiant) => !etudiant.chefEquipe),
        chefEquipe:
          team.etudiants.find((etudiant) => etudiant.chefEquipe) || null,
        projet: team.projet,
      })),
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




/// DONE
//set min max members by admin          
exports.minMaxMembers = async (req, res) => {
  try {
    const { minMembers, maxMembers, niveau } = req.body;

    if (!minMembers || !maxMembers || !niveau) {
      return res.status(400).json({
        error: "minMembers, maxMembers and niveau are required",
      });
    }

    if (minMembers >= maxMembers) {
      return res.status(400).json({
        error: "minMembers must be less than maxMembers",
      });
    }

    if (minMembers < 1 || maxMembers < 2) {
      return res.status(400).json({
        error: "Invalid members count",
      });
    }

    await prisma.equipe.updateMany({
      where: { niveau: niveau },
      data: {
        minMembers: minMembers,
        maxMembers: maxMembers,
      },
    });

    return res.status(200).json({
      message: "Min and Max members updated successfully",
      level: niveau,
      minMembers: minMembers,
      maxMembers: maxMembers,
    });
  } catch (error) {
    console.error("Error updating min/max members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// gestion des etudiants sans equipe by admin

// Get students without team          :DONE
exports.getStudentsWithoutTeam = async (req, res) => {
  try {
    const students = await prisma.etudiant.findMany({
      where: {
        equipeId: null,
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        niveau: true,
        specialite: true,
        skills: true,
      },
    });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching students without team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Affect student to team by admin    : DONE
exports.affectStudentToTeam = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the incoming request body

    const { studentId, equipeId } = req.body;

    console.log('Parsed studentId:', studentId); // Log parsed studentId
    console.log('Parsed equipeId:', equipeId); // Log parsed equipeId

    // Validation des données
    if (!studentId || !equipeId) {
      return res.status(400).json({
        error: "Student ID and Team ID are required",
      });
    }

    const studentIdInt = Number(studentId);
    const equipeIdInt = Number(equipeId);

    if (isNaN(studentIdInt) || isNaN(equipeIdInt)) {
      return res.status(400).json({
        error: "Invalid ID format - IDs must be numbers",
      });
    }

    const student = await prisma.etudiant.findUnique({
      where: { id: studentIdInt },
      select: {
        id: true,
        equipeId: true,
        niveau: true,
        specialite: true,
        nom: true,
        prenom: true,
        email: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.equipeId) {
      return res.status(400).json({ error: "Student already has a team" });
    }

    // Vérifier si l'équipe existe et a le statut INCOMPLET
    const team = await prisma.equipe.findUnique({
      where: { id: equipeIdInt },
      include: {
        _count: { select: { etudiants: true } },
        etudiants: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.status !== "INCOMPLET") {
      return res
        .status(400)
        .json({ error: "Team is not accepting new members" });
    }

    if (team._count.etudiants >= team.maxMembers) {
      return res.status(400).json({ error: "Team is already full" });
    }

    if (
      team.niveau !== student.niveau ||
      team.specialite !== student.specialite
    ) {
      return res.status(400).json({
        error: "Student's level or speciality doesn't match with the team",
      });
    }

    // Affecter
    const updatedStudent = await prisma.etudiant.update({
      where: { id: studentIdInt },
      data: { equipeId: equipeIdInt },
    });

    // Vérifier si l'équipe doit passer en COMPLET
    const updatedTeam = await prisma.equipe.findUnique({
      where: { id: equipeIdInt },
      include: {
        _count: { select: { etudiants: true } },
        etudiants: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            chefEquipe: true,
          },
        },
      },
    });

    // Mettre à jour le statut si nécessaire
    if ((updatedTeam._count.etudiants = updatedTeam.maxMembers)) {
      await prisma.equipe.update({
        where: { id: equipeIdInt },
        data: { status: "COMPLET" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Student successfully affected to team",
      student: {
        id: student.id,
        nom: student.nom,
        prenom: student.prenom,
        email: student.email,
      },
      team: {
        id: updatedTeam.id,
        status: updatedTeam.status,
        currentMembers: updatedTeam._count.etudiants,
        membres: updatedTeam.etudiants,
      },
    });
  } catch (error) {
    console.error("Error affecting student to team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



/// DONE
exports.getEquipeById = async (req, res) => {
  try {
    // Récupération de l'ID de l'équipe à partir des paramètres de la requête
    const { equipeId } = req.params;

    // Validation de l'ID de l'équipe
    if (isNaN(parseInt(equipeId))) {
      return res.status(400).json({ message: "Invalid team ID" });
    }

    // Récupération des données de l'équipe avec Prisma
    const equipe = await prisma.equipe.findUnique({
      where: { id: parseInt(equipeId) },
      include: {
        etudiants: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            chefEquipe: true,
            skills: true,
            profileImageUrl: true,
          },
        },
        projet: {
          select: {
            id: true,
            sujetId: true,
            encadrantId: true,
            dateDebut: true,
            dateFin: true,
            Sujet: {
              select: {
                titre: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Si l'équipe n'existe pas
    if (!equipe) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Formatage des données de l'équipe pour une réponse claire
    const formattedTeam = {
      id: equipe.id,
      niveau: equipe.niveau,
      specialite: equipe.specialite,
      status: equipe.status,
      skillsRequired: equipe.skillsRequired,
      minMembers: equipe.minMembers,
      maxMembers: equipe.maxMembers,
      membres: equipe.etudiants.map((etudiant) => ({
        ...etudiant,
        role: etudiant.chefEquipe ? "Chef d'équipe" : "Membre", // Ajout du rôle à chaque membre
      })),
      projet: equipe.projet
        ? {
            id: equipe.projet.id,
            sujetId: equipe.projet.sujetId,
            encadrantId: equipe.projet.encadrantId,
            dateDebut: equipe.projet.dateDebut,
            dateFin: equipe.projet.dateFin,
            sujet: equipe.projet.Sujet
              ? {
                  titre: equipe.projet.Sujet.titre,
                  description: equipe.projet.Sujet.description,
                }
              : null,
          }
        : null,
    };

    // Envoi de la réponse avec les données formatées
    return res.status(200).json(formattedTeam);
  } catch (error) {
    // Gestion des erreurs
    console.error("Error fetching team:", error);
    return res.status(500).json({
      message: "Error fetching team data",
      error: error.message || "An unexpected error occurred",
    });
  }
};
