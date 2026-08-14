import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  // Workspace Mode (Principal vs HR Workspace)
  const [workspaceMode, setWorkspaceModeState] = useState(() => {
    return localStorage.getItem('app-workspace-mode') || 'principal';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setWorkspaceMode = (mode) => {
    setWorkspaceModeState(mode);
    localStorage.setItem('app-workspace-mode', mode);
  };

  const toggleWorkspaceMode = () => {
    const nextMode = workspaceMode === 'principal' ? 'hr' : 'principal';
    setWorkspaceMode(nextMode);
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      if (response.data.success) {
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
        }
        setUser(response.data.user);
        setSchool(response.data.school);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
      }
      setUser(null);
      setSchool(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginSuperAdmin = async (identifier, password) => {
    const response = await api.post('/auth/super-admin/login', {
      identifier,
      loginId: identifier,
      password,
    });
    if (response.data.success) {
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      setUser(response.data.user);
      setSchool(response.data.school);
    }
    return response.data;
  };

  const loginSchoolUser = async (schoolCode, identifier, password) => {
    const response = await api.post('/auth/school/login', {
      schoolCode,
      identifier,
      loginId: identifier,
      password,
    });
    if (response.data.success) {
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      setUser(response.data.user);
      setSchool(response.data.school);
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setSchool(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        school,
        loading,
        theme,
        toggleTheme,
        workspaceMode,
        setWorkspaceMode,
        toggleWorkspaceMode,
        loginSuperAdmin,
        loginSchoolUser,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
