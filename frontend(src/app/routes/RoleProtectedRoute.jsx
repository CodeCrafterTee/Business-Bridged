// src/app/routes/RoleProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../../services/authService';

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const token = authService.getToken();
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Decode token outside of try/catch
  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch (error) {
    console.error('Invalid token:', error);
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  const userRole = decoded.role;
  
  // Check if user has allowed role
  if (!allowedRoles.includes(userRole)) {
    // Move role-based redirects outside of try/catch
    const redirectPath = getRedirectPath(userRole);
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
}

// Helper function to get redirect path based on role
const getRedirectPath = (role) => {
  switch(role) {
    case 'entrepreneur':
      return '/app/dashboard';
    case 'mentor':
      return '/app/mentor';
    case 'funder':
      return '/app/funder';
    default:
      return '/dashboard';
  }
};