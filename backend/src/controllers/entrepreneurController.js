// Add this at the VERY TOP of entrepreneurController.js
console.log('🔍 Debugging imports in entrepreneurController:');
try {
  const models = require('../models/queries');
  console.log('models object keys:', Object.keys(models));
  console.log('Entrepreneur exists:', !!models.Entrepreneur);
  console.log('Grooming exists:', !!models.Grooming);
  console.log('StressTest exists:', !!models.StressTest);
  console.log('BusinessPlan exists:', !!models.BusinessPlan);
} catch (error) {
  console.error('Error importing models:', error);
}

// At the top of entrepreneurController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Entrepreneur, Grooming, StressTest, BusinessPlan } = require('../models/queries');
const db = require('../config/database');

// ... rest of your code
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dashboardData = await Entrepreneur.getDashboardData(userId);
    
    if (dashboardData.rows.length === 0) {
      return res.status(404).json({ error: 'Entrepreneur profile not found' });
    }

    res.json(dashboardData.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fixedCost, variableMonthlyCost } = req.body;

    const updatedProfile = await Entrepreneur.updateProfile(userId, {
      fixedCost,
      variableMonthlyCost
    });

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const submitCompliance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    await db.query(
      'UPDATE entrepreneurs SET compliance_completed = true WHERE entrepreneur_id = $1',
      [userId]
    );

    res.json({ message: 'Compliance submitted successfully' });
  } catch (error) {
    next(error);
  }
};

const getGroomingProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await Grooming.getProgress(userId);
    
    res.json(progress.rows[0] || { status: 'not_started' });
  } catch (error) {
    next(error);
  }
};

const updateGroomingProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, quizScore, businessReportUrl } = req.body;

    const updated = await Grooming.updateProgress(userId, {
      status,
      quizScore,
      businessReportUrl
    });

    // If grooming is completed, update entrepreneur record
    if (status === 'completed') {
      await db.query(
        'UPDATE entrepreneurs SET grooming_completed = true WHERE entrepreneur_id = $1',
        [userId]
      );

      // Calculate readiness score (simplified version)
      const readinessScore = 70; // Simplified for now
      await Entrepreneur.updateReadinessScore(userId, readinessScore);
    }

    res.json({
      message: 'Grooming progress updated',
      progress: updated.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const submitStressTest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { simulationScore, passed } = req.body;

    const attempt = await StressTest.createAttempt(userId, simulationScore, passed);

    // Update entrepreneur record if passed
    if (passed) {
      await db.query(
        'UPDATE entrepreneurs SET stress_test_passed = true WHERE entrepreneur_id = $1',
        [userId]
      );

      // Update readiness score (add stress test component)
      const currentScore = await db.query(
        'SELECT readiness_score FROM entrepreneurs WHERE entrepreneur_id = $1',
        [userId]
      );
      
      const newScore = Math.min(100, (currentScore.rows[0].readiness_score || 0) + 20);
      await Entrepreneur.updateReadinessScore(userId, newScore);
    }

    res.json({
      message: passed ? 'Stress test passed!' : 'Stress test attempt recorded',
      attempt: attempt.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const saveBusinessPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planContent, documentUrl } = req.body;

    // Check if business plan exists
    const existing = await BusinessPlan.getByEntrepreneurId(userId);
    
    let result;
    if (existing.rows.length > 0) {
      result = await BusinessPlan.update(userId, planContent, documentUrl);
    } else {
      result = await BusinessPlan.create(userId, planContent, documentUrl);
    }

    res.json({
      message: 'Business plan saved successfully',
      plan: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getBusinessPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const plan = await BusinessPlan.getByEntrepreneurId(userId);
    
    if (plan.rows.length === 0) {
      return res.status(404).json({ error: 'Business plan not found' });
    }

    res.json(plan.rows[0]);
  } catch (error) {
    next(error);
  }
};

const getMentorLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const logs = await db.query(
      `SELECT ml.*, u.full_name as mentor_name 
       FROM mentor_log ml
       JOIN users u ON ml.mentor_id = u.user_id
       WHERE ml.entrepreneur_id = $1
       ORDER BY ml.visit_date DESC`,
      [userId]
    );

    res.json(logs.rows);
  } catch (error) {
    next(error);
  }
};

const getFunderMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const matches = await db.query(
      `SELECT fm.*, 
        f.organization_name, 
        f.investment_budget,
        f.preferred_industry,
        u.full_name as funder_name
       FROM funder_match fm
       JOIN funders f ON fm.funder_id = f.funder_id
       JOIN users u ON f.funder_id = u.user_id
       WHERE fm.entrepreneur_id = $1
       ORDER BY fm.created_at DESC`,
      [userId]
    );

    res.json(matches.rows);
  } catch (error) {
    next(error);
  }
};
// ==================== DOCUMENT UPLOAD FUNCTIONS ====================

const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.body; // idDocument, proofOfRegistration, etc.
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create documents table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        entrepreneur_id UUID NOT NULL REFERENCES entrepreneurs(entrepreneur_id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified BOOLEAN DEFAULT FALSE
      )
    `);

    // Save file info to database
    const query = `
      INSERT INTO documents (entrepreneur_id, document_type, file_path, file_name, file_size)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      userId, 
      type, 
      file.path, 
      file.originalname,
      file.size
    ]);
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT document_type, file_name, uploaded_at, verified FROM documents WHERE entrepreneur_id = $1',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    
    const result = await db.query(
      'SELECT * FROM documents WHERE entrepreneur_id = $1 AND document_type = $2 ORDER BY uploaded_at DESC LIMIT 1',
      [userId, type]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = result.rows[0];
    
    // Send file
    res.sendFile(path.resolve(document.file_path));
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;
    
    // Get file path before deleting
    const doc = await db.query(
      'SELECT file_path FROM documents WHERE document_id = $1 AND entrepreneur_id = $2',
      [documentId, userId]
    );
    
    if (doc.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete file from filesystem
    fs.unlinkSync(doc.rows[0].file_path);
    
    // Delete from database
    await db.query(
      'DELETE FROM documents WHERE document_id = $1 AND entrepreneur_id = $2',
      [documentId, userId]
    );
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==================== FUNDING/MATCHING FUNCTIONS ====================

const getEligibleFunders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get entrepreneur's readiness score
    const entrepreneur = await db.query(
      'SELECT readiness_score FROM entrepreneurs WHERE entrepreneur_id = $1',
      [userId]
    );
    
    const score = entrepreneur.rows[0]?.readiness_score || 0;
    
    // Create funder_likes table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS funder_likes (
        like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        entrepreneur_id UUID REFERENCES entrepreneurs(entrepreneur_id) ON DELETE CASCADE,
        funder_id UUID REFERENCES funders(funder_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(entrepreneur_id, funder_id)
      )
    `);

    // Get funders where minimum score <= entrepreneur's score
    const query = `
      SELECT 
        f.*,
        u.full_name as funder_name,
        CASE WHEN fl.funder_id IS NOT NULL THEN true ELSE false END as is_liked,
        CASE WHEN fm.funder_id IS NOT NULL THEN true ELSE false END as mutual_like
      FROM funders f
      JOIN users u ON f.funder_id = u.user_id
      LEFT JOIN funder_likes fl ON f.funder_id = fl.funder_id AND fl.entrepreneur_id = $1
      LEFT JOIN funder_match fm ON f.funder_id = fm.funder_id AND fm.entrepreneur_id = $1 AND fm.application_status = 'approved'
      WHERE f.minimum_readiness_score <= $2
      ORDER BY f.minimum_readiness_score DESC
    `;
    
    const result = await db.query(query, [userId, score]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getLikedFunders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        fl.*,
        f.organization_name,
        u.full_name as funder_name
      FROM funder_likes fl
      JOIN funders f ON fl.funder_id = f.funder_id
      JOIN users u ON f.funder_id = u.user_id
      WHERE fl.entrepreneur_id = $1
      ORDER BY fl.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const likeFunder = async (req, res, next) => {
  try {
    const entrepreneurId = req.user.id;
    const { funderId } = req.body;
    
    // Record the like
    await db.query(
      'INSERT INTO funder_likes (entrepreneur_id, funder_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [entrepreneurId, funderId]
    );
    
    // Check if funder already liked this entrepreneur
    const mutualLike = await db.query(
      'SELECT * FROM funder_likes WHERE entrepreneur_id = $1 AND funder_id = $2',
      [funderId, entrepreneurId]
    );
    
    // If mutual like, create a match
    if (mutualLike.rows.length > 0) {
      const match = await db.query(
        `INSERT INTO funder_match (entrepreneur_id, funder_id, application_status) 
         VALUES ($1, $2, 'approved') 
         RETURNING *`,
        [entrepreneurId, funderId]
      );
      
      return res.json({ 
        message: "It's a match!", 
        match: match.rows[0],
        isMatch: true 
      });
    }
    
    res.json({ message: 'Funder liked successfully', isMatch: false });
  } catch (error) {
    next(error);
  }
};

const unlikeFunder = async (req, res, next) => {
  try {
    const entrepreneurId = req.user.id;
    const { funderId } = req.body;
    
    await db.query(
      'DELETE FROM funder_likes WHERE entrepreneur_id = $1 AND funder_id = $2',
      [entrepreneurId, funderId]
    );
    
    res.json({ message: 'Foder unliked successfully' });
  } catch (error) {
    next(error);
  }
};

const getMutualMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        fm.*,
        f.organization_name,
        f.investment_budget,
        f.preferred_industry,
        u.full_name as funder_name,
        u.email
      FROM funder_match fm
      JOIN funders f ON fm.funder_id = f.funder_id
      JOIN users u ON f.funder_id = u.user_id
      WHERE fm.entrepreneur_id = $1 AND fm.application_status = 'approved'
      ORDER BY fm.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// ==================== GROOMING MODULE FUNCTIONS ====================

const getGroomingModules = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Create tables if they don't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS grooming_modules (
        module_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        order_number INTEGER NOT NULL,
        quiz_questions JSONB
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS entrepreneur_module_progress (
        progress_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        entrepreneur_id UUID NOT NULL REFERENCES entrepreneurs(entrepreneur_id) ON DELETE CASCADE,
        module_id UUID NOT NULL REFERENCES grooming_modules(module_id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        quiz_score INTEGER,
        completed_at TIMESTAMP,
        UNIQUE(entrepreneur_id, module_id)
      )
    `);

    // Insert default modules if none exist
    const moduleCount = await db.query('SELECT COUNT(*) FROM grooming_modules');
    if (parseInt(moduleCount.rows[0].count) === 0) {
      const defaultModules = [
        {
          title: 'Financial Literacy',
          description: 'Understand financial statements, cash flow, and basic accounting',
          order_number: 1,
          quiz_questions: JSON.stringify([
            {
              question: 'What is the primary purpose of a cash flow statement?',
              options: ['To show company profits', 'To track money in and out of the business', 'To calculate taxes', 'To list company assets'],
              correct: 1
            },
            {
              question: 'Which of the following is considered a fixed cost?',
              options: ['Raw materials', 'Monthly rent', 'Shipping costs', 'Commission payments'],
              correct: 1
            }
          ])
        },
        {
          title: 'Market Research',
          description: 'Learn to analyze your market, competitors, and target audience',
          order_number: 2,
          quiz_questions: JSON.stringify([
            {
              question: 'What is a TAM (Total Addressable Market)?',
              options: ['The market you currently serve', 'The entire revenue opportunity for your product', 'Your top 10 competitors', 'Your marketing budget'],
              correct: 1
            }
          ])
        },
        {
          title: 'Business Mindset',
          description: 'Develop entrepreneurial thinking and leadership skills',
          order_number: 3,
          quiz_questions: JSON.stringify([
            {
              question: 'What is a key characteristic of a growth mindset?',
              options: ['Avoiding challenges', 'Believing abilities can be developed', 'Sticking to what you know', 'Giving up easily'],
              correct: 1
            }
          ])
        }
      ];

      for (const module of defaultModules) {
        await db.query(
          'INSERT INTO grooming_modules (title, description, order_number, quiz_questions) VALUES ($1, $2, $3, $4)',
          [module.title, module.description, module.order_number, module.quiz_questions]
        );
      }
    }

    // Get modules with progress for this entrepreneur
    const query = `
      SELECT 
        gm.*,
        COALESCE(emp.completed, false) as completed,
        emp.quiz_score,
        emp.completed_at
      FROM grooming_modules gm
      LEFT JOIN entrepreneur_module_progress emp ON gm.module_id = emp.module_id AND emp.entrepreneur_id = $1
      ORDER BY gm.order_number
    `;
    
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const submitQuizAnswer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { answers } = req.body; // Array of selected answer indices
    
    // Get module questions
    const module = await db.query(
      'SELECT quiz_questions FROM grooming_modules WHERE module_id = $1',
      [moduleId]
    );
    
    if (module.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    const questions = module.rows[0].quiz_questions;
    let correct = 0;
    
    // Calculate score
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++;
    });
    
    const score = Math.round((correct / questions.length) * 100);
    
    // Save progress
    await db.query(
      `INSERT INTO entrepreneur_module_progress (entrepreneur_id, module_id, quiz_score, completed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (entrepreneur_id, module_id) 
       DO UPDATE SET quiz_score = $3, completed = $4`,
      [userId, moduleId, score, score >= 70]
    );
    
    res.json({ 
      score, 
      passed: score >= 70,
      totalQuestions: questions.length,
      correctAnswers: correct
    });
  } catch (error) {
    next(error);
  }
};

const getQuizResults = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    
    const result = await db.query(
      'SELECT quiz_score, completed, completed_at FROM entrepreneur_module_progress WHERE entrepreneur_id = $1 AND module_id = $2',
      [userId, moduleId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const completeModule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    
    await db.query(
      `INSERT INTO entrepreneur_module_progress (entrepreneur_id, module_id, completed, completed_at)
       VALUES ($1, $2, true, NOW())
       ON CONFLICT (entrepreneur_id, module_id) 
       DO UPDATE SET completed = true, completed_at = NOW()`,
      [userId, moduleId]
    );
    
    // Check if all modules completed
    const modules = await db.query(
      'SELECT COUNT(*) as total FROM grooming_modules'
    );
    
    const completed = await db.query(
      'SELECT COUNT(*) as completed FROM entrepreneur_module_progress WHERE entrepreneur_id = $1 AND completed = true',
      [userId]
    );
    
    const totalModules = parseInt(modules.rows[0].total);
    const completedModules = parseInt(completed.rows[0].completed);
    
    // If all modules completed, update entrepreneur's grooming_completed status
    if (completedModules === totalModules) {
      await db.query(
        'UPDATE entrepreneurs SET grooming_completed = true WHERE entrepreneur_id = $1',
        [userId]
      );
    }
    
    res.json({ 
      message: 'Module completed successfully',
      progress: `${completedModules}/${totalModules}`
    });
  } catch (error) {
    next(error);
  }
};

const getCertificate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Check if all modules completed
    const modules = await db.query(
      'SELECT COUNT(*) as total FROM grooming_modules'
    );
    
    const completed = await db.query(
      'SELECT COUNT(*) as completed FROM entrepreneur_module_progress WHERE entrepreneur_id = $1 AND completed = true',
      [userId]
    );
    
    const totalModules = parseInt(modules.rows[0].total);
    const completedModules = parseInt(completed.rows[0].completed);
    
    if (completedModules < totalModules) {
      return res.status(400).json({ error: 'Complete all modules first' });
    }
    
    // Get entrepreneur details for certificate
    const details = await db.query(
      `SELECT 
        u.full_name,
        e.business_name,
        e.completed_at
       FROM entrepreneurs e
       JOIN users u ON e.entrepreneur_id = u.user_id
       WHERE e.entrepreneur_id = $1`,
      [userId]
    );
    
    // In a real app, you'd generate a PDF certificate here
    res.json({
      message: 'Certificate generated',
      certificate: {
        entrepreneurName: details.rows[0].full_name,
        businessName: details.rows[0].business_name,
        completionDate: details.rows[0].completed_at,
        modulesCompleted: completedModules
      }
    });
  } catch (error) {
    next(error);
  }
};

// Don't forget to add these to the module.exports at the bottom!

module.exports = {
  // Existing exports
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
  
  // NEW EXPORTS
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
};
