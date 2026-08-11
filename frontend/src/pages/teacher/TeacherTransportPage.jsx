import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Bus, MapPin, Users } from 'lucide-react';

const TeacherTransportPage = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/transport/routes');
      if (res.data.success && res.data.routes?.length > 0) {
        setRoutes(res.data.routes);
        setSelectedRouteId(res.data.routes[0]._id);
      }
    } catch (err) {
      console.error('Fetch routes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteStudents = async (routeId) => {
    if (!routeId) return;
    try {
      setLoading(true);
      const res = await api.get(`/teacher/transport/routes/${routeId}/students`);
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      console.error('Fetch route students error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRouteId) fetchRouteStudents(selectedRouteId);
  }, [selectedRouteId]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Teacher Workspace</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              Transport Roster & Route Students
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              View route-wise student rosters, pickup/drop stops, and timings for authorized students.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-bold text-darkBrown">Route Student Directory</h3>
              {routes.length > 0 && (
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-bold"
                >
                  {routes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : assignments.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No students assigned to this route.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Pickup Stop</th>
                      <th className="py-3 px-4">Pickup Time</th>
                      <th className="py-3 px-4">Drop Stop</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20">
                    {assignments.map((a) => (
                      <tr key={a._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-darkBrown">{a.studentId?.name}</td>
                        <td className="py-3 px-4 text-textMuted">{a.studentId?.classId?.name}</td>
                        <td className="py-3 px-4 font-bold text-chestnut">{a.pickupStopId?.name || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono text-textMuted">{a.pickupStopId?.morningPickupTime || 'N/A'}</td>
                        <td className="py-3 px-4 text-textMuted">{a.dropStopId?.name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherTransportPage;
