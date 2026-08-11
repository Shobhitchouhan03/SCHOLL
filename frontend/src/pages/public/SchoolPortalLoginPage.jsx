import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, Lock, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import axios from 'axios';
import { resolveSchoolPortalData } from '../../services/tenantResolver';

const SchoolPortalLoginPage = () => {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const { loginSchoolUser } = useAuth();

  const [schoolData, setSchoolData] = useState(null);
  const [loadingSchool, setLoadingSchool] = useState(true);
  const [schoolError, setSchoolError] = useState('');

  const [selectedRole, setSelectedRole] = useState('teacher'); // 'principal' | 'teacher' | 'parent'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        setLoadingSchool(true);
        setSchoolError('');
        const resData = await resolveSchoolPortalData(schoolSlug);
        if (resData.success) {
          setSchoolData(resData.school);
        } else {
          setSchoolError(resData.message || 'School portal not found.');
        }
      } catch (err) {
        console.error('Fetch school portal error:', err);
        setSchoolError(err.response?.data?.message || 'School portal not found for this address.');
      } finally {
        setLoadingSchool(false);
      }
    };

    fetchSchoolInfo();
  }, [schoolSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schoolData) return;

    setError('');
    setSubmitting(true);

    try {
      const res = await loginSchoolUser(schoolData.schoolCode, loginId.trim(), password);
      if (res.success) {
        const userRole = res.user.role;
        if (userRole === 'principal') navigate('/principal/dashboard');
        else if (userRole === 'teacher') navigate('/teacher/dashboard');
        else if (userRole === 'parent') navigate('/parent/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.customMessage || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSchool) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-chestnut border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-textMuted">Loading School Portal...</p>
        </div>
      </div>
    );
  }

  if (schoolError || !schoolData) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-almond text-center shadow-xl">
          <div className="w-14 h-14 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-darkBrown mb-2">School Portal Not Found</h2>
          <p className="text-xs text-textMuted mb-6">{schoolError || 'The requested school URL is invalid or inactive.'}</p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-chestnut text-white font-bold text-xs rounded-xl hover:bg-chestnut/90 transition-all shadow-md"
          >
            <span>Go to Standard Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const primaryBgStyle = { backgroundColor: schoolData.primaryColor || '#8B263E' };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={primaryBgStyle}
      />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-almond/50 p-8 relative z-10">
        {/* School Branding Header */}
        <div className="text-center mb-6">
          {schoolData.logoUrl ? (
            <img
              src={schoolData.logoUrl}
              alt={schoolData.name}
              className="w-16 h-16 object-contain mx-auto mb-3 rounded-2xl p-1 border border-almond/40 shadow-sm"
            />
          ) : (
            <div
              className="w-16 h-16 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-3 shadow-md"
              style={primaryBgStyle}
            >
              {schoolData.name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-black text-darkBrown tracking-tight">{schoolData.name}</h1>
          <p className="text-xs font-semibold text-textMuted mt-1">{schoolData.portalTitle || 'School Management Portal'}</p>
          <span className="inline-block mt-2 px-2.5 py-1 bg-surface border border-almond/60 rounded-full text-[10px] font-mono font-bold text-textMuted">
            CODE: {schoolData.schoolCode}
          </span>
        </div>

        {/* Role Tab Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-surface rounded-xl border border-almond/40 mb-6">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('principal');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center space-y-1 ${
              selectedRole === 'principal'
                ? 'bg-white text-darkBrown shadow-sm border border-almond/40'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Principal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('teacher');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center space-y-1 ${
              selectedRole === 'teacher'
                ? 'bg-white text-darkBrown shadow-sm border border-almond/40'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('parent');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center space-y-1 ${
              selectedRole === 'parent'
                ? 'bg-white text-darkBrown shadow-sm border border-almond/40'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parent</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">School Code</label>
            <div className="relative">
              <Building className="w-4 h-4 text-textMuted absolute left-3.5 top-3" />
              <input
                type="text"
                disabled
                value={schoolData.schoolCode}
                className="w-full pl-10 pr-4 py-2.5 bg-surface/70 border border-almond/60 rounded-xl text-sm font-mono font-bold text-darkBrown cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">Email, Phone Number or Login ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-textMuted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter email, phone number or login ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut focus:ring-1 focus:ring-chestnut transition-all"
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
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut focus:ring-1 focus:ring-chestnut transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-white text-xs font-bold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            style={primaryBgStyle}
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span className="capitalize">Sign In as {selectedRole}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-almond/40 text-center">
          <Link to="/login" className="text-xs font-semibold text-textMuted hover:text-darkBrown transition-all">
            Standard Login Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SchoolPortalLoginPage;
