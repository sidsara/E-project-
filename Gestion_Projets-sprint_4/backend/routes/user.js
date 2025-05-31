const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/userController");
const { upload } = require("../middleware/multer");
const authenticateToken = require("../middleware/protect");
router.put("/updateProfile", authenticateToken, upload.single("profileImage"), updateProfile);
module.exports = router; 
