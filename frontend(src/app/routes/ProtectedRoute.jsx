// src/app/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../../services/authService';

export default function ProtectedRoute({ children }) {
  const token = authService.getToken();
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Validate token
  try {
    jwtDecode(token);
    return children;
  } catch (error) {
    console.error('Invalid token:', error);
    authService.logout();
    return <Navigate to="/login" replace />;
  }
}