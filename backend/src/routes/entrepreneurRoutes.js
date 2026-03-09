const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  getDashboard,
  updateProfile,
  submitCompliance,
  getGroomingProgress,
  updateGroomingProgress,
  submitStressTest,
  saveBusinessPlan,
  getBusinessPlan,
  getMentorLogs,
  getFunderMatches,
  // NEW IMPORTS
  uploadDocument,
  getDocumentStatus,
  getDocument,
  deleteDocument,
  getEligibleFunders,
  getLikedFunders,
  likeFunder,
  unlikeFunder,
  getMutualMatches,
  getGroomingModules,
  submitQuizAnswer,
  getQuizResults,
  completeModule,
  getCertificate
} = require('../controllers/entrepreneurController');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authenticateToken);
router.use(authorizeRole('entrepreneur'));

// Existing routes
router.get('/dashboard', getDashboard);
router.put('/profile', updateProfile);
router.post('/compliance', submitCompliance);
router.get('/grooming', getGroomingProgress);
router.put('/grooming', updateGroomingProgress);
router.post('/stress-test', submitStressTest);
router.post('/business-plan', saveBusinessPlan);
router.get('/business-plan', getBusinessPlan);
router.get('/mentor-logs', getMentorLogs);
router.get('/funder-matches', getFunderMatches);

// NEW DOCUMENT ROUTES
router.post('/documents/upload', upload.single('document'), uploadDocument);
router.get('/documents/status', getDocumentStatus);
router.get('/documents/:type', getDocument);
router.delete('/documents/:documentId', deleteDocument);

// NEW FUNDING/MATCHING ROUTES
router.get('/eligible-funders', getEligibleFunders);
router.get('/liked-funders', getLikedFunders);
router.post('/like-funder', likeFunder);
router.post('/unlike-funder', unlikeFunder);
router.get('/matches', getMutualMatches);

// NEW GROOMING MODULE ROUTES
router.get('/grooming/modules', getGroomingModules);
router.post('/grooming/quiz/:moduleId', submitQuizAnswer);
router.get('/grooming/quiz/:moduleId/results', getQuizResults);
router.post('/grooming/modules/:moduleId/complete', completeModule);
router.get('/grooming/certificate', getCertificate);

module.exports = router;