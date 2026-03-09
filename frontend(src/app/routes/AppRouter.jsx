// src/app/routes/AppRouter.jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';

// Public pages
import Landing from '../../pages/public/Landing';
import Start from '../../pages/public/Start';
import ScoreAssessment from '../../pages/public/ScoreAssessment'; // NEW - Public score assessment

// Auth pages
import Login from '../../pages/auth/Login';
import Register from '../../pages/auth/Register';

// App pages
import Dashboard from '../../pages/app/Dashboard';
import Intake from '../../pages/app/Intake';
import Vault from '../../pages/app/Vault';
import Score from '../../pages/app/Score';
import ScoreExplanation from '../../pages/app/ScoreExplanation';
import EntrepreneurPortal from '../../pages/app/EntrepreneurPortal';
import Grooming from '../../pages/app/Grooming';
import StressTest from '../../pages/app/StressTest';
import FunderPortal from '../../pages/app/FunderPortal';
import MentorPortal from '../../pages/app/MentorPortal';
import Accessibility from '../../pages/app/Accessibility';
import FinalStage from '../../pages/app/FinalStage';
import ApplyFunding from '../../pages/app/ApplyFunding';
import MentorSearch from '../../pages/app/MentorSearch';
import MentorSessions from '../../pages/app/MentorSessions';
import FunderMatches from '../../pages/app/FunderMatches'; 
import Settings from '../../pages/app/Settings';
import Help from '../../pages/app/Help';
import Contact from '../../pages/app/Contact';
import Verification from '../../pages/app/Verification';
import FunderProfile from '../../pages/app/FunderProfile';
import MentorResources from '../../pages/app/MentorResources';


// Mentor sub-pages
import MentorEntrepreneurs from '../../pages/app/MentorEntrepreneurs';
import MentorEntrepreneurDetail from '../../pages/app/MentorEntrepreneurDetail';
import MentorSchedule from '../../pages/app/MentorSchedule';

export default function AppRouter() {
  return (
    <Routes>
      {/* 🌐 PUBLIC ROUTES - No authentication required */}
      <Route path="/" element={<Landing />} />
      <Route path="/start" element={<Start />} />
      <Route path="/score-assessment" element={<ScoreAssessment />} /> {/* NEW - Public score tool */}
      
      {/* 🔐 AUTH ROUTES - For login/register */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🛡️ PROTECTED ROUTES - Require authentication */}
      
      {/* Entrepreneur Routes */}
      <Route path="/app/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/app/intake" element={
        <ProtectedRoute>
          <Intake />
        </ProtectedRoute>
      } />
      
      <Route path="/app/vault" element={
        <ProtectedRoute>
          <Vault />
        </ProtectedRoute>
      } />
      
      <Route path="/app/score" element={
        <ProtectedRoute>
          <Score />
        </ProtectedRoute>
      } />
      
      <Route path="/app/score-explanation" element={
        <ProtectedRoute>
          <ScoreExplanation />
        </ProtectedRoute>
      } />
      
      <Route path="/app/grooming" element={
        <ProtectedRoute>
          <Grooming />
        </ProtectedRoute>
      } />
      
      <Route path="/app/stress-test" element={
        <ProtectedRoute>
          <StressTest />
        </ProtectedRoute>
      } />
      
      <Route path="/app/accessibility" element={
        <ProtectedRoute>
          <Accessibility />
        </ProtectedRoute>
      } />
      
      <Route path="/app/mentor-sessions" element={
  <ProtectedRoute>
    <MentorSessions />
  </ProtectedRoute>
} />

<Route path="/app/help" element={
  <ProtectedRoute>
    <Help />
  </ProtectedRoute>
} />

<Route path="/app/contact" element={
  <ProtectedRoute>
    <Contact />
  </ProtectedRoute>
} />

<Route path="/app/verification" element={
  <ProtectedRoute>
    <Verification />
  </ProtectedRoute>
} />

<Route path="/app/funder-matches" element={
  <ProtectedRoute>
    <FunderMatches />
  </ProtectedRoute>
} />

<Route path="/app/settings" element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />

      <Route path="/app/final-stage" element={
        <ProtectedRoute>
          <FinalStage />
        </ProtectedRoute>
      } />
      
      <Route path="/app/apply-funding" element={
        <ProtectedRoute>
          <ApplyFunding />
        </ProtectedRoute>
      } />

      {/* 👑 ROLE-SPECIFIC PORTALS - Require specific roles */}
      
      <Route path="/app/entrepreneur" element={
        <RoleProtectedRoute allowedRoles={['entrepreneur']}>
          <EntrepreneurPortal />
        </RoleProtectedRoute>
      } />
      
      {/* Mentor Routes */}
      <Route path="/app/mentor" element={
        <RoleProtectedRoute allowedRoles={['mentor']}>
          <MentorPortal />
        </RoleProtectedRoute>
      } />
      
      <Route path="/app/mentor/entrepreneurs" element={
        <RoleProtectedRoute allowedRoles={['mentor']}>
          <MentorEntrepreneurs />
        </RoleProtectedRoute>
      } />
      
      <Route path="/app/mentor/entrepreneurs/:id" element={
        <RoleProtectedRoute allowedRoles={['mentor']}>
          <MentorEntrepreneurDetail />
        </RoleProtectedRoute>
      } />
      
      <Route path="/app/mentor/schedule" element={
        <RoleProtectedRoute allowedRoles={['mentor']}>
          <MentorSchedule />
        </RoleProtectedRoute>
      } />
      <Route path="/app/mentor-search" element={
  <ProtectedRoute>
    <MentorSearch />
  </ProtectedRoute>
} />
<Route path="/app/mentor/resources" element={
  <RoleProtectedRoute allowedRoles={['mentor']}>
    <MentorResources />
  </RoleProtectedRoute>
} />


      {/* Funder Routes */}
      <Route path="/app/funder" element={
        <RoleProtectedRoute allowedRoles={['funder']}>
          <FunderPortal />
        </RoleProtectedRoute>
      } />

      <Route path="/app/funder/profile" element={
  <RoleProtectedRoute allowedRoles={['funder']}>
    <FunderProfile />
  </RoleProtectedRoute>
} />
    </Routes>
  );
}