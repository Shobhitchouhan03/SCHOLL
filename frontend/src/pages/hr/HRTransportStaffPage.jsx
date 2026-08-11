import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Users, Bus, Plus, UserCheck, Phone, Award } from 'lucide-react';

const HRTransportStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [staffType, setStaffType] = useState('driver');
  const [phone, setPhone] = useState('');
  const [licenceNo, setLicenceNo] = useState('');
  const [formError, setFormError] = useState('');

  const fetchTransportStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/transport/staff');
      if (res.data?.success) {
        setStaff(res.data.staff || []);
      }
    } catch (err) {
      console.error('Fetch transport staff error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/transport/staff', {
        name: staffName,
        employeeCode: empCode,
        staffType,
        phone,
        licenceNumber: licenceNo,
      });
      if (res.data.success) {
        setIsStaffModalOpen(false);
        setStaffName('');
        setEmpCode('');
        setPhone('');
        setLicenceNo('');
        fetchTransportStaff();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add transport staff.');
    }
  };

  const driversCount = staff.filter((s) => s.staffType === 'driver').length;
  const attendantsCount = staff.filter((s) => s.staffType === 'attendant').length;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Transport HR Management</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Drivers & Bus Attendants
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Onboard drivers, bus attendants, manage license details, contacts, and HR records.
              </p>
            </div>

            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transport Staff</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Transport Staff" value={staff.length} subtitle="Fleet personnel" icon={Users} color="chestnut" />
            <StatCard title="Licensed Drivers" value={driversCount} subtitle="Bus / Van drivers" icon={Bus} color="morning" />
            <StatCard title="Bus Attendants" value={attendantsCount} subtitle="Student safety staff" icon={UserCheck} color="success" />
          </div>

          {/* Transport Staff Directory */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Drivers & Attendants Directory ({staff.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : staff.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No transport staff added yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                      <th className="py-3 px-4">Staff Name</th>
                      <th className="py-3 px-4">Employee Code</th>
                      <th className="py-3 px-4">Staff Type</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">License Number</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20">
                    {staff.map((s) => (
                      <tr key={s._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-darkBrown">{s.name}</td>
                        <td className="py-3 px-4 font-mono text-chestnut font-bold">{s.employeeCode || 'N/A'}</td>
                        <td className="py-3 px-4 capitalize font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            s.staffType === 'driver' ? 'bg-morning/15 text-morning' : 'bg-success/15 text-success'
                          }`}>
                            {s.staffType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-textMuted">{s.phone}</td>
                        <td className="py-3 px-4 font-mono">{s.licenceNumber || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Staff Modal */}
          {isStaffModalOpen && (
            <div className="fixed inset-0 bg-darkBrown/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-almond/50 shadow-2xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-base font-bold text-darkBrown">Add Transport Staff Member</h3>

                {formError && <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs">{formError}</div>}

                <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-textMain mb-1">Full Name</label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full p-2 bg-surface border border-almond rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-textMain mb-1">Employee Code</label>
                      <input
                        type="text"
                        value={empCode}
                        onChange={(e) => setEmpCode(e.target.value)}
                        placeholder="EMP-DRV-01"
                        className="w-full p-2 bg-surface border border-almond rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-textMain mb-1">Staff Role</label>
                      <select
                        value={staffType}
                        onChange={(e) => setStaffType(e.target.value)}
                        className="w-full p-2 bg-surface border border-almond rounded-xl"
                      >
                        <option value="driver">Driver</option>
                        <option value="attendant">Attendant</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-textMain mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full p-2 bg-surface border border-almond rounded-xl"
                      required
                    />
                  </div>

                  {staffType === 'driver' && (
                    <div>
                      <label className="block font-semibold text-textMain mb-1">Driving License Number</label>
                      <input
                        type="text"
                        value={licenceNo}
                        onChange={(e) => setLicenceNo(e.target.value)}
                        placeholder="DL-1420110012345"
                        className="w-full p-2 bg-surface border border-almond rounded-xl"
                        required
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsStaffModalOpen(false)}
                      className="px-4 py-2 border border-almond rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-chestnut text-white rounded-xl font-bold hover:bg-darkBrown"
                    >
                      Save Transport Staff
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HRTransportStaffPage;
