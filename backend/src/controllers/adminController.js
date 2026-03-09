const db = require('../config/database');

const getEntrepreneurs = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.created_at,
        e.business_name,
        e.industry,
        e.verified,
        e.compliance_completed,
        e.grooming_completed,
        e.stress_test_passed,
        e.readiness_score
      FROM users u
      JOIN entrepreneurs e ON u.user_id = e.entrepreneur_id
      ORDER BY u.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getMentors = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        user_id,
        full_name,
        email,
        phone,
        created_at,
        (
          SELECT COUNT(*) 
          FROM mentor_log 
          WHERE mentor_id = users.user_id
        ) as total_visits,
        (
          SELECT COUNT(DISTINCT entrepreneur_id) 
          FROM mentor_log 
          WHERE mentor_id = users.user_id
        ) as entrepreneurs_mentored
      FROM users
      WHERE role = 'mentor'
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getFunders = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.created_at,
        f.organization_name,
        f.investment_budget,
        f.preferred_industry,
        f.minimum_readiness_score,
        (
          SELECT COUNT(*) 
          FROM funder_match 
          WHERE funder_id = u.user_id
        ) as total_matches,
        (
          SELECT COUNT(*) 
          FROM funder_match 
          WHERE funder_id = u.user_id 
          AND application_status = 'approved'
        ) as approved_matches
      FROM users u
      JOIN funders f ON u.user_id = f.funder_id
      WHERE u.role = 'funder'
      ORDER BY u.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const verifyEntrepreneur = async (req, res, next) => {
  try {
    const { entrepreneurId } = req.params;
    
    const result = await db.query(
      'UPDATE entrepreneurs SET verified = true WHERE entrepreneur_id = $1 RETURNING *',
      [entrepreneurId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrepreneur not found' });
    }

    res.json({
      message: 'Entrepreneur verified successfully',
      entrepreneur: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'entrepreneur') as total_entrepreneurs,
        (SELECT COUNT(*) FROM users WHERE role = 'mentor') as total_mentors,
        (SELECT COUNT(*) FROM users WHERE role = 'funder') as total_funders,
        (SELECT COUNT(*) FROM entrepreneurs WHERE verified = true) as verified_entrepreneurs,
        (SELECT COUNT(*) FROM entrepreneurs WHERE grooming_completed = true) as groomed_entrepreneurs,
        (SELECT COUNT(*) FROM entrepreneurs WHERE stress_test_passed = true) as stress_tested_entrepreneurs,
        (SELECT COUNT(*) FROM funder_match) as total_matches,
        (SELECT COUNT(*) FROM funder_match WHERE application_status = 'approved') as approved_matches,
        (SELECT COUNT(*) FROM mentor_log) as total_mentor_visits,
        (SELECT AVG(readiness_score) FROM entrepreneurs) as avg_readiness_score
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEntrepreneurs,
  getMentors,
  getFunders,
  verifyEntrepreneur,
  getStats
};
