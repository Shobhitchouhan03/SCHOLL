import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  LogOut,
  User as UserIcon,
  Shield,
  Building,
  Menu,
  Bell,
  Sun,
  Moon,
  Briefcase,
  LayoutDashboard,
} from 'lucide-react';

const Header = ({ onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const {
    user,
    school,
    logout,
    theme,
    toggleTheme,
    workspaceMode,
    setWorkspaceMode,
  } = useAuth();

  const handleWorkspaceSwitch = () => {
    if (workspaceMode === 'hr') {
      setWorkspaceMode('principal');
      navigate('/principal/dashboard');
    } else {
      setWorkspaceMode('hr');
      navigate('/principal/hr');
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Silent error for unauthenticated state
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superAdmin':
        return 'bg-darkBrown text-white';
      case 'principal':
        return 'bg-chestnut text-white';
      case 'teacher':
        return 'bg-morning text-white';
      case 'parent':
        return 'bg-success text-white';
      default:
        return 'bg-almond text-textMain';
    }
  };

  const formatRoleName = (role) => {
    switch (role) {
      case 'superAdmin':
        return 'Super Admin';
      case 'principal':
        return workspaceMode === 'hr' ? 'HR Workspace' : 'Principal';
      case 'teacher':
        return 'Teacher';
      case 'parent':
        return 'Parent';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white border-b border-almond/40 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-card flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 text-textMuted hover:text-textMain hover:bg-surface rounded-lg transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-chestnut flex items-center justify-center text-white font-bold text-lg shadow-sm">
            A
          </div>
          <div>
            <h1 className="text-base font-bold text-darkBrown leading-tight">AcademiaPro</h1>
            {school ? (
              <span className="text-xs font-medium text-textMuted flex items-center gap-1">
                <Building className="w-3 h-3 text-morning" />
                {school.name} ({school.schoolCode})
              </span>
            ) : (
              <span className="text-xs font-medium text-textMuted flex items-center gap-1">
                <Shield className="w-3 h-3 text-darkBrown" />
                SaaS Control Center
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Workspace Switcher Button for Principal */}
        {user && user.role === 'principal' && (
          <button
            onClick={handleWorkspaceSwitch}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
              workspaceMode === 'hr'
                ? 'bg-morning text-white hover:bg-darkBrown'
                : 'bg-chestnut text-white hover:bg-darkBrown'
            }`}
          >
            {workspaceMode === 'hr' ? (
              <>
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch Back to Principal Workspace</span>
                <span className="sm:hidden">Principal</span>
              </>
            ) : (
              <>
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch to HR Workspace</span>
                <span className="sm:hidden">HR Mode</span>
              </>
            )}
          </button>
        )}

        {/* Theme Toggle Button (Light/Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-surface border border-almond/60 hover:bg-almond/30 text-darkBrown transition-all"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-warning" />}
        </button>

        {/* Notification Bell */}
        {user && user.role !== 'superAdmin' && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 rounded-xl bg-surface border border-almond/60 hover:bg-almond/30 text-darkBrown transition-all relative"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-almond/50 shadow-2xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-almond/30">
                  <h4 className="text-xs font-bold text-darkBrown">In-App Notifications</h4>
                  <span className="text-[10px] font-bold text-chestnut">{unreadCount} Unread</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-textMuted text-xs">No notifications.</div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkRead(n._id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          n.status === 'read'
                            ? 'bg-surface/50 border-almond/30 text-textMuted'
                            : 'bg-chestnut/5 border-chestnut/30 text-darkBrown font-semibold'
                        }`}
                      >
                        <div className="font-bold text-darkBrown">{n.title}</div>
                        <div className="text-[11px] text-textMuted line-clamp-2">{n.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Info Badge */}
        <div className="hidden sm:flex items-center space-x-3 pr-2 border-r border-almond/40">
          <div className="w-8 h-8 rounded-full bg-surface border border-almond flex items-center justify-center text-textMuted font-bold text-xs">
            {user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-textMain">{user?.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block ${getRoleBadgeColor(user?.role)}`}>
              {formatRoleName(user?.role)}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-almond text-textMuted hover:text-danger hover:border-danger/30 hover:bg-danger/5 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
