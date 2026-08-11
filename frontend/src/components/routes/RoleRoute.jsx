import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, school, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-chestnut/30 border-t-chestnut rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Principal setup wizard redirection guard
  if (user.role === 'principal' && school) {
    const isSetupCompleted = school.setupStatus === 'completed';
    const isSetupPath = location.pathname.startsWith('/principal/setup');

    if (!isSetupCompleted && !isSetupPath) {
      return <Navigate to="/principal/setup" replace />;
    }
    if (isSetupCompleted && isSetupPath) {
      return <Navigate to="/principal/dashboard" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'superAdmin') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'principal') {
      return school?.setupStatus === 'completed'
        ? <Navigate to="/principal/dashboard" replace />
        : <Navigate to="/principal/setup" replace />;
    }
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'parent') return <Navigate to="/parent/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleRoute;
