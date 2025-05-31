const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
//linked
exports.updateProfile = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    
    // Safely parse skills from request body
    let skills = [];
    try {
      skills = Array.isArray(req.body.skills) 
        ? req.body.skills 
        : JSON.parse(req.body.skills || "[]");
    } catch (e) {
      console.error("Error parsing skills:", e);
      skills = [];
    }

    // Prepare update data
    const updateData = {
      skills: skills // This should now be a proper array
    };

    // Add profile image if provided
    if (req.file) {
      updateData.profileImageUrl = `/uploads-img/${req.file.filename}`;
    }

    // Update the student
    const updated = await prisma.etudiant.update({
      where: { id: userId },
      data: updateData
    });

    res.json({ 
      success: true,
      message: "Profile updated successfully", 
      user: updated 
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ 
      success: false,
      error: "Profile update failed",
      details: err.message 
    });
  }
};