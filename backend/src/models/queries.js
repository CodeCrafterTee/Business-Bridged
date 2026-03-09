// src/models/queries.js
const db = require('../config/database');

const User = {
  create: async (userData) => {
    const { fullName, email, password, role, phone } = userData;
    const query = `
      INSERT INTO users (full_name, email, password, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, full_name, email, role, created_at
    `;
    return db.query(query, [fullName, email, password, role, phone]);
  },

  findByEmail: async (email) => {
    return db.query('SELECT * FROM users WHERE email = $1', [email]);
  },

  findById: async (userId) => {
    return db.query(
      'SELECT user_id, full_name, email, role, phone, created_at FROM users WHERE user_id = $1',
      [userId]
    );
  }
};

const Entrepreneur = {
  create: async (entrepreneurData) => {
    const { entrepreneurId, businessName, industry, cicpNumber } = entrepreneurData;
    const query = `
      INSERT INTO entrepreneurs (
        entrepreneur_id, business_name, industry, cicp_number
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    return db.query(query, [entrepreneurId, businessName, industry, cicpNumber]);
  },

  findByUserId: async (userId) => {
    return db.query(
      'SELECT * FROM entrepreneurs WHERE entrepreneur_id = $1',
      [userId]
    );
  },

  updateProfile: async (userId, data) => {
    const { fixedCost, variableMonthlyCost } = data;
    const query = `
      UPDATE entrepreneurs 
      SET fixed_cost = $1, variable_monthly_cost = $2
      WHERE entrepreneur_id = $3
      RETURNING *
    `;
    return db.query(query, [fixedCost, variableMonthlyCost, userId]);
  },

  updateVerificationStatus: async (userId, verified) => {
    return db.query(
      'UPDATE entrepreneurs SET verified = $1 WHERE entrepreneur_id = $2 RETURNING *',
      [verified, userId]
    );
  },

  updateReadinessScore: async (userId, score) => {
    return db.query(
      'UPDATE entrepreneurs SET readiness_score = $1 WHERE entrepreneur_id = $2 RETURNING *',
      [score, userId]
    );
  },

  // This is the missing function that your controller is calling
  getDashboardData: async (userId) => {
    const query = `
      SELECT 
        e.*,
        u.full_name,
        u.email,
        u.phone,
        gp.status as grooming_status,
        gp.quiz_score,
        gp.business_report_url,
        gp.last_updated as grooming_last_updated,
        sp.simulation_score,
        sp.passed as stress_test_passed,
        sp.attempt_number,
        sp.created_at as stress_test_taken_at,
        bp.plan_content_json,
        bp.document_url as business_plan_url,
        bp.created_at as business_plan_created_at,
        (
          SELECT COUNT(*) 
          FROM mentor_log ml 
          WHERE ml.entrepreneur_id = e.entrepreneur_id 
          AND ml.vouch_status = 'approved'
        ) as mentor_vouches,
        (
          SELECT COUNT(*) 
          FROM mentor_log ml 
          WHERE ml.entrepreneur_id = e.entrepreneur_id
        ) as total_mentor_visits,
        (
          SELECT COUNT(*) 
          FROM funder_match fm 
          WHERE fm.entrepreneur_id = e.entrepreneur_id 
          AND fm.application_status = 'approved'
        ) as funder_matches,
        (
          SELECT COUNT(*) 
          FROM funder_match fm 
          WHERE fm.entrepreneur_id = e.entrepreneur_id
        ) as total_funder_applications
      FROM entrepreneurs e
      JOIN users u ON e.entrepreneur_id = u.user_id
      LEFT JOIN grooming_progress gp ON e.entrepreneur_id = gp.entrepreneur_id
      LEFT JOIN stress_test sp ON e.entrepreneur_id = sp.entrepreneur_id
      LEFT JOIN business_plan bp ON e.entrepreneur_id = bp.entrepreneur_id
      WHERE e.entrepreneur_id = $1
      ORDER BY gp.last_updated DESC NULLS LAST, sp.created_at DESC NULLS LAST
      LIMIT 1
    `;
    return db.query(query, [userId]);
  },

  // Get all entrepreneurs for admin/mentor views
  getAll: async (filters = {}) => {
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
        e.created_at
      FROM entrepreneurs e
      JOIN users u ON e.entrepreneur_id = u.user_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.verified !== undefined) {
      query += ` AND e.verified = $${paramCount}`;
      values.push(filters.verified);
      paramCount++;
    }

    if (filters.industry) {
      query += ` AND e.industry ILIKE $${paramCount}`;
      values.push(`%${filters.industry}%`);
      paramCount++;
    }

    if (filters.minScore) {
      query += ` AND e.readiness_score >= $${paramCount}`;
      values.push(filters.minScore);
      paramCount++;
    }

    query += ` ORDER BY e.created_at DESC`;
    
    return db.query(query, values);
  }
};

const Mentor = {
  createLog: async (logData) => {
    const { mentorId, entrepreneurId, visitDate, notes, vouchStatus } = logData;
    const query = `
      INSERT INTO mentor_log (mentor_id, entrepreneur_id, visit_date, notes, vouch_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    return db.query(query, [mentorId, entrepreneurId, visitDate, notes, vouchStatus]);
  },

  getAssignedEntrepreneurs: async (mentorId) => {
    const query = `
      SELECT DISTINCT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        e.business_name,
        e.industry,
        e.verified,
        e.readiness_score,
        e.compliance_completed,
        e.grooming_completed,
        e.stress_test_passed,
        (
          SELECT COUNT(*) 
          FROM mentor_log ml 
          WHERE ml.entrepreneur_id = e.entrepreneur_id 
          AND ml.mentor_id = $1
        ) as visit_count,
        (
          SELECT vouch_status 
          FROM mentor_log ml 
          WHERE ml.entrepreneur_id = e.entrepreneur_id 
          AND ml.mentor_id = $1
          ORDER BY ml.created_at DESC 
          LIMIT 1
        ) as last_vouch_status
      FROM mentor_log ml
      JOIN entrepreneurs e ON ml.entrepreneur_id = e.entrepreneur_id
      JOIN users u ON e.entrepreneur_id = u.user_id
      WHERE ml.mentor_id = $1
    `;
    return db.query(query, [mentorId]);
  },

  getEntrepreneurLogs: async (mentorId, entrepreneurId) => {
    return db.query(
      'SELECT * FROM mentor_log WHERE mentor_id = $1 AND entrepreneur_id = $2 ORDER BY visit_date DESC',
      [mentorId, entrepreneurId]
    );
  },

  getAllLogs: async (filters = {}) => {
    let query = `
      SELECT 
        ml.*,
        m.full_name as mentor_name,
        e.business_name,
        ent.full_name as entrepreneur_name
      FROM mentor_log ml
      JOIN users m ON ml.mentor_id = m.user_id
      JOIN entrepreneurs e ON ml.entrepreneur_id = e.entrepreneur_id
      JOIN users ent ON e.entrepreneur_id = ent.user_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.mentorId) {
      query += ` AND ml.mentor_id = $${paramCount}`;
      values.push(filters.mentorId);
      paramCount++;
    }

    if (filters.entrepreneurId) {
      query += ` AND ml.entrepreneur_id = $${paramCount}`;
      values.push(filters.entrepreneurId);
      paramCount++;
    }

    if (filters.vouchStatus) {
      query += ` AND ml.vouch_status = $${paramCount}`;
      values.push(filters.vouchStatus);
      paramCount++;
    }

    query += ` ORDER BY ml.visit_date DESC`;
    
    return db.query(query, values);
  }
};

const Funder = {
  create: async (funderData) => {
    const { funderId, organizationName, investmentBudget, preferredIndustry, minimumReadinessScore, requirementsJson } = funderData;
    const query = `
      INSERT INTO funders (
        funder_id, organization_name, investment_budget, 
        preferred_industry, minimum_readiness_score, requirements_json
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    return db.query(query, [funderId, organizationName, investmentBudget, preferredIndustry, minimumReadinessScore, requirementsJson]);
  },

  findByUserId: async (userId) => {
    return db.query('SELECT * FROM funders WHERE funder_id = $1', [userId]);
  },

  updateProfile: async (funderId, data) => {
    const { organizationName, investmentBudget, preferredIndustry, minimumReadinessScore, requirementsJson } = data;
    const query = `
      UPDATE funders 
      SET organization_name = COALESCE($1, organization_name),
          investment_budget = COALESCE($2, investment_budget),
          preferred_industry = COALESCE($3, preferred_industry),
          minimum_readiness_score = COALESCE($4, minimum_readiness_score),
          requirements_json = COALESCE($5, requirements_json)
      WHERE funder_id = $6
      RETURNING *
    `;
    return db.query(query, [organizationName, investmentBudget, preferredIndustry, minimumReadinessScore, requirementsJson, funderId]);
  },

  findEligibleEntrepreneurs: async (funderId) => {
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        e.business_name,
        e.industry,
        e.readiness_score,
        e.fixed_cost,
        e.variable_monthly_cost,
        e.verified,
        e.compliance_completed,
        e.grooming_completed,
        e.stress_test_passed,
        (
          SELECT COUNT(*) 
          FROM mentor_log ml 
          WHERE ml.entrepreneur_id = e.entrepreneur_id 
          AND ml.vouch_status = 'approved'
        ) as mentor_vouches
      FROM entrepreneurs e
      JOIN users u ON e.entrepreneur_id = u.user_id
      WHERE e.verified = true 
        AND e.compliance_completed = true
        AND e.grooming_completed = true
        AND e.stress_test_passed = true
        AND e.readiness_score >= (
          SELECT minimum_readiness_score 
          FROM funders 
          WHERE funder_id = $1
        )
    `;
    return db.query(query, [funderId]);
  },

  createMatch: async (entrepreneurId, funderId) => {
    const query = `
      INSERT INTO funder_match (entrepreneur_id, funder_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    return db.query(query, [entrepreneurId, funderId]);
  },

  updateMatchStatus: async (matchId, status, feedback) => {
    const query = `
      UPDATE funder_match 
      SET application_status = $1, funder_feedback = $2
      WHERE match_id = $3
      RETURNING *
    `;
    return db.query(query, [status, feedback, matchId]);
  },

  getMatches: async (funderId) => {
    const query = `
      SELECT 
        fm.*,
        u.full_name as entrepreneur_name,
        e.business_name,
        e.industry,
        e.readiness_score
      FROM funder_match fm
      JOIN entrepreneurs e ON fm.entrepreneur_id = e.entrepreneur_id
      JOIN users u ON e.entrepreneur_id = u.user_id
      WHERE fm.funder_id = $1
      ORDER BY fm.created_at DESC
    `;
    return db.query(query, [funderId]);
  },

  getMatchesForEntrepreneur: async (entrepreneurId) => {
    const query = `
      SELECT 
        fm.*,
        f.organization_name,
        f.investment_budget,
        f.preferred_industry,
        u.full_name as funder_name
      FROM funder_match fm
      JOIN funders f ON fm.funder_id = f.funder_id
      JOIN users u ON f.funder_id = u.user_id
      WHERE fm.entrepreneur_id = $1
      ORDER BY fm.created_at DESC
    `;
    return db.query(query, [entrepreneurId]);
  }
};

const Grooming = {
  createProgress: async (entrepreneurId) => {
    const query = `
      INSERT INTO grooming_progress (entrepreneur_id)
      VALUES ($1)
      RETURNING *
    `;
    return db.query(query, [entrepreneurId]);
  },

  updateProgress: async (entrepreneurId, data) => {
    const { status, quizScore, businessReportUrl } = data;
    const query = `
      UPDATE grooming_progress 
      SET status = COALESCE($1, status),
          quiz_score = COALESCE($2, quiz_score),
          business_report_url = COALESCE($3, business_report_url),
          last_updated = CURRENT_TIMESTAMP
      WHERE entrepreneur_id = $4
      RETURNING *
    `;
    return db.query(query, [status, quizScore, businessReportUrl, entrepreneurId]);
  },

  getProgress: async (entrepreneurId) => {
    return db.query(
      'SELECT * FROM grooming_progress WHERE entrepreneur_id = $1 ORDER BY last_updated DESC LIMIT 1',
      [entrepreneurId]
    );
  },

  getAllProgress: async () => {
    return db.query(`
      SELECT 
        gp.*,
        e.business_name,
        u.full_name
      FROM grooming_progress gp
      JOIN entrepreneurs e ON gp.entrepreneur_id = e.entrepreneur_id
      JOIN users u ON e.entrepreneur_id = u.user_id
      ORDER BY gp.last_updated DESC
    `);
  }
};

const StressTest = {
  createAttempt: async (entrepreneurId, simulationScore, passed) => {
    // First get the current attempt number
    const attemptCount = await db.query(
      'SELECT COUNT(*) FROM stress_test WHERE entrepreneur_id = $1',
      [entrepreneurId]
    );
    
    const attemptNumber = parseInt(attemptCount.rows[0].count) + 1;
    
    const query = `
      INSERT INTO stress_test (entrepreneur_id, simulation_score, passed, attempt_number)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    return db.query(query, [entrepreneurId, simulationScore, passed, attemptNumber]);
  },

  getLatestAttempt: async (entrepreneurId) => {
    return db.query(
      'SELECT * FROM stress_test WHERE entrepreneur_id = $1 ORDER BY created_at DESC LIMIT 1',
      [entrepreneurId]
    );
  },

  getAllAttempts: async (entrepreneurId) => {
    return db.query(
      'SELECT * FROM stress_test WHERE entrepreneur_id = $1 ORDER BY created_at DESC',
      [entrepreneurId]
    );
  },

  getPassRate: async (entrepreneurId) => {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN passed THEN 1 ELSE 0 END) as passed_attempts
       FROM stress_test 
       WHERE entrepreneur_id = $1`,
      [entrepreneurId]
    );
    return result.rows[0];
  }
};

const BusinessPlan = {
  create: async (entrepreneurId, planContentJson, documentUrl) => {
    const query = `
      INSERT INTO business_plan (entrepreneur_id, plan_content_json, document_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    return db.query(query, [entrepreneurId, planContentJson, documentUrl]);
  },

  update: async (entrepreneurId, planContentJson, documentUrl) => {
    const query = `
      UPDATE business_plan 
      SET plan_content_json = COALESCE($1, plan_content_json),
          document_url = COALESCE($2, document_url),
          created_at = CURRENT_TIMESTAMP
      WHERE entrepreneur_id = $3
      RETURNING *
    `;
    return db.query(query, [planContentJson, documentUrl, entrepreneurId]);
  },

  getByEntrepreneurId: async (entrepreneurId) => {
    return db.query(
      'SELECT * FROM business_plan WHERE entrepreneur_id = $1 ORDER BY created_at DESC LIMIT 1',
      [entrepreneurId]
    );
  },

  getAll: async () => {
    return db.query(`
      SELECT 
        bp.*,
        e.business_name,
        u.full_name
      FROM business_plan bp
      JOIN entrepreneurs e ON bp.entrepreneur_id = e.entrepreneur_id
      JOIN users u ON e.entrepreneur_id = u.user_id
      ORDER BY bp.created_at DESC
    `);
  }
};

module.exports = {
  User,
  Entrepreneur,
  Mentor,
  Funder,
  Grooming,
  StressTest,
  BusinessPlan
};