const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  getEntrepreneurs,
  createVisitLog,
  getEntrepreneurLogs,
  getEntrepreneurDetails,
  // NEW IMPORTS
  getMentorDashboard,
  getAllEntrepreneurs,
  getEntrepreneurFullProfile,
  getSessionHistory,
  updateSessionLog,
  getMentorProfile,
  updateMentorProfile
} = require('../controllers/mentorController');

router.use(authenticateToken);
router.use(authorizeRole('mentor'));

// Existing routes
router.get('/entrepreneurs', getEntrepreneurs);
router.post('/visits', createVisitLog);
router.get('/entrepreneurs/:entrepreneurId', getEntrepreneurDetails);
router.get('/entrepreneurs/:entrepreneurId/logs', getEntrepreneurLogs);

// NEW ROUTES
router.get('/dashboard', getMentorDashboard);
router.get('/entrepreneurs/all', getAllEntrepreneurs);
router.get('/entrepreneurs/:entrepreneurId/profile', getEntrepreneurFullProfile);
router.get('/sessions', getSessionHistory);
router.put('/sessions/:logId', updateSessionLog);
router.get('/profile', getMentorProfile);
router.put('/profile', updateMentorProfile);

module.exports = router;