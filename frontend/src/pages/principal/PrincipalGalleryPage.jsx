import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import {
  Image,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Calendar,
  Tag,
  Layers,
  Search,
  X,
  Upload,
  ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';

const PrincipalGalleryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'events',
    eventDate: new Date().toISOString().split('T')[0],
    visibility: 'public',
    sortOrder: 0,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/gallery');
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load gallery', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      category: 'events',
      eventDate: new Date().toISOString().split('T')[0],
      visibility: 'public',
      sortOrder: 0,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl,
      category: item.category || 'events',
      eventDate: item.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : '',
      visibility: item.visibility || 'public',
      sortOrder: item.sortOrder || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      if (editingItem) {
        const res = await api.put(`/principal/gallery/${editingItem._id}`, formData);
        if (res.data.success) {
          setMessage({ type: 'success', text: 'Gallery item updated successfully!' });
          setShowModal(false);
          fetchGallery();
        }
      } else {
        const res = await api.post('/principal/gallery', formData);
        if (res.data.success) {
          setMessage({ type: 'success', text: 'Gallery item created successfully!' });
          setShowModal(false);
          fetchGallery();
        }
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save gallery item.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo from the gallery?')) return;
    try {
      const res = await api.delete(`/principal/gallery/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Item deleted successfully.' });
        fetchGallery();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete gallery item.' });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-almond/40 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight flex items-center space-x-2">
                <Image className="w-6 h-6 text-chestnut" />
                <span>School Gallery & Event Showcase</span>
              </h1>
              <p className="text-xs text-textMuted mt-1">
                Manage photos of events, activities, campus infrastructure, and achievements.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Photo</span>
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

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-almond/60 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Photos' },
            { id: 'events', label: 'Events' },
            { id: 'activities', label: 'Activities' },
            { id: 'infrastructure', label: 'Infrastructure' },
            { id: 'achievements', label: 'Achievements' },
            { id: 'general', label: 'General' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-chestnut text-white shadow-sm'
                  : 'bg-surface text-textMuted hover:text-darkBrown hover:bg-almond/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-12 text-center text-textMuted text-sm">Loading gallery items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-almond/60 text-center">
          <Image className="w-12 h-12 text-textMuted mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-darkBrown">No Photos Found</h3>
          <p className="text-xs text-textMuted mt-1">Add your first photo to highlight school activities!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-almond/60 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-44 bg-surface overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold rounded-lg capitalize">
                  {item.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-darkBrown line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-textMuted mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-almond/40 flex items-center justify-between">
                  <span className="text-[11px] text-textMuted flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.eventDate).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-textMuted hover:text-darkBrown hover:bg-surface rounded-lg transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex justify-between items-center border-b border-almond/40 pb-3">
              <h3 className="text-base font-bold text-darkBrown">
                {editingItem ? 'Edit Gallery Photo' : 'Add New Photo to Gallery'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-textMuted hover:text-darkBrown rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Photo Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Day 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  >
                    <option value="events">Events</option>
                    <option value="activities">Activities</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="achievements">Achievements</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Event Date</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Provide details about this photo or event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-surface border border-almond/60 rounded-xl text-textMain hover:bg-almond/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-chestnut hover:bg-darkBrown text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Photo' : 'Add Photo'}
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

export default PrincipalGalleryPage;
