import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Bus, MapPin, Clock, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';

const ParentTransportPage = () => {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/parent/children/${studentId}/transport`);
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error('Fetch parent transport error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransport();
  }, [studentId]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Portal</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              Transport & Route Details
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              View assigned route, pickup/drop stop timing, vehicle details, driver contact, and GPS status.
            </p>
          </div>

          {/* GPS Tracking Banner */}
          <div className="p-4 bg-morning/10 rounded-2xl border border-morning/30 flex items-center justify-between text-xs text-darkBrown">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-morning shrink-0" />
              <div>
                <strong className="block font-bold">Live GPS Tracking — Coming Soon</strong>
                <span className="text-textMuted">Provider telemetry tracking is not configured for this school.</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-white border border-almond rounded-xl font-mono text-[10px] font-bold text-morning">
              Unconfigured
            </span>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : !data || !data.hasTransport ? (
            <div className="bg-white rounded-2xl border border-almond/40 p-12 text-center space-y-2">
              <Bus className="w-12 h-12 text-almond mx-auto" />
              <h3 className="text-base font-bold text-darkBrown">No Transport Assigned</h3>
              <p className="text-xs text-textMuted">No active school transport subscription has been assigned to {data?.studentName || 'your child'}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route & Stop Card */}
              <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-almond/30 pb-3">
                  <span className="text-xs font-bold text-chestnut uppercase">Assigned Route</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success uppercase">
                    {data.assignment.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-darkBrown">{data.assignment.routeId?.name}</h3>
                  <div className="text-textMuted font-mono">Route Code: {data.assignment.routeId?.code}</div>
                </div>

                <div className="pt-3 border-t border-almond/30 space-y-3">
                  <div className="p-3 bg-surface rounded-xl border border-almond/50 space-y-1">
                    <span className="text-[10px] font-bold text-chestnut uppercase">Pickup Stop</span>
                    <div className="font-bold text-darkBrown text-sm">{data.assignment.pickupStopId?.name || 'School Main Gate'}</div>
                    <div className="text-textMuted flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-chestnut" />
                      Pickup Time: {data.assignment.pickupStopId?.morningPickupTime || '07:30 AM'}
                    </div>
                  </div>

                  <div className="p-3 bg-surface rounded-xl border border-almond/50 space-y-1">
                    <span className="text-[10px] font-bold text-chestnut uppercase">Drop Stop</span>
                    <div className="font-bold text-darkBrown text-sm">{data.assignment.dropStopId?.name || 'School Main Gate'}</div>
                    <div className="text-textMuted flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-chestnut" />
                      Drop Time: {data.assignment.dropStopId?.afternoonDropTime || '02:30 PM'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle & Driver Card */}
              <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-almond/30 pb-3">
                  <span className="text-xs font-bold text-chestnut uppercase">Vehicle & Staff</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-chestnut/10 text-chestnut font-mono">
                    {data.assignment.routeId?.assignedVehicleId?.vehicleNumber || 'Bus Fleet'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-surface rounded-xl border border-almond/50 space-y-1">
                    <span className="text-[10px] font-bold text-textMuted uppercase">Vehicle Details</span>
                    <div className="font-bold text-darkBrown">
                      {data.assignment.routeId?.assignedVehicleId?.vehicleNumber} ({data.assignment.routeId?.assignedVehicleId?.registrationNumber})
                    </div>
                    <div className="text-textMuted capitalize">Type: {data.assignment.routeId?.assignedVehicleId?.vehicleType}</div>
                  </div>

                  {data.assignment.routeId?.assignedDriverId && (
                    <div className="p-3 bg-surface rounded-xl border border-almond/50 space-y-1">
                      <span className="text-[10px] font-bold text-textMuted uppercase">Assigned Driver</span>
                      <div className="font-bold text-darkBrown">{data.assignment.routeId?.assignedDriverId?.name}</div>
                      <div className="text-textMuted flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-chestnut" />
                        {data.assignment.routeId?.assignedDriverId?.phone}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentTransportPage;
