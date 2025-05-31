const { PrismaClient, InvitationStatus } = require("@prisma/client");
const prisma = new PrismaClient();

/*________________________________________DONE______________________________________________________*/
//// DONE
exports.sendInvitations = async (req, res) => {
  const senderId = req.user.userId; // Get the sender's ID from the token
  const { equipeId } = req.body;

  try {
    // Fetch the team and its current members
    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
      include: { etudiants: true },
    });

    if (!equipe) {
      return res.status(404).json({ message: "Team not found." });
    }
    if (equipe.status === "COMPLET") {
      return res.status(400).json({
        message: "Cannot send invitations. The team is already full.",
      });
    }

    let invitationsSent = 0;
    let alreadySentCount = 0;

    for (const member of equipe.etudiants) {
      if (member.id !== senderId) {
        const existingInvitation = await prisma.invitation.findFirst({
          where: {
            senderId,
            receiverId: member.id,
            equipeId,
          },
        });

        if (existingInvitation) {
          alreadySentCount++;
          continue;
        }

        try {
          await prisma.invitation.create({
            data: {
              senderId,
              receiverId: member.id,
              equipeId,
              status: InvitationStatus.PENDING,
            },
          });
          invitationsSent++;
        } catch (createError) {
          console.error(
            `Error creating invitation for student ${member.id}:`,
            createError
          );
        }
      }
    }

    if (invitationsSent === 0) {
      if (alreadySentCount > 0) {
        return res.status(400).json({
          message: " invitation have already been sent to this team's members.",
        });
      } else {
        return res.status(500).json({
          message: "No invitations sent due to an unexpected error.",
        });
      }
    }

    return res.status(200).json({
      invitationsSent,
      alreadySent: alreadySentCount,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while sending invitations." });
  }
};

//// DONE

exports.acceptInvitation = async (req, res) => {
  const { invitationId } = req.body;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        equipe: {
          include: { etudiants: true },
        },
      },
    });
    if (invitation.equipe.status === "COMPLET") {
      return res.status(400).json({
        message: "Cannot accept invitation. The team is already full.",
      });
    }

    if (!invitation)
      return res.status(404).json({ message: "Invitation not found" });

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.ACCEPTED },
    });

    await prisma.etudiant.update({
      where: { id: invitation.senderId },
      data: {
        equipeId: invitation.equipeId,
      },
    });

    await prisma.invitation.deleteMany({
      where: {
        senderId: invitation.senderId,
        status: InvitationStatus.PENDING,
      },
    });

    const updatedEquipe = await prisma.equipe.findUnique({
      where: { id: invitation.equipeId },
      include: { etudiants: true },
    });

    if (updatedEquipe.etudiants.length === updatedEquipe.maxMembers) {
      await prisma.equipe.update({
        where: { id: updatedEquipe.id },
        data: {
          status: "COMPLET",
        },
      });
    }

    res
      .status(200)
      .json({ message: "Student added to team and invitation accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/// DONE
// Rejeter une invitation
exports.rejectInvitation = async (req, res) => {
  const { invitationId } = req.body;
  const chefId = req.user.userId;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation)
      return res.status(404).json({ message: "Invitation not found" });

    // Mark the current invitation as rejected
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REJECTED },
    });

    // Delete all other invitations sent by the same sender to the same team
    await prisma.invitation.deleteMany({
      where: {
        senderId: invitation.senderId,
        equipeId: invitation.equipeId,
        id: { not: invitationId }, // don't delete the one we just updated
      },
    });

    res
      .status(200)
      .json({ message: "Invitation rejected and related invitations deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
/// DONE
exports.getMyNotifications = async (req, res) => {
  const studentId = req.user.userId;

  try {
    // 1. Invitations received
    const receivedInvitations = await prisma.invitation.findMany({
      where: {
        receiverId: studentId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            skills: true,
            profileImageUrl: true,
          },
        },
        equipe: true,
      },
    });

    // 2. Sent invitations
    const sentStatusUpdates = await prisma.invitation.findMany({
      where: {
        senderId: studentId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: { id: true, nom: true, prenom: true, profileImageUrl: true },
        },
        equipe: true,
      },
    });

    res.status(200).json({
      receivedInvitations,
      sentStatusUpdates,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error while fetching notifications." });
  }
};
