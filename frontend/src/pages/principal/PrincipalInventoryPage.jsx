import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Package,
  Boxes,
  Truck,
  Plus,
  ArrowRightLeft,
  DollarSign,
  BarChart2,
  Tag,
  AlertTriangle,
  Wrench,
  FileText,
} from 'lucide-react';

const PrincipalInventoryPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'assets' | 'consumables' | 'categories' | 'vendors' | 'assignments'
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [assets, setAssets] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Modal States
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetTag, setAssetTag] = useState('');
  const [assetName, setAssetName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');

  const [isConsumableModalOpen, setIsConsumableModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('pcs');
  const [reorderLevel, setReorderLevel] = useState(10);
  const [initialStock, setInitialStock] = useState(0);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');

  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');

  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aRes, cRes, catRes, vRes, asgRes] = await Promise.all([
        api.get('/principal/inventory/assets'),
        api.get('/principal/inventory/consumables'),
        api.get('/principal/inventory/categories'),
        api.get('/principal/inventory/vendors'),
        api.get('/principal/inventory/assignments'),
      ]);

      if (aRes.data.success) setAssets(aRes.data.assets || []);
      if (cRes.data.success) setConsumables(cRes.data.items || []);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (vRes.data.success) setVendors(vRes.data.vendors || []);
      if (asgRes.data.success) setAssignments(asgRes.data.assignments || []);
    } catch (err) {
      console.error('Fetch inventory data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/inventory/assets', {
        assetTag,
        name: assetName,
        categoryId: selectedCatId,
        vendorId: selectedVendorId || undefined,
        location,
        purchaseCost: Number(purchaseCost || 0),
      });
      if (res.data.success) {
        setIsAssetModalOpen(false);
        setAssetTag('');
        setAssetName('');
        setLocation('');
        setPurchaseCost('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add asset.');
    }
  };

  const handleCreateConsumable = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/inventory/consumables', {
        name: itemName,
        itemCode,
        unitOfMeasure,
        reorderLevel: Number(reorderLevel),
        initialStock: Number(initialStock),
      });
      if (res.data.success) {
        setIsConsumableModalOpen(false);
        setItemName('');
        setItemCode('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add consumable.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/inventory/categories', {
        name: catName,
        code: catCode,
      });
      if (res.data.success) {
        setIsCategoryModalOpen(false);
        setCatName('');
        setCatCode('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add category.');
    }
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/inventory/vendors', {
        name: vendorName,
        vendorCode,
        contactPerson,
        phone,
      });
      if (res.data.success) {
        setIsVendorModalOpen(false);
        setVendorName('');
        setVendorCode('');
        setContactPerson('');
        setPhone('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add vendor.');
    }
  };

  const lowStockItems = consumables.filter((c) => c.isLowStock);
  const assignedAssetsCount = assets.filter((a) => a.status === 'assigned').length;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Asset & Logistics Console</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Inventory & Asset Management
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage fixed school assets, barcode asset tags, vendors, consumable stock levels, maintenance, and checkouts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAssetModalOpen(true)}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fixed Asset</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-almond/40 pb-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'dashboard', label: 'Overview', icon: BarChart2 },
              { id: 'assets', label: 'Fixed Assets', icon: Package },
              { id: 'consumables', label: 'Consumable Stock', icon: Boxes },
              { id: 'categories', label: 'Categories', icon: Tag },
              { id: 'vendors', label: 'Vendors', icon: Truck },
              { id: 'assignments', label: 'Asset Checkouts', icon: ArrowRightLeft },
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
                <StatCard title="Total Assets" value={assets.length} subtitle="Fixed assets tracked" icon={Package} color="chestnut" />
                <StatCard title="Assigned Assets" value={assignedAssetsCount} subtitle="Currently checked out" icon={ArrowRightLeft} color="morning" />
                <StatCard title="Consumables" value={consumables.length} subtitle="Tracked stock items" icon={Boxes} color="success" />
                <StatCard title="Low Stock Alerts" value={lowStockItems.length} subtitle="Reorder required" icon={AlertTriangle} color="warning" />
              </div>

              {/* Low Stock Warning Alert */}
              {lowStockItems.length > 0 && (
                <div className="bg-warning/10 border border-warning/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-darkBrown text-sm">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                    <span>Low Stock Items Requiring Reorder ({lowStockItems.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {lowStockItems.map((item) => (
                      <div key={item._id} className="p-3 bg-white rounded-xl border border-warning/20 space-y-1">
                        <div className="font-bold text-darkBrown">{item.name}</div>
                        <div className="text-textMuted font-mono text-[11px]">
                          Stock: <span className="font-bold text-warning">{item.currentStock} {item.unitOfMeasure}</span> (Reorder @ {item.reorderLevel})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FIXED ASSETS */}
          {activeTab === 'assets' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Fixed Assets Directory ({assets.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                      <th className="py-3 px-4">Asset Tag</th>
                      <th className="py-3 px-4">Asset Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Depreciated Value</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20">
                    {assets.map((a) => (
                      <tr key={a._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-bold font-mono text-chestnut">{a.assetTag}</td>
                        <td className="py-3 px-4 font-bold text-darkBrown">{a.name}</td>
                        <td className="py-3 px-4 font-mono text-textMuted">{a.categoryId?.name || 'General'}</td>
                        <td className="py-3 px-4 text-textMuted">{a.location || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-darkBrown">
                          ₹{(a.currentValueMinor / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.status === 'available' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONSUMABLES */}
          {activeTab === 'consumables' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown">Consumable Stock Directory ({consumables.length})</h3>
                <button
                  onClick={() => setIsConsumableModalOpen(true)}
                  className="px-3.5 py-1.5 bg-chestnut text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Consumable Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {consumables.map((c) => (
                  <div key={c._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2">
                    <div className="flex items-center justify-between font-bold text-darkBrown">
                      <span>{c.name}</span>
                      <span className="font-mono text-[10px] text-chestnut bg-chestnut/10 px-2 py-0.5 rounded">{c.itemCode}</span>
                    </div>
                    <div className="text-textMuted font-mono text-[11px]">
                      Current Stock: <span className="font-bold text-darkBrown">{c.currentStock} {c.unitOfMeasure}</span>
                    </div>
                    <div className="text-textMuted text-[10px]">Reorder Level: {c.reorderLevel} {c.unitOfMeasure}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown">Asset Categories ({categories.length})</h3>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-3.5 py-1.5 bg-chestnut text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {categories.map((cat) => (
                  <div key={cat._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-1">
                    <div className="flex items-center justify-between font-bold text-darkBrown">
                      <span>{cat.name}</span>
                      <span className="font-mono text-[10px] text-chestnut bg-chestnut/10 px-2 py-0.5 rounded">{cat.code}</span>
                    </div>
                    <div className="text-textMuted text-[11px]">Depreciation: {cat.depreciationRate}% / year</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VENDORS */}
          {activeTab === 'vendors' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown">Vendor Directory ({vendors.length})</h3>
                <button
                  onClick={() => setIsVendorModalOpen(true)}
                  className="px-3.5 py-1.5 bg-chestnut text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Vendor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {vendors.map((v) => (
                  <div key={v._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-1">
                    <div className="flex items-center justify-between font-bold text-darkBrown">
                      <span>{v.name}</span>
                      <span className="font-mono text-[10px] text-chestnut bg-chestnut/10 px-2 py-0.5 rounded">{v.vendorCode}</span>
                    </div>
                    <div className="text-textMuted text-[11px]">Contact: {v.contactPerson || 'N/A'}</div>
                    <div className="text-textMuted font-mono text-[11px]">Phone: {v.phone || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD ASSET MODAL */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Add Fixed Asset Item</h3>
            {formError && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Asset Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TAG-IT-001"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell OptiPlex Desktop"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Category *</label>
                <select
                  required
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Location / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Lab 1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Purchase Cost (₹)</label>
                <input
                  type="number"
                  placeholder="45000"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalInventoryPage;
