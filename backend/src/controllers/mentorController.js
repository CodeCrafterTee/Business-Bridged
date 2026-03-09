// src/controllers/mentorController.js
const { Mentor } = require('../models/queries');
const db = require('../config/database');

// ==================== EXISTING FUNCTIONS ====================

const getEntrepreneurs = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    const entrepreneurs = await Mentor.getAssignedEntrepreneurs(mentorId);
    
    res.json(entrepreneurs.rows);
  } catch (error) {
    next(error);
  }
};

const createVisitLog = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    const { entrepreneurId, visitDate, notes, vouchStatus } = req.body;

    const log = await Mentor.createLog({
      mentorId,
      entrepreneurId,
      visitDate,
      notes,
      vouchStatus
    });

    // If vouched, update entrepreneur's readiness score
    if (vouchStatus === 'approved') {
      await db.query(
        `UPDATE entrepreneurs 
         SET readiness_score = LEAST(readiness_score + 10, 100) 
         WHERE entrepreneur_id = $1`,
        [entrepreneurId]
      );
    }

    res.status(201).json({
      message: 'Visit log created successfully',
      log: log.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getEntrepreneurLogs = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    const { entrepreneurId } = req.params;

    const logs = await Mentor.getEntrepreneurLogs(mentorId, entrepreneurId);
    
    res.json(logs.rows);
  } catch (error) {
    next(error);
  }
};

const getEntrepreneurDetails = async (req, res, next) => {
  try {
    const { entrepreneurId } = req.params;
    
    const details = await db.query(
      `SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        e.business_name,
        e.industry,
        e.verified,
        e.compliance_completed,
        e.grooming_completed,
        e.stress_test_passed,
        e.readiness_score,
        e.fixed_cost,
        e.variable_monthly_cost,
        gp.status as grooming_status,
        gp.quiz_score,
        sp.simulation_score,
        sp.passed as stress_test_passed_detail
       FROM entrepreneurs e
       JOIN users u ON e.entrepreneur_id = u.user_id
       LEFT JOIN grooming_progress gp ON e.entrepreneur_id = gp.entrepreneur_id
       LEFT JOIN stress_test sp ON e.entrepreneur_id = sp.entrepreneur_id
       WHERE e.entrepreneur_id = $1`,
      [entrepreneurId]
    );

    if (details.rows.length === 0) {
      return res.status(404).json({ error: 'Entrepreneur not found' });
    }

    res.json(details.rows[0]);
  } catch (error) {
    next(error);
  }
};

// ==================== NEW FUNCTIONS ====================

const getMentorDashboard = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    
    // Get mentor's profile
    const profile = await db.query(
      'SELECT full_name, email, phone FROM users WHERE user_id = $1',
      [mentorId]
    );
    
    // Get statistics
    const stats = await db.query(`
      SELECT 
        COUNT(DISTINCT entrepreneur_id) as total_entrepreneurs,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN vouch_status = 'approved' THEN 1 END) as total_vouches,
        COUNT(CASE WHEN visit_date >= NOW() - INTERVAL '7 days' THEN 1 END) as sessions_this_week
      FROM mentor_log
      WHERE mentor_id = $1
    `, [mentorId]);
    
    // Get recent sessions
    const recentSessions = await db.query(`
      SELECT 
        ml.*,
        e.business_name,
        u.full_name as entrepreneur_name
      FROM mentor_log ml
      JOIN entrepreneurs e ON ml.entrepreneur_id = e.entrepreneur_id
      JOIN users u ON e.entrepreneur_id = u.user_id
      WHERE ml.mentor_id = $1
      ORDER BY ml.visit_date DESC
      LIMIT 5
    `, [mentorId]);
    
    // Get pending requests (entrepreneurs with no visits or last visit not vouched)
    const pendingRequests = await db.query(`
      SELECT DISTINCT
        e.entrepreneur_id,
        e.business_name,
        u.full_name,
        u.email,
        e.industry,
        e.readiness_score,
        e.verified,
        (
          SELECT COUNT(*) 
          FROM mentor_log 
          WHERE entrepreneur_id = e.entrepreneur_id AND mentor_id = $1
        ) as visit_count,
        (
          SELECT vouch_status 
          FROM mentor_log 
          WHERE entrepreneur_id = e.entrepreneur_id AND mentor_id = $1
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_vouch_status
      FROM entrepreneurs e
      JOIN users u ON e.entrepreneur_id = u.user_id
      LEFT JOIN mentor_log ml ON e.entrepreneur_id = ml.entrepreneur_id AND ml.mentor_id = $1
      WHERE ml.mentor_id IS NULL OR ml.vouch_status IS NULL
      ORDER BY e.readiness_score DESC
      LIMIT 10
    `, [mentorId]);
    
    res.json({
      profile: profile.rows[0],
      stats: stats.rows[0],
      recentSessions: recentSessions.rows,
      pendingRequests: pendingRequests.rows
    });
  } catch (error) {
    next(error);
  }
};

const getAllEntrepreneurs = async (req, res, next) => {
  try {
    const { search, industry, verified } = req.query;
    
    let query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        e.business_name,
        e.industry,
        e.verified,
        e.compliance_completed,
        e.grooming_completed,
        e.stress_test_passed,
        e.readiness_score,
        e.created_at,
        (
          SELECT COUNT(*) 
          FROM mentor_log 
          WHERE entrepreneur_id = e.entrepreneur_id
        ) as total_visits,
        (
          SELECT COUNT(*) 
          FROM mentor_log 
          WHERE entrepreneur_id = e.entrepreneur_id AND vouch_status = 'approved'
        ) as total_vouches
      FROM entrepreneurs e
      JOIN users u ON e.entrepreneur_id = u.user_id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (u.full_name ILIKE $${paramCount} OR e.business_name ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }
    
    if (industry) {
      query += ` AND e.industry = $${paramCount}`;
      values.push(industry);
      paramCount++;
    }
    
    if (verified !== undefined) {
      query += ` AND e.verified = $${paramCount}`;
      values.push(verified === 'true');
      paramCount++;
    }
    
    query += ` ORDER BY e.readiness_score DESC`;
    
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getEntrepreneurFullProfile = async (req, res, next) => {
  try {
    const { entrepreneurId } = req.params;
    
    const profile = await db.query(`
      SELECT 
        u.*,
        e.*,
        gp.quiz_score,
        gp.status as grooming_status,
        gp.business_report_url,
        sp.simulation_score,
        sp.passed as stress_test_passed,
        sp.attempt_number,
        bp.plan_content_json,
        bp.document_url as business_plan_url,
        (
          SELECT json_agg(
            json_build_object(
              'log_id', ml.log_id,
              'visit_date', ml.visit_date,
              'notes', ml.notes,
              'vouch_status', ml.vouch_status,
              'created_at', ml.created_at
            ) ORDER BY ml.visit_date DESC
          )
          FROM mentor_log ml
          WHERE ml.entrepreneur_id = e.entrepreneur_id
        ) as session_history
      FROM entrepreneurs e
      JOIN users u ON e.entrepreneur_id = u.user_id
      LEFT JOIN grooming_progress gp ON e.entrepreneur_id = gp.entrepreneur_id
      LEFT JOIN stress_test sp ON e.entrepreneur_id = sp.entrepreneur_id
      LEFT JOIN business_plan bp ON e.entrepreneur_id = bp.entrepreneur_id
      WHERE e.entrepreneur_id = $1
    `, [entrepreneurId]);
    
    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'Entrepreneur not found' });
    }
    
    res.json(profile.rows[0]);
  } catch (error) {
    next(error);
  }
};

const getSessionHistory = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    const { entrepreneurId, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        ml.*,
        e.business_name,
        u.full_name as entrepreneur_name
      FROM mentor_log ml
      JOIN entrepreneurs e ON ml.entrepreneur_id = e.entrepreneur_id
      JOIN users u ON e.entrepreneur_id = u.user_id
      WHERE ml.mentor_id = $1
    `;
    
    const values = [mentorId];
    let paramCount = 2;
    
    if (entrepreneurId) {
      query += ` AND ml.entrepreneur_id = $${paramCount}`;
      values.push(entrepreneurId);
      paramCount++;
    }
    
    if (startDate) {
      query += ` AND ml.visit_date >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND ml.visit_date <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }
    
    query += ` ORDER BY ml.visit_date DESC`;
    
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const updateSessionLog = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    const { logId } = req.params;
    const { notes, vouchStatus } = req.body;
    
    // Check if log belongs to this mentor
    const check = await db.query(
      'SELECT * FROM mentor_log WHERE log_id = $1 AND mentor_id = $2',
      [logId, mentorId]
    );
    
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Session log not found' });
    }
    
    // Update the log
    const result = await db.query(`
      UPDATE mentor_log 
      SET notes = COALESCE($1, notes),
          vouch_status = COALESCE($2, vouch_status)
      WHERE log_id = $3
      RETURNING *
    `, [notes, vouchStatus, logId]);
    
    // If vouch status changed to approved, update readiness score
    if (vouchStatus === 'approved' && check.rows[0].vouch_status !== 'approved') {
      await db.query(
        `UPDATE entrepreneurs 
         SET readiness_score = LEAST(readiness_score + 10, 100) 
         WHERE entrepreneur_id = $1`,
        [check.rows[0].entrepreneur_id]
      );
    }
    
    res.json({
      message: 'Session log updated successfully',
      log: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getMentorProfile = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    
    const profile = await db.query(`
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.created_at,
        (
          SELECT COUNT(DISTINCT entrepreneur_id) 
          FROM mentor_log 
          WHERE mentor_id = $1
        ) as entrepreneurs_mentored,
        (
          SELECT COUNT(*) 
          FROM mentor_log 
          WHERE mentor_id = $1
        ) as total_sessions,
        (
          SELECT COUNT(*) 
          FROM mentor_log 
          WHERE mentor_id = $1 AND vouch_status = 'approved'
        ) as total_vouches_given
      FROM users u
      WHERE u.user_id = $1 AND u.role = 'mentor'
    `, [mentorId]);
    
    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }
    
    res.json(profile.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateMentorProfile = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    const { fullName, phone, expertise, bio } = req.body;
    
    // Update users table
    await db.query(
      'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone) WHERE user_id = $3',
      [fullName, phone, mentorId]
    );
    
    // Create mentor_profiles table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS mentor_profiles (
        mentor_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
        expertise TEXT[],
        bio TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Update or insert mentor profile
    await db.query(`
      INSERT INTO mentor_profiles (mentor_id, expertise, bio)
      VALUES ($1, $2, $3)
      ON CONFLICT (mentor_id) 
      DO UPDATE SET expertise = $2, bio = $3, updated_at = CURRENT_TIMESTAMP
    `, [mentorId, expertise, bio]);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

// ==================== EXPORTS ====================

module.exports = {
  // Existing exports
  getEntrepreneurs,
  createVisitLog,
  getEntrepreneurLogs,
  getEntrepreneurDetails,
  
  // New exports
  getMentorDashboard,
  getAllEntrepreneurs,
  getEntrepreneurFullProfile,
  getSessionHistory,
  updateSessionLog,
  getMentorProfile,
  updateMentorProfile
};