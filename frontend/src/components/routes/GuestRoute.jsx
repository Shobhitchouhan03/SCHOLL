import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { user, school, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-chestnut/30 border-t-chestnut rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    if (user.role === 'superAdmin') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'principal') {
      return school?.setupStatus === 'completed'
        ? <Navigate to="/principal/dashboard" replace />
        : <Navigate to="/principal/setup" replace />;
    }
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'parent') return <Navigate to="/parent/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;
