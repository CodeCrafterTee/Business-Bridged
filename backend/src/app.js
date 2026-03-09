const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const entrepreneurRoutes = require('./routes/entrepreneurRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const funderRoutes = require('./routes/funderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add this after app.use(express.urlencoded({ extended: true }));
console.log('🔍 Route imports:');
console.log('authRoutes:', typeof authRoutes, authRoutes ? '✅' : '❌');
console.log('entrepreneurRoutes:', typeof entrepreneurRoutes, entrepreneurRoutes ? '✅' : '❌');
console.log('mentorRoutes:', typeof mentorRoutes, mentorRoutes ? '✅' : '❌');
console.log('funderRoutes:', typeof funderRoutes, funderRoutes ? '✅' : '❌');
console.log('adminRoutes:', typeof adminRoutes, adminRoutes ? '✅' : '❌');

// Add this after app.use(express.urlencoded({ extended: true }));
console.log('🔍 Route imports:');
console.log('authRoutes:', typeof authRoutes, authRoutes ? 'function' : 'undefined');
console.log('entrepreneurRoutes:', typeof entrepreneurRoutes, entrepreneurRoutes ? 'function' : 'undefined');
console.log('mentorRoutes:', typeof mentorRoutes, mentorRoutes ? 'function' : 'undefined');
console.log('funderRoutes:', typeof funderRoutes, funderRoutes ? 'function' : 'undefined');
console.log('adminRoutes:', typeof adminRoutes, adminRoutes ? 'function' : 'undefined');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entrepreneur', entrepreneurRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/funder', funderRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
