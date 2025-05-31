// middleware/checkNotInTeam.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkNotInTeam = async (req, res, next) => {
  const userId = req.user.userId;

  const student = await prisma.etudiant.findUnique({
    where: { id: userId },
    select: { equipeId: true },
  });

  if (student.equipeId) {
    return res.status(403).json({ message: "You are already in a team." });
  }

  next();
};

module.exports = checkNotInTeam;
