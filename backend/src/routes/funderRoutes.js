const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getEligibleEntrepreneurs,
  createMatch,
  updateMatchStatus,
  getMatches,
  getEntrepreneurDetails
  // Remove new imports for now
} = require('../controllers/funderController');

router.use(authenticateToken);
router.use(authorizeRole('funder'));

// Existing routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/eligible-entrepreneurs', getEligibleEntrepreneurs);
router.post('/matches', createMatch);
router.get('/matches', getMatches);
router.put('/matches/:matchId', updateMatchStatus);
router.get('/entrepreneurs/:entrepreneurId', getEntrepreneurDetails);

// COMMENT OUT new routes
// router.get('/dashboard', getFunderDashboard);
// router.get('/likes-received', getLikesReceived);
// router.post('/like-entrepreneur', likeEntrepreneur);
// router.get('/matches/all', getAllMatches);
// router.get('/matches/:matchId', getMatchDetails);
// router.put('/investment-criteria', updateInvestmentCriteria);
// router.get('/stats', getFunderStats);

module.exports = router;