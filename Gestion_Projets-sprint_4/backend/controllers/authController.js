const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: __dirname + "/.env" });
const { JWT_SECRET, JWT_COOKIE_EXPIRES_IN } = process.env;
const prisma = new PrismaClient();
const multer = require("multer");
const fs = require("fs-extra");
const excelToJson = require("convert-excel-to-json");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../outilles/email");

const upload = multer({ dest: "uploads/" });

//console.log(bcrypt.hashSync("admin", 10));

//LISTE DES ETUDIANTS          : DONE

//RESET PASSWORD (et connexion directement)               : NOT MY WORK
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Variables pour stocker l'utilisateur et son rôle
    let user = null;
    let table = null;

    // Chercher l'utilisateur dans toutes les tables
    const [admin, entreprise, enseignant, etudiant] = await Promise.all([
      prisma.admin.findUnique({ where: { id: decoded.userId } }),
      prisma.entreprise.findUnique({ where: { id: decoded.userId } }),
      prisma.enseignant.findUnique({ where: { id: decoded.userId } }),
      prisma.etudiant.findUnique({ where: { id: decoded.userId } }),
    ]);

    // Déterminer la table correcte
    if (admin) {
      table = prisma.admin;
      role = "admin";
      user = admin;
    } else if (entreprise) {
      table = prisma.entreprise;
      role = "entreprise";
      user = entreprise;
    } else if (enseignant) {
      table = prisma.enseignant;
      role = "enseignant";
      user = enseignant;
    } else if (etudiant) {
      table = prisma.etudiant;
      role = "etudiant";
      user = etudiant;
    }

    if (!user || !table) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Mettre à jour le mot de passe
    const updatedUser = await table.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });
    console.log("Updated user:", updatedUser);
    if (!updatedUser) {
      throw new Error("Échec de la mise à jour du mot de passe");
    }

    console.log("Mot de passe mis à jour pour l'utilisateur:", updatedUser.id);

    // Préparer la connexion
    req.body = {
      email: updatedUser.email,
      password, // password non hashé pour le login
    };

    // Connexion automatique
    return exports.login(req, res);
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
    return res.status(500).json({
      error: "Erreur lors de la réinitialisation du mot de passe",
      details: error.message,
    });
  }
};


/*________________________________________DONE______________________________________________________*/

//LISTE DES ETUDIANTS          : DONE 
exports.listeEtudiants = async (req, res) => {
  try {
    if (req.file?.filename == null || req.file?.filename == "undefind") {
      res.status(400).json({ error: "no file found" });
    } else {
      var filePath = "uploads/" + req.file.filename;
      const excelData = excelToJson({
        sourceFile: filePath,
        header: {
          rows: 0,
        },
        columnToKey: {
          A: "nom",
          B: "prenom",
          C: "email",
          D: "password",
          E: "equipeId",
          F: "chefEquipe",
          G: "niveau",
          H: "specialite",
        },
      });
      const feuille = Object.keys(excelData)[0];
      const etudiants = excelData[feuille] || [];

      if (Array.isArray(etudiants)) {
        let addedCount = 0;
        let existingCount = 0;

        for (const etudiant of etudiants) {
          try {
            // Vérifier si l'étudiant existe déjà
            const existingStudent = await prisma.etudiant.findUnique({
              where: { email: etudiant.email },
            });

            if (!existingStudent) {
              // Créer l'étudiant seulement s'il n'existe pas
              await prisma.etudiant.create({
                data: {
                  nom: etudiant.nom,
                  prenom: etudiant.prenom,
                  email: etudiant.email,
                  password: bcrypt.hashSync(etudiant.password, 10),
                  equipeId: etudiant.equipeId
                    ? parseInt(etudiant.equipeId)
                    : null,
                  chefEquipe: etudiant.chefEquipe === "false",
                  niveau: etudiant.niveau.toString(),
                  specialite: etudiant.specialite || null,
                },
              });
              addedCount++;
            } else {
              existingCount++;
            }
          } catch (error) {
            console.error(
              `Erreur lors du traitement de l'étudiant ${etudiant.email}:`,
              error
            );
          }
        }

        res.status(200).json({
          message: `Traitement terminé: ${addedCount} nouveaux étudiants ajoutés, ${existingCount} étudiants déjà existants.`,
        });
      } else {
        throw new Error("Le format des données Excel n'est pas valide");
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (req.file?.filename) {
      fs.remove(filePath);
    }
  }
};
//LISTE DES ENSEIGNANTS        : DONE
exports.listeEnseignants = async (req, res) => {
  try {
    if (req.file?.filename == null || req.file?.filename == "undefind") {
      res.status(400).json({ error: "no file found" });
    } else {
      var filePath = "uploads/" + req.file.filename;
      const excelData = excelToJson({
        sourceFile: filePath,
        header: {
          rows: 0,
        },
        columnToKey: {
          A: "nom",
          B: "prenom",
          C: "email",
          D: "password",
        },
      });
      const Feuille = Object.keys(excelData)[0];
      const enseignants = excelData[Feuille] || [];

      if (Array.isArray(enseignants)) {
        let addedCount = 0;
        let existingCount = 0;

        for (const enseignant of enseignants) {
          try {
            // Vérifier si l'enseignant existe déjà
            const existingTeacher = await prisma.enseignant.findUnique({
              where: { email: enseignant.email },
            });

            if (!existingTeacher) {
              // Créer l'enseignant seulement s'il n'existe pas
              await prisma.enseignant.create({
                data: {
                  nom: enseignant.nom,
                  prenom: enseignant.prenom,
                  email: enseignant.email,
                  password: bcrypt.hashSync(enseignant.password, 10),
                },
              });
              addedCount++;
            } else {
              existingCount++;
            }
          } catch (error) {
            console.error(
              `Erreur lors du traitement de l'enseignant ${enseignant.email}:`,
              error
            );
          }
        }

        res.status(200).json({
          message: `Traitement terminé: ${addedCount} nouveaux enseignants ajoutés, ${existingCount} enseignants déjà existants.`,
        });
      } else {
        throw new Error("Le format des données Excel n'est pas valide");
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (req.file?.filename) {
      fs.remove(filePath);
    }
  }
};

//CONNEXION                    : DONE
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch all roles in parallel (including nested data for etudiant)
    const [admin, entreprise, enseignant, etudiant] = await Promise.all([
      prisma.admin.findUnique({ where: { email } }),
      prisma.entreprise.findUnique({ where: { email } }),
      prisma.enseignant.findUnique({ where: { email } }),
      prisma.etudiant.findUnique({
        where: { email },
        include: {
          equipe: {
            include: {
              projet: true, // Include the associated project with the team
            },
          },
        },
      }),
    ]);

    let user = null;
    let role = "";
    let redirectionMessage = "";
    let userInfo = {};

    if (admin) {
      user = admin;
      role = "admin";
      redirectionMessage = "Redirection vers la page admin";
      userInfo = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      };
    } else if (entreprise) {
      user = entreprise;
      role = "entreprise";
      redirectionMessage = "Redirection vers la page entreprise";
      userInfo = {
        id: user.id,
        nom: user.nom,
        email: user.email,
      };
    } else if (enseignant) {
      user = enseignant;
      role = "enseignant";
      redirectionMessage = "Redirection vers la page enseignant";
      userInfo = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      };
    } else if (etudiant) {
      user = etudiant;
      role = "etudiant";
      redirectionMessage = "Redirection vers la page etudiant";
      userInfo = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        niveau: user.niveau,
        specialite: user.specialite,
        equipeId: user.equipeId,
        equipe: user.equipe, // Includes the projet now
        chefEquipe: user.chefEquipe,
        skills: user.skills,
        profileImageUrl: user.profileImageUrl,
      };
    }

    if (!user) {
      return res.status(404).json({ error: "Email incorrect" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { userId: user.id, role, equipeId: user.equipeId },
      JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 60 * 1000),
      sameSite: "strict",
    };

    res.cookie("jwt", token, cookieOptions);

    return res.status(200).json({
      message: redirectionMessage,
      user: {
        ...userInfo,
        role,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

//DECONNEXION                  : DONE
exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({ message: "Déconnexion réussie" });
};

//CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    // Chercher l'utilisateur dans toutes les tables
    const [admin, entreprise, enseignant, etudiant] = await Promise.all([
      prisma.admin.findFirst({ where: { id: userId } }),
      prisma.entreprise.findFirst({ where: { id: userId } }),
      prisma.enseignant.findFirst({ where: { id: userId } }),
      prisma.etudiant.findFirst({ where: { id: userId } }),
    ]);

    // Déterminer la table correcte et l'utilisateur
    let user = null;
    let table = null;

    if (admin) {
      user = admin;
      table = prisma.admin;
    } else if (entreprise) {
      user = entreprise;
      table = prisma.entreprise;
    } else if (enseignant) {
      user = enseignant;
      table = prisma.enseignant;
    } else if (etudiant) {
      user = etudiant;
      table = prisma.etudiant;
    }

    if (!user || !table) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Vérifier l'ancien mot de passe
    const oldIsCorrect = bcrypt.compare(oldPassword, user.password);
    if (!oldIsCorrect) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Mettre à jour le mot de passe
    await table.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    return res.status(500).json({ error: error.message });
  }
};

//MOT DE PASSE OUBLIE           : DONE
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Chercher l'utilisateur dans toutes les tables
    const [admin, entreprise, enseignant, etudiant] = await Promise.all([
      prisma.admin.findFirst({ where: { email } }),
      prisma.entreprise.findFirst({ where: { email } }),
      prisma.enseignant.findFirst({ where: { email } }),
      prisma.etudiant.findFirst({ where: { email } }),
    ]);

    // Déterminer la table correcte et l'utilisateur
    let user = null;
    if (admin) {
      user = admin;
    } else if (entreprise) {
      user = entreprise;
    } else if (enseignant) {
      user = enseignant;
    } else if (etudiant) {
      user = etudiant;
    }

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "10m",
    });

    // Générer l'URL de réinitialisation
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    console.log(resetUrl);

    // Envoyer l'email
    await sendEmail({
      email: user.email,
      subject: "Forgot your password ?",
      message: `Follow this link to reset your password: ${resetUrl} (valid for 10 minutes only)`,
    });

    return res.status(200).json({ message: "Email envoyé" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.status(500).json({ error: error.message });
  }
};


//generer mot de passe aleatoire        : DONE
exports.generateRandomPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
};

//envoie et creation des donnees de l'entreprise pour sa cnx
exports.createEntreprise = async (req, res) => {
  try {
    const { nom, email } = req.body;

    // Check if fields are empty
    if (!nom || !email) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    // Check if email already exists
    const existingEntreprise = await prisma.entreprise.findUnique({
      where: { email },
    });

    if (existingEntreprise) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists." });
    }

    // Generate a random password
    const generatedPassword = exports.generateRandomPassword();

    // Create the company
    const entreprise = await prisma.entreprise.create({
      data: {
        nom, // Keep "nom" instead of "name"
        email,
        password: bcrypt.hashSync(generatedPassword, 10),
      },
    });

    // Send welcome email
    try {
      await sendEmail({
        email: email,
        subject: "Welcome to E-project Platform",
        message: `The Higher School of Computer Science of Sidi Bel Abbes welcomes you to the E-project platform.

You can submit final year project topics using the following credentials:

📧 Email: ${email}  
🔑 Password: ${generatedPassword}

⚠️ Please log in and change your password as soon as possible.

Best regards,  
The E-project team`,
      });
    } catch (emailError) {
      console.error("Detailed error while sending welcome email:", emailError);

      // Delete the company if email sending fails
      try {
        await prisma.entreprise.delete({
          where: { id: entreprise.id },
        });
        console.log(
          `Cleaned up company record with ID ${entreprise.id} after email failure`
        );
      } catch (deleteError) {
        console.error("Failed to clean up company record:", deleteError);
      }

      // Return specific error messages based on the error type
      if (emailError.code === "EAUTH") {
        return res.status(500).json({
          error:
            "Email service authentication failed. Please check the email service credentials.",
        });
      } else if (emailError.code === "ESOCKET") {
        return res.status(500).json({
          error:
            "Email server connection error. Please check the server configuration.",
        });
      } else if (emailError.code === "EENVELOPE") {
        return res.status(500).json({
          error: "Invalid email address format provided.",
        });
      } else if (emailError.code === "ETIMEDOUT") {
        return res.status(500).json({
          error: "Email server connection timed out. Please try again.",
        });
      } else {
        return res.status(500).json({
          error: "Failed to send welcome email. Please try again later.",
          details: emailError.message,
        });
      }
    }

    return res
      .status(200)
      .json({ message: "Company successfully created, and email sent." });
  } catch (error) {
    console.error("Error while creating company:", error);
    return res.status(500).json({
      error: "An internal error occurred. Please try again later.",
    });
  }
};

// Endpoint to get the count of students.  : DONE
exports.getStudentCount = async (req, res) => {
  try {
    const count = await prisma.etudiant.count();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching student count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Endpoint to get the count of teachers    : DONE
exports.getTeacherCount = async (req, res) => {
  try {
    const count = await prisma.enseignant.count();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching teacher count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Endpoint to get the count of companies   :DONE
exports.getCompanyCount = async (req, res) => {
  try {
    const count = await prisma.entreprise.count();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching company count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
