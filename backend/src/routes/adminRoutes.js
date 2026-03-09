const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  getEntrepreneurs,
  getMentors,
  getFunders,
  verifyEntrepreneur,
  getStats
} = require('../controllers/adminController');

router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/entrepreneurs', getEntrepreneurs);
router.get('/mentors', getMentors);
router.get('/funders', getFunders);
router.put('/entrepreneurs/:entrepreneurId/verify', verifyEntrepreneur);
router.get('/stats', getStats);

module.exports = router;
