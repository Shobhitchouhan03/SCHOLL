import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

const FeeCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [categoryType, setCategoryType] = useState('tuition');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/fees/categories');
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/fees/categories', {
        name,
        code,
        categoryType,
        description,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setName('');
        setCode('');
        setDescription('');
        fetchCategories();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to create fee category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/fees')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Fee Dashboard</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Fee Setup</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Fee Categories Directory
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Define fee heads (Tuition, Admission, Examination, Activity, etc.) used in school fee structures.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Fee Category</span>
            </button>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Active Fee Categories ({categories.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No fee categories created yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <div key={c._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut uppercase">
                        {c.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success capitalize">
                        {c.categoryType}
                      </span>
                    </div>

                    <h4 className="font-bold text-darkBrown text-sm">{c.name}</h4>
                    <p className="text-xs text-textMuted">{c.description || 'No description provided.'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Create Fee Category</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuition Fee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Category Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TUITION"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Category Type</label>
                <select
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut capitalize"
                >
                  <option value="tuition">Tuition</option>
                  <option value="admission">Admission</option>
                  <option value="examination">Examination</option>
                  <option value="activity">Activity</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="annual">Annual</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCategoriesPage;
