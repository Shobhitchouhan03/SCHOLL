import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building,
  GraduationCap,
  Calendar,
  Briefcase,
  Image,
  LogIn,
  Mail,
  Phone,
  MapPin,
  Globe,
  Sparkles,
  ChevronRight,
  Bell,
} from 'lucide-react';
import api from '../../services/api';
import { resolveSchoolPortalData } from '../../services/tenantResolver';

const PublicSchoolWebsitePage = () => {
  const { schoolSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchoolData();
  }, [schoolSlug]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError('');
      const resData = await resolveSchoolPortalData(schoolSlug);
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'School portal not found.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-chestnut border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data?.school) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-almond/60 shadow-xl max-w-md text-center">
          <Building className="w-12 h-12 text-textMuted mx-auto mb-3 opacity-40" />
          <h2 className="text-xl font-bold text-darkBrown">School Website Not Found</h2>
          <p className="text-xs text-textMuted mt-1 mb-4">{error || 'Invalid school portal URL.'}</p>
          <Link
            to="/login"
            className="px-4 py-2 bg-chestnut text-white text-xs font-bold rounded-xl inline-block"
          >
            Go to Main Portal Login
          </Link>
        </div>
      </div>
    );
  }

  const { school, notices = [], jobs = [], gallery = [] } = data;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-almond/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {school.logoUrl ? (
              <img src={school.logoUrl} alt={school.name} className="h-12 w-12 object-contain rounded-xl" />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md"
                style={{ backgroundColor: school.primaryColor || '#8B263E' }}
              >
                {school.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-lg font-black text-darkBrown tracking-tight">{school.name}</h1>
              <p className="text-xs text-textMuted flex items-center space-x-2">
                <span className="capitalize font-semibold text-chestnut">{school.schoolType || 'K-12'}</span>
                <span>•</span>
                <span>Code: {school.schoolCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to={`/s/${school.schoolSlug}/jobs`}
              className="px-4 py-2 text-xs font-bold text-darkBrown bg-morning/10 hover:bg-morning/20 rounded-xl border border-morning/20 transition-all flex items-center space-x-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-chestnut" />
              <span>Careers ({jobs.length})</span>
            </Link>

            <Link
              to={`/s/${school.schoolSlug}/login`}
              className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center space-x-2"
              style={{ backgroundColor: school.primaryColor || '#8B263E' }}
            >
              <LogIn className="w-4 h-4" />
              <span>Portal Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative bg-darkBrown text-white overflow-hidden py-16 sm:py-24">
        {school.bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${school.bannerUrl})` }}
          />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide border border-white/20 uppercase">
            {school.tagline || 'Excellence in Learning'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
            Welcome to {school.name}
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
            Empowering students with knowledge, character, and vision. Explore our campus highlights, announcements, and career opportunities.
          </p>

          <div className="pt-4 flex justify-center space-x-4">
            <Link
              to={`/s/${school.schoolSlug}/login`}
              className="px-6 py-3 bg-white text-darkBrown font-bold text-sm rounded-xl shadow-xl hover:bg-surface transition-all flex items-center space-x-2"
            >
              <span>Access Student / Parent Portal</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Latest Announcements / Notices */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-darkBrown flex items-center space-x-2">
                <Bell className="w-5 h-5 text-chestnut" />
                <span>School Announcements & Circulars</span>
              </h3>
              <p className="text-xs text-textMuted mt-0.5">Official public notices from the Principal</p>
            </div>
          </div>

          {notices.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-almond/60 text-center text-xs text-textMuted">
              No recent announcements posted.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notices.map((n) => (
                <div key={n._id} className="bg-white p-5 rounded-2xl border border-almond/60 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-morning/10 text-darkBrown rounded-md uppercase">
                    {n.category || 'Notice'}
                  </span>
                  <h4 className="text-sm font-bold text-darkBrown">{n.title}</h4>
                  <p className="text-xs text-textMuted line-clamp-3">{n.content}</p>
                  <div className="text-[11px] text-textMuted pt-2 border-t border-almond/40 flex justify-between">
                    <span>Date: {new Date(n.publishDate || n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Campus Gallery */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-darkBrown flex items-center space-x-2">
                <Image className="w-5 h-5 text-chestnut" />
                <span>Campus Photo Gallery</span>
              </h3>
              <p className="text-xs text-textMuted mt-0.5">Life at {school.name}</p>
            </div>
          </div>

          {gallery.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-almond/60 text-center text-xs text-textMuted">
              No photos currently published in the gallery.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((g) => (
                <div key={g._id} className="group relative h-48 bg-surface rounded-2xl overflow-hidden border border-almond/60 shadow-sm">
                  <img
                    src={g.imageUrl}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                    <div className="text-xs font-bold">{g.title}</div>
                    <div className="text-[10px] text-white/80 capitalize">{g.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contact & Address Footer Banner */}
        <section className="bg-white p-8 rounded-3xl border border-almond/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-darkBrown flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-chestnut" />
              <span>Campus Address</span>
            </h4>
            <p className="text-xs text-textMuted leading-relaxed">
              {school.address || 'Campus Address Available On Request'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-darkBrown flex items-center space-x-2">
              <Phone className="w-4 h-4 text-chestnut" />
              <span>Contact Phone & Email</span>
            </h4>
            <p className="text-xs text-textMuted">
              Phone: {school.phone || 'N/A'}<br />
              Email: {school.email || 'N/A'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-darkBrown flex items-center space-x-2">
              <Globe className="w-4 h-4 text-chestnut" />
              <span>Principal Office</span>
            </h4>
            <p className="text-xs text-textMuted">
              Principal: {school.principalName || 'School Head'}<br />
              Website: {school.website || 'N/A'}
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-almond/60 py-6 text-center text-xs text-textMuted">
        &copy; {new Date().getFullYear()} {school.name}. Powered by AcademiaPro Multi-Tenant SaaS.
      </footer>
    </div>
  );
};

export default PublicSchoolWebsitePage;
