import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Award,
  ArrowLeft,
  Send,
  RefreshCw,
  CheckCircle2,
  Printer,
} from 'lucide-react';

const PrincipalResultsConsolePage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [classesList, setClassesList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/classes');
      if (res.data.success && res.data.classes?.length > 0) {
        setClassesList(res.data.classes);
        setSelectedClassId(res.data.classes[0]._id);
      }
    } catch (err) {
      console.error('Fetch classes error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleGenerateResults = async () => {
    if (!selectedClassId) return;
    setGenerating(true);
    try {
      const res = await api.post(`/principal/exams/${examId}/generate-results`, { classId: selectedClassId });
      if (res.data.success) {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to generate results.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishResults = async () => {
    setPublishing(true);
    try {
      const res = await api.post(`/principal/exams/${examId}/publish-results`);
      if (res.data.success) {
        alert('Results published successfully!');
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to publish results.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/exams')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exams Directory</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Principal Results Console</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Result Generation & Publication Console
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Generate student grade calculations from approved marks and publish final report cards.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleGenerateResults}
                disabled={generating}
                className="px-4 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 text-chestnut" />
                <span>{generating ? 'Calculating...' : 'Generate Results'}</span>
              </button>

              <button
                onClick={handlePublishResults}
                disabled={publishing}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{publishing ? 'Publishing...' : 'Publish Results to Parents'}</span>
              </button>
            </div>
          </div>

          {/* Scope Selector */}
          <div className="bg-white rounded-2xl p-4 border border-almond/40 shadow-card flex items-center gap-3">
            <label className="text-xs font-bold text-darkBrown">Select Target Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut"
            >
              {classesList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrincipalResultsConsolePage;
