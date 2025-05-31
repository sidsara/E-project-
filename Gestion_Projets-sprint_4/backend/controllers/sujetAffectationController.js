const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
//linked
// Obtenir les sujets disponibles en filtrant par niveau et éventuellement spécialité
exports.getSujetsDisponibles = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get authenticated student's information
    const student = await prisma.etudiant.findUnique({
      where: { id: userId },
      select: {
        niveau: true,
        specialite: true
      }
    });

    if (!student) {
      return res.status(404).json({
        status: "error",
        message: "Étudiant non trouvé"
      });
    }

    const search = req.query.search?.toString()?.trim() || null;
    
    // Build the where clause with student's niveau and specialite
    let whereClause = {
      status: "accepted",
   
    };
 if (student.niveau === '2' || student.niveau === '3') {
      whereClause.niveau = parseInt(student.niveau);
    } else {
      // Otherwise filter by niveau and specialite
      whereClause.niveau = parseInt(student.niveau);
     whereClause.specialite=student.specialite?.toUpperCase();
      }
    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2));

    const sujets = await prisma.sujet.findMany({
      where: whereClause,
      include: {
        Entreprise: {
          select: {
            nom: true,
          },
        },
        Enseignant: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      count: sujets.length,
      studentInfo: {
        niveau: student.niveau,
        specialite: student.specialite
      },
      data: sujets
    });

  } catch (error) {
    console.error("Error fetching subjects:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      status: "error",
      message: "Erreur lors de la récupération des sujets",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});