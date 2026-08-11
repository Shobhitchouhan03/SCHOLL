import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, User, Lock, AlertCircle } from 'lucide-react';

const SuperAdminLoginPage = () => {
  const navigate = useNavigate();
  const { loginSuperAdmin } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginSuperAdmin(loginId, password);
      if (res.success) {
        navigate('/super-admin/dashboard');
      }
    } catch (err) {
      setError(err.customMessage || err.message || 'Super Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-darkBrown/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-chestnut/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-almond/50 p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-darkBrown text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-darkBrown tracking-tight">Super Admin Portal</h2>
          <p className="text-xs text-textMuted mt-1">Platform Control & Multi-Tenant Management</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">Email, Phone Number or Super Admin ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-textMuted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter email, phone number or Super Admin ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-darkBrown transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-textMuted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-darkBrown transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-darkBrown hover:bg-chestnut text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authenticate Super Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs text-chestnut hover:text-darkBrown font-medium transition-colors">
            ← Switch to School User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;
