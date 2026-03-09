const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');
const { User, Entrepreneur, Funder } = require('../models/queries');

const register = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      phone
    });

    const user = newUser.rows[0];

    // Create role-specific profile
    if (role === 'entrepreneur') {
      await Entrepreneur.create({
        entrepreneurId: user.user_id,
        businessName: req.body.businessName,
        industry: req.body.industry,
        cicpNumber: req.body.cicpNumber
      });
      
      // Create initial grooming progress
      await db.query(
        'INSERT INTO grooming_progress (entrepreneur_id) VALUES ($1)',
        [user.user_id]
      );
    } else if (role === 'funder') {
      await Funder.create({
        funderId: user.user_id,
        organizationName: req.body.organizationName,
        investmentBudget: req.body.investmentBudget,
        preferredIndustry: req.body.preferredIndustry,
        minimumReadinessScore: req.body.minimumReadinessScore || 0,
        requirementsJson: req.body.requirements || {}
      });
    }
    // Mentors don't need additional profile data

    // Generate JWT
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const userResult = await User.findByEmail(email);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Get role-specific data
    let profileData = { ...user };
    
    if (user.role === 'entrepreneur') {
      const entrepreneurData = await Entrepreneur.findByUserId(user.id);
      if (entrepreneurData.rows.length > 0) {
        profileData = { ...profileData, ...entrepreneurData.rows[0] };
      }
    } else if (user.role === 'funder') {
      const funderData = await db.query(
        'SELECT * FROM funders WHERE funder_id = $1',
        [user.id]
      );
      if (funderData.rows.length > 0) {
        profileData = { ...profileData, ...funderData.rows[0] };
      }
    }

    res.json({ user: profileData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
