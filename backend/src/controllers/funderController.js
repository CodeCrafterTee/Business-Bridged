const { Funder } = require('../models/queries');
const db = require('../config/database');

const getProfile = async (req, res, next) => {
  try {
    const funderId = req.user.id;
    
    const profile = await db.query(
      'SELECT * FROM funders WHERE funder_id = $1',
      [funderId]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'Funder profile not found' });
    }

    res.json(profile.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const funderId = req.user.id;
    const { 
      organizationName, 
      investmentBudget, 
      preferredIndustry, 
      minimumReadinessScore,
      requirementsJson 
    } = req.body;

    const updated = await db.query(
      `UPDATE funders 
       SET organization_name = COALESCE($1, organization_name),
           investment_budget = COALESCE($2, investment_budget),
           preferred_industry = COALESCE($3, preferred_industry),
           minimum_readiness_score = COALESCE($4, minimum_readiness_score),
           requirements_json = COALESCE($5, requirements_json)
       WHERE funder_id = $6
       RETURNING *`,
      [organizationName, investmentBudget, preferredIndustry, minimumReadinessScore, requirementsJson, funderId]
    );

    res.json({
      message: 'Profile updated successfully',
      profile: updated.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getEligibleEntrepreneurs = async (req, res, next) => {
  try {
    const funderId = req.user.id;
    const entrepreneurs = await Funder.findEligibleEntrepreneurs(funderId);
    
    res.json(entrepreneurs.rows);
  } catch (error) {
    next(error);
  }
};

const createMatch = async (req, res, next) => {
  try {
    const funderId = req.user.id;
    const { entrepreneurId } = req.body;

    // Check if match already exists
    const existing = await db.query(
      'SELECT * FROM funder_match WHERE entrepreneur_id = $1 AND funder_id = $2',
      [entrepreneurId, funderId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Match already exists' });
    }

    const match = await Funder.createMatch(entrepreneurId, funderId);

    res.status(201).json({
      message: 'Match created successfully',
      match: match.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const updateMatchStatus = async (req, res, next) => {
  try {
    const funderId = req.user.id;
    const { matchId } = req.params;
    const { status, feedback } = req.body;

    // Verify match belongs to this funder
    const verify = await db.query(
      'SELECT * FROM funder_match WHERE match_id = $1 AND funder_id = $2',
      [matchId, funderId]
    );

    if (verify.rows.length === 0) {
      return res.status(403).json({ error: 'Match not found or unauthorized' });
    }

    const updated = await Funder.updateMatchStatus(matchId, status, feedback);

    res.json({
      message: `Application ${status}`,
      match: updated.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getMatches = async (req, res, next) => {
  try {
    const funderId = req.user.id;
    const matches = await Funder.getMatches(funderId);
    
    res.json(matches.rows);
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
        e.readiness_score,
        e.fixed_cost,
        e.variable_monthly_cost,
        e.verified,
        e.compliance_completed,
        e.grooming_completed,
        e.stress_test_passed,
        (
          SELECT COUNT(*) 
          FROM mentor_log 
          WHERE entrepreneur_id = e.entrepreneur_id 
          AND vouch_status = 'approved'
        ) as mentor_vouches,
        bp.plan_content_json,
        gp.quiz_score
       FROM entrepreneurs e
       JOIN users u ON e.entrepreneur_id = u.user_id
       LEFT JOIN business_plan bp ON e.entrepreneur_id = bp.entrepreneur_id
       LEFT JOIN grooming_progress gp ON e.entrepreneur_id = gp.entrepreneur_id
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

module.exports = {
  getProfile,
  updateProfile,
  getEligibleEntrepreneurs,
  createMatch,
  updateMatchStatus,
  getMatches,
  getEntrepreneurDetails
};
