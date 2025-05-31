const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/protect");
const invitationController = require('../controllers/invitationControllers');
const checkNotInTeam = require('../middleware/checkNotInTeam');



const isLeader = require("../middleware/LeaderMiddelware");
router.post('/send',authenticateToken,checkNotInTeam, invitationController.sendInvitations);
router.post("/accept/:equipeId",  authenticateToken,isLeader, invitationController.acceptInvitation);
router.post("/reject/:equipeId", authenticateToken, isLeader, invitationController.rejectInvitation);
router.get ('/notifications', authenticateToken,invitationController.getMyNotifications)

module.exports = router;
