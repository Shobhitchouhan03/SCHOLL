import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Bus,
  Users,
  MapPin,
  Plus,
  Wrench,
  Fuel,
  ShieldAlert,
  BarChart2,
  Settings,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Navigation,
} from 'lucide-react';

const PrincipalTransportPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'vehicles' | 'staff' | 'routes' | 'assignments' | 'maintenance' | 'fuel'
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);

  // Modals & Form States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [regNo, setRegNo] = useState('');
  const [vehicleType, setVehicleType] = useState('bus');
  const [capacity, setCapacity] = useState('40');
  const [fuelType, setFuelType] = useState('diesel');

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [staffType, setStaffType] = useState('driver');
  const [phone, setPhone] = useState('');
  const [licenceNo, setLicenceNo] = useState('');

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeCode, setRouteCode] = useState('');
  const [startLoc, setStartLoc] = useState('');

  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, sRes, rRes, aRes, mRes, fRes] = await Promise.all([
        api.get('/principal/transport/vehicles'),
        api.get('/principal/transport/staff'),
        api.get('/principal/transport/routes'),
        api.get('/principal/transport/assignments'),
        api.get('/principal/transport/maintenance'),
        api.get('/principal/transport/fuel-logs'),
      ]);

      if (vRes.data.success) setVehicles(vRes.data.vehicles || []);
      if (sRes.data.success) setStaff(sRes.data.staff || []);
      if (rRes.data.success) setRoutes(rRes.data.routes || []);
      if (aRes.data.success) setAssignments(aRes.data.assignments || []);
      if (mRes.data.success) setMaintenance(mRes.data.logs || []);
      if (fRes.data.success) setFuelLogs(fRes.data.logs || []);
    } catch (err) {
      console.error('Fetch transport data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/transport/vehicles', {
        vehicleNumber: vehicleNo,
        registrationNumber: regNo,
        vehicleType,
        seatingCapacity: Number(capacity),
        fuelType,
      });
      if (res.data.success) {
        setIsVehicleModalOpen(false);
        setVehicleNo('');
        setRegNo('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add vehicle.');
    }
  };

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
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add staff.');
    }
  };

  const activeVehiclesCount = vehicles.filter((v) => v.status === 'active').length;
  const activeRoutesCount = routes.filter((r) => r.status === 'active' || r.status === 'draft').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'maintenance').length;
  const activeAssignmentsCount = assignments.filter((a) => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Fleet & Logistics Management</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Transport Management
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage vehicles, drivers, route stops, student assignments, maintenance, fuel logs, and fleet reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVehicleModalOpen(true)}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-almond/40 pb-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'dashboard', label: 'Overview', icon: BarChart2 },
              { id: 'vehicles', label: 'Vehicles Fleet', icon: Bus },
              { id: 'routes', label: 'Routes & Stops', icon: MapPin },
              { id: 'assignments', label: 'Student Assignments', icon: Navigation },
              { id: 'maintenance', label: 'Maintenance Logs', icon: Wrench },
              { id: 'fuel', label: 'Fuel Logs', icon: Fuel },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'bg-white text-textMuted hover:bg-surface hover:text-darkBrown border border-almond/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard title="Active Vehicles" value={activeVehiclesCount} subtitle={`Total Fleet: ${vehicles.length}`} icon={Bus} color="chestnut" />
                <StatCard title="Active Routes" value={activeRoutesCount} subtitle="Pickup & Drop routes" icon={MapPin} color="morning" />
                <StatCard title="Assigned Students" value={activeAssignmentsCount} subtitle="Transport users" icon={Navigation} color="success" />
                <StatCard title="Maintenance Vehicles" value={maintenanceCount} subtitle="Service / Repairs" icon={Wrench} color="warning" />
              </div>

              {/* Status Alert Banner */}
              <div className="p-4 bg-morning/10 rounded-2xl border border-morning/30 flex items-center justify-between text-xs text-darkBrown">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-morning shrink-0" />
                  <div>
                    <strong className="block font-bold">GPS Provider Status: Unconfigured</strong>
                    <span className="text-textMuted">Live GPS telemetry tracking provider integration coming soon.</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white border border-almond rounded-xl font-mono text-[10px] font-bold text-morning">
                  GPS Abstraction Active
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: VEHICLES FLEET */}
          {activeTab === 'vehicles' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Transport Fleet Directory ({vehicles.length})</h3>

              {loading ? (
                <LoadingSkeleton count={4} />
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">No transport vehicles added yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                        <th className="py-3 px-4">Vehicle No</th>
                        <th className="py-3 px-4">Registration</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Capacity</th>
                        <th className="py-3 px-4">Fuel</th>
                        <th className="py-3 px-4">Odometer</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-almond/20">
                      {vehicles.map((v) => (
                        <tr key={v._id} className="hover:bg-surface/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-darkBrown font-mono">{v.vehicleNumber}</td>
                          <td className="py-3 px-4 text-textMuted font-mono">{v.registrationNumber}</td>
                          <td className="py-3 px-4 uppercase font-bold text-chestnut">{v.vehicleType}</td>
                          <td className="py-3 px-4 font-bold">{v.seatingCapacity} Seats</td>
                          <td className="py-3 px-4 uppercase text-textMuted">{v.fuelType}</td>
                          <td className="py-3 px-4 font-mono">{v.currentOdometer} km</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              v.status === 'active' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DRIVERS & ATTENDANTS */}
          {activeTab === 'staff' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Drivers & Attendants Staff ({staff.length})</h3>

              {staff.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">No transport staff added yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  {staff.map((s) => (
                    <div key={s._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut uppercase">
                          {s.staffType}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'active' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-darkBrown text-sm">{s.name}</h4>
                      <div className="text-textMuted font-mono text-[11px]">Emp Code: {s.employeeCode}</div>
                      <div className="text-textMuted">Phone: {s.phone}</div>
                      {s.licenceNumber && (
                        <div className="pt-2 border-t border-almond/30 font-mono text-[11px] text-darkBrown">
                          Licence: <strong>{s.licenceNumber}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ROUTES & STOPS */}
          {activeTab === 'routes' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Transport Routes Directory ({routes.length})</h3>

              {routes.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">No routes created yet.</div>
              ) : (
                <div className="space-y-3">
                  {routes.map((r) => (
                    <div key={r._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-darkBrown">
                        <span>{r.name} ({r.code})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-chestnut/15 text-chestnut">
                          {r.routeType}
                        </span>
                      </div>
                      <div className="text-textMuted">Start: {r.startLocation || 'N/A'} $\rightarrow$ End: {r.endLocation}</div>
                      <div className="flex items-center gap-4 text-textMuted font-mono text-[11px] pt-2 border-t border-almond/30">
                        <span>Max Capacity: {r.maximumStudents}</span>
                        <span>Vehicle: {r.assignedVehicleId?.vehicleNumber || 'Unassigned'}</span>
                        <span>Driver: {r.assignedDriverId?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STUDENT ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Active Student Assignments ({assignments.length})</h3>

              {assignments.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">No student transport assignments yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Route</th>
                        <th className="py-3 px-4">Pickup Stop</th>
                        <th className="py-3 px-4">Monthly Fee</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-almond/20">
                      {assignments.map((a) => (
                        <tr key={a._id} className="hover:bg-surface/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-darkBrown">{a.studentId?.name}</td>
                          <td className="py-3 px-4 text-textMuted">{a.studentId?.classId?.name}</td>
                          <td className="py-3 px-4 font-bold text-chestnut">{a.routeId?.name}</td>
                          <td className="py-3 px-4 text-textMuted">{a.pickupStopId?.name || 'N/A'}</td>
                          <td className="py-3 px-4 font-mono">₹{(a.monthlyFeeMinor / 100).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-success/15 text-success">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ADD VEHICLE MODAL */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Add Transport Vehicle</h3>
            {formError && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUS-101"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-AB-1234"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Type *</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold uppercase"
                  >
                    <option value="bus">Bus</option>
                    <option value="miniBus">Mini Bus</option>
                    <option value="van">Van</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Seating Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Add Transport Staff</h3>
            {formError && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Staff Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DRV-01"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Role *</label>
                  <select
                    value={staffType}
                    onChange={(e) => setStaffType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold uppercase"
                  >
                    <option value="driver">Driver</option>
                    <option value="attendant">Attendant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              {staffType === 'driver' && (
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Licence Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-1420110012345"
                    value={licenceNo}
                    onChange={(e) => setLicenceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono uppercase"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalTransportPage;
