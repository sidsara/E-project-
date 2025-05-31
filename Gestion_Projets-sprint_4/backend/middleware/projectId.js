const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getProjectId = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    let project;

    if (role === "etudiant") {
      project = await prisma.projet.findFirst({
        where: {
          Equipe: {
            etudiants: {
              some: {
                id: userId,
              },
            },
          },
        },
      });
    }

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found for this user" });
    }

    req.projectId = project.id;
    next();
  } catch (error) {
    console.error("Error fetching project ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getProjectId;
