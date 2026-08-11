import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import {
  Sparkles,
  Save,
  Image,
  FileText,
  Building,
  CheckCircle,
  AlertCircle,
  Palette,
  Eye,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';

const PrincipalBrandingPage = () => {
  const navigate = useNavigate();
  const { school } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    tagline: '',
    primaryColor: '#8B263E',
    secondaryColor: '#D8A47F',
    logoUrl: '',
    bannerUrl: '',
    letterheadUrl: '',
    sealUrl: '',
    principalName: '',
    principalSignatureUrl: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/branding');
      if (res.data.success && res.data.branding) {
        setFormData({
          name: res.data.branding.name || school?.name || '',
          shortName: res.data.branding.shortName || '',
          tagline: res.data.branding.tagline || '',
          primaryColor: res.data.branding.primaryColor || '#8B263E',
          secondaryColor: res.data.branding.secondaryColor || '#D8A47F',
          logoUrl: res.data.branding.logoUrl || '',
          bannerUrl: res.data.branding.bannerUrl || '',
          letterheadUrl: res.data.branding.letterheadUrl || '',
          sealUrl: res.data.branding.sealUrl || '',
          principalName: res.data.branding.principalName || '',
          principalSignatureUrl: res.data.branding.principalSignatureUrl || '',
          address: res.data.branding.address || '',
          phone: res.data.branding.phone || '',
          email: res.data.branding.email || '',
          website: res.data.branding.website || '',
        });
      }
    } catch (err) {
      console.error('Failed to load branding', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const res = await api.put('/principal/branding', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'School branding settings saved successfully!' });
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save branding settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-chestnut border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-almond/40 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-chestnut" />
                <span>School Branding & Visual Assets</span>
              </h1>
              <p className="text-xs text-textMuted mt-1">
                Customize official school colors, logos, document letterheads, seals, and printable themes.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={fetchBranding}
                className="px-3.5 py-2 bg-white border border-almond/60 text-xs font-semibold text-textMain rounded-xl shadow-sm hover:bg-surface flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>

              <button
                onClick={() => navigate('/principal/dashboard')}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-almond/40 text-darkBrown font-bold text-xs border border-almond/50 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-chestnut" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-sage/20 border border-sage text-darkBrown'
              : 'bg-danger/10 border border-danger/20 text-danger'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity & Tagline */}
        <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-darkBrown flex items-center space-x-2 border-b border-almond/40 pb-3">
            <Building className="w-4 h-4 text-chestnut" />
            <span>Institution Identity & Tagline</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Official School Name</label>
              <input
                type="text"
                disabled
                value={formData.name}
                className="w-full px-3.5 py-2.5 bg-surface/50 border border-almond/60 rounded-xl text-sm font-bold text-darkBrown cursor-not-allowed"
              />
              <span className="text-[10px] text-textMuted mt-0.5 block">Managed by platform Super Admin</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Short Name / Abbreviation</label>
              <input
                type="text"
                placeholder="e.g. DPS International"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-textMain mb-1">School Tagline / Motto</label>
              <input
                type="text"
                placeholder="e.g. Excellence in Education & Character"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
              />
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-darkBrown flex items-center space-x-2 border-b border-almond/40 pb-3">
            <Palette className="w-4 h-4 text-chestnut" />
            <span>Portal & Document Palette</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Primary Color (Hex)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-almond/60 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm font-mono focus:outline-none focus:border-chestnut"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Secondary Accent Color (Hex)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-almond/60 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm font-mono focus:outline-none focus:border-chestnut"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media & Image Assets */}
        <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-darkBrown flex items-center space-x-2 border-b border-almond/40 pb-3">
            <Image className="w-4 h-4 text-chestnut" />
            <span>Logo, Banners & Official Seals</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">School Crest / Logo URL</label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
              />
              {formData.logoUrl && (
                <div className="mt-2 p-2 bg-surface rounded-xl border border-almond/40 inline-block">
                  <img src={formData.logoUrl} alt="Logo Preview" className="h-12 max-w-full object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Portal Hero Banner URL</label>
              <input
                type="url"
                placeholder="https://example.com/banner.jpg"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Document Letterhead Header URL</label>
              <input
                type="url"
                placeholder="https://example.com/letterhead.png"
                value={formData.letterheadUrl}
                onChange={(e) => setFormData({ ...formData, letterheadUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Official School Seal / Stamp URL</label>
              <input
                type="url"
                placeholder="https://example.com/seal.png"
                value={formData.sealUrl}
                onChange={(e) => setFormData({ ...formData, sealUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
              />
            </div>
          </div>
        </div>

        {/* Principal Signatory Info */}
        <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-darkBrown flex items-center space-x-2 border-b border-almond/40 pb-3">
            <FileText className="w-4 h-4 text-chestnut" />
            <span>Principal Signatory Credentials</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Principal Full Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. Eleanor Vance"
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Principal Digital Signature URL</label>
              <input
                type="url"
                placeholder="https://example.com/signature.png"
                value={formData.principalSignatureUrl}
                onChange={(e) => setFormData({ ...formData, principalSignatureUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-chestnut hover:bg-darkBrown text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Branding Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
        </main>
      </div>
    </div>
  );
};

export default PrincipalBrandingPage;
